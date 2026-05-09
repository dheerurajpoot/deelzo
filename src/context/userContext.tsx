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

	useEffect(() => {
		// Check if user is logged in using Firebase listener
		const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
			try {
				if (firebaseUser) {
					let userData = await userService.getUser(firebaseUser.uid);
                    
                    // Fallback to email if user not found by UID (migrated users)
                    if (!userData && firebaseUser.email) {
                        userData = await userService.getUserByEmail(firebaseUser.email);
                        // Optional: Link the UID to this user record if found
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
