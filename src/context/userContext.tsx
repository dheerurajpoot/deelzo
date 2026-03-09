"use client";

import {
	createContext,
	useContext,
	useState,
	useEffect,
	type ReactNode,
} from "react";
import axios from "axios";

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
		// Check if user is logged in
		const checkAuth = async () => {
			try {
				const storedUser = localStorage.getItem("user");
				if (storedUser) {
					const parsedUser = JSON.parse(storedUser);
					const loggedInUser = await axios.get(
						`/api/users/${parsedUser._id}`
					);
					if (loggedInUser.status === 200) {
						setUser(loggedInUser.data);
					}

					if (parsedUser.role === "admin") {
						document.cookie = `userRole=admin; path=/; max-age=${
							60 * 60 * 24 * 30
						}`; // 30 days
					}
				}
			} catch (error) {
				console.error("Auth check failed:", error);
			} finally {
				setLoading(false);
			}
		};

		checkAuth();
	}, []);

	const signOut = async () => {
		try {
			setLoading(true);
			await axios.get("/api/auth/signout");
			localStorage.removeItem("user");
			document.cookie = "session=; path=/; max-age=0";
			document.cookie = "userRole=; path=/; max-age=0";
			window.location.reload();
			setUser(null);
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				const errorMessage =
					error.response?.data?.message || "Logout failed";
				console.error("Sign out failed:", errorMessage);
			} else if (error instanceof Error) {
				console.error("Sign out failed:", error.message);
			} else {
				console.error("Sign out failed: Unknown error");
			}
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
