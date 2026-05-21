"use client";

import {
	createContext,
	useContext,
	useState,
	useEffect,
	type ReactNode,
} from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { userService } from "@/services/userService";
import { loginAction, logoutAction } from "@/app/actions/authActions";
import { usePathname } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import PhoneInput from "react-phone-number-input";

export interface User {
	_id: string;
	name: string;
	email: string;
	avatar: string;
	phone: string;
	role: "user" | "admin";
	token?: string;
	totalListings: number;
	totalSales: number;
	listings: [];
	totalEarnings: number;
	isActive: string;
	isEmailVerified: boolean;
	createdAt: string;
	currentPlan?: string;
}

interface AuthContextType {
	user: User | null;
	loading: boolean;
	setUser: (user: User | null) => void;
	signOut: () => Promise<void>;
	isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const pathname = usePathname();
	const [completeProfileOpen, setCompleteProfileOpen] = useState(false);
	const [profileSaving, setProfileSaving] = useState(false);
	const [profileForm, setProfileForm] = useState({
		phone: "",
		name: "",
		location: "",
		company: "",
	});

	useEffect(() => {
		// Check if user is logged in using Firebase listener
		const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
			try {
				if (firebaseUser) {
					let userData = await userService.getUser(firebaseUser.uid);
                    
                    // Fallback to email if user not found by UID (migrated users)
                    if (!userData && firebaseUser.email) {
                        userData = await userService.getUserByEmail(firebaseUser.email);
                    }

                    // Sync email verification status
                    if (firebaseUser.emailVerified && userData && !userData.isEmailVerified) {
                        await userService.updateUserProfile(firebaseUser.uid, { isEmailVerified: true });
                        userData.isEmailVerified = true;
                    }
                    
					setUser(userData);
                    
                    // Sync cookies for middleware if not already set
                    const idToken = await firebaseUser.getIdToken();
                    await loginAction(idToken);

					if (userData?.role === "admin") {
						document.cookie = `userRole=admin; path=/; max-age=${
							60 * 60 * 24 * 30
						}`;
					}
				} else {
					setUser(null);
                    localStorage.removeItem("user");
				}
			} catch (error) {
				console.error("Auth check failed:", error);
			} finally {
				setLoading(false);
			}
		});

		return () => unsubscribe();
	}, []);

	useEffect(() => {
		if (!user) {
			setCompleteProfileOpen(false);
			return;
		}

		const isDashboardRoute = pathname?.startsWith("/dashboard");
		if (!isDashboardRoute) {
			setCompleteProfileOpen(false);
			return;
		}

		const hasPhone = Boolean(user.phone && user.phone.trim().length > 0);
		if (!hasPhone) {
			setProfileForm((prev) => ({
				...prev,
				phone: "",
				name: user.name || "",
				location: (user as any).location || "",
				company: (user as any).company || "",
			}));
			setCompleteProfileOpen(true);
		} else {
			setCompleteProfileOpen(false);
		}
	}, [user?._id, user?.phone, pathname]);

	const handleCompleteProfileSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user) return;

		const phone = profileForm.phone?.trim();
		if (!phone) {
			toast.error("Phone number is required");
			return;
		}

		setProfileSaving(true);
		try {
			await userService.updateUserProfile(user._id, {
				phone,
				name: profileForm.name || user.name,
				location: profileForm.location || "",
				company: profileForm.company || "",
			});

			const nextUser = {
				...user,
				phone,
				name: profileForm.name || user.name,
				location: profileForm.location || "",
				company: profileForm.company || "",
			} as any;

			setUser(nextUser);
			localStorage.setItem("user", JSON.stringify(nextUser));
			toast.success("Profile completed");
			setCompleteProfileOpen(false);
		} catch (error) {
			toast.error("Failed to update profile");
		} finally {
			setProfileSaving(false);
		}
	};

	const signOut = async () => {
		try {
			setLoading(true);
            await firebaseSignOut(auth);
			await logoutAction();
			localStorage.removeItem("user");
			document.cookie = "token=; path=/; max-age=0";
			document.cookie = "userRole=; path=/; max-age=0";
			setUser(null);
			window.location.href = "/login";
		} catch (error) {
			console.error("Sign out failed:", error);
		} finally {
			setLoading(false);
		}
	};

	const isAdmin = () => {
		return user?.role === "admin";
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				loading,
				setUser,
				signOut,
				isAdmin,
			}}>
			<Dialog
				open={completeProfileOpen}
				onOpenChange={(nextOpen) => {
					if (!nextOpen && !(user?.phone && user.phone.trim().length > 0)) return;
					setCompleteProfileOpen(nextOpen);
				}}
			>
				<DialogContent showCloseButton={false} className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Complete your profile</DialogTitle>
						<DialogDescription>
							Phone number is required. Everything else is optional and can be updated later.
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleCompleteProfileSubmit} className="space-y-4">
						<div className="space-y-1.5">
							<Label htmlFor="complete-profile-phone">Phone</Label>
							<div className="flex items-center border border-input rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-ring">
								<PhoneInput
									id="complete-profile-phone"
									international
									defaultCountry="IN"
									value={profileForm.phone}
									onChange={(val) =>
										setProfileForm((prev) => ({ ...prev, phone: val || "" }))
									}
									className="flex-1 border-0 bg-transparent focus:ring-0 outline-none"
								/>
							</div>
						</div>

						<div className="space-y-1.5">
							<Label htmlFor="complete-profile-name">Name (optional)</Label>
							<Input
								id="complete-profile-name"
								value={profileForm.name}
								onChange={(e) =>
									setProfileForm((prev) => ({ ...prev, name: e.target.value }))
								}
							/>
						</div>

						<div className="space-y-1.5">
							<Label htmlFor="complete-profile-location">Location (optional)</Label>
							<Input
								id="complete-profile-location"
								value={profileForm.location}
								onChange={(e) =>
									setProfileForm((prev) => ({
										...prev,
										location: e.target.value,
									}))
								}
							/>
						</div>

						<div className="space-y-1.5">
							<Label htmlFor="complete-profile-company">Company (optional)</Label>
							<Input
								id="complete-profile-company"
								value={profileForm.company}
								onChange={(e) =>
									setProfileForm((prev) => ({
										...prev,
										company: e.target.value,
									}))
								}
							/>
						</div>

						<DialogFooter>
							<Button type="submit" disabled={profileSaving}>
								{profileSaving ? "Saving..." : "Save"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
			{children}
		</AuthContext.Provider>
	);
}

export function userContext() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
