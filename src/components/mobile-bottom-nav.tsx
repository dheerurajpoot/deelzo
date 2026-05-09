"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Plus, User, LayoutDashboard, BookOpen, TrendingUp, FileText, Users, Mail, CreditCard, CheckCircle, ShoppingBag } from "lucide-react";
import { userContext } from "@/context/userContext";

// Icon mapping for dynamic usage
const iconMap: { [key: string]: React.ComponentType<{ size?: number; className?: string }> } = {
	Home,
	Search,
	Plus,
	User,
	LayoutDashboard,
	BookOpen,
	TrendingUp,
	FileText,
	Users,
	Mail,
	CreditCard,
	CheckCircle,
};

export default function MobileBottomNav() {
	const pathname = usePathname();
	const { user } = userContext();

	// Hide on auth pages
	if (
		pathname?.includes("/login") ||
		pathname?.includes("/signup") ||
		pathname?.includes("/forgot-password") ||
		pathname?.includes("/reset-password")
	) {
		return null;
	}

	// Determine if user is on admin or dashboard pages
	const isAdminPage = pathname?.includes("/admin");
	const isDashboardPage = pathname?.includes("/dashboard");

	// Public navigation items (for non-logged in users or public pages)
	const publicNavItems = [
		{ icon: Home, label: "Home", href: "/" },
		{ icon: Search, label: "Browse", href: "/marketplace" },
		{ icon: Plus, label: "Sell", href: "/login" },
		{ icon: User, label: "Profile", href: "/login" },
	];

	// Admin navigation items
	const adminNavItems = [
		{ icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
		{ icon: FileText, label: "Listings", href: "/admin/listings" },
		{ icon: Users, label: "Users", href: "/admin/users" },
		{ icon: BookOpen, label: "Blogs", href: "/admin/blogs" },
		{ icon: ShoppingBag, label: "Orders", href: "/admin/orders" },
		{ icon: User, label: "Account", href: "/dashboard/profile" },
	];

	// User dashboard navigation items
	const userNavItems = [
		{ icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
		{ icon: Plus, label: "Listings", href: "/dashboard/listings" },
		{ icon: BookOpen, label: "Blogs", href: "/dashboard/blogs" },
		{ icon: ShoppingBag, label: "Orders", href: "/dashboard/orders" },
		{ icon: User, label: "Profile", href: "/dashboard/profile" },
	];

	// Select navigation items based on user state and current page
	let navItems = publicNavItems;
	let themeColor = "sky";

	if (user) {
		if (isAdminPage || user.role === "admin") {
			navItems = adminNavItems;
			themeColor = "sky";
		} else {
			navItems = userNavItems;
			themeColor = "emerald";
		}
	}

	// Limit to 5 items for mobile bottom nav
	const displayNavItems = navItems.slice(0, 5);

	const getActiveStyles = (isActive: boolean, color: string) => {
		if (color === "emerald") {
			return {
				text: isActive ? "text-emerald-600" : "text-slate-500 hover:text-slate-700",
				bg: isActive ? "bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg shadow-emerald-500/20" : "hover:bg-slate-50",
				indicator: "bg-gradient-to-r from-emerald-500 to-teal-500",
			};
		}
		return {
			text: isActive ? "text-sky-600" : "text-slate-500 hover:text-slate-700",
			bg: isActive ? "bg-gradient-to-br from-sky-50 to-blue-50 shadow-lg shadow-sky-500/20" : "hover:bg-slate-50",
			indicator: "bg-gradient-to-r from-sky-500 to-blue-500",
		};
	};

	return (
		<nav className='fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-slate-200 shadow-2xl md:hidden z-50'>
			<div className='flex justify-around items-center h-20 px-1 pb-safe'>
				{displayNavItems.map((item, index) => {
					const Icon = item.icon;
					// For root paths like /admin or /dashboard, only match exact
					// For sub-paths, match if pathname starts with the href
					const isRootPath = item.href === "/admin" || item.href === "/dashboard";
					const isActive = isRootPath
						? pathname === item.href
						: pathname === item.href || pathname?.startsWith(item.href + "/");
					const styles = getActiveStyles(isActive, themeColor);

					return (
						<Link
							key={index}
							href={item.href}
							className={`relative flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-200 ${styles.text}`}>
							{isActive && (
								<div className={`absolute top-0 left-1/2 transform -translate-x-1/2 w-10 h-1 ${styles.indicator} rounded-b-full`} />
							)}
							<div
								className={`relative p-2 rounded-xl transition-all duration-200 ${styles.bg}`}>
								<Icon
									size={20}
									className={`transition-transform duration-200 ${
										isActive ? "scale-110" : ""
									}`}
								/>
							</div>
							<span
								className={`text-[10px] font-semibold transition-all duration-200 ${
									isActive ? (themeColor === "emerald" ? "text-emerald-600" : "text-sky-600") : "text-slate-500"
								}`}>
								{item.label}
							</span>
						</Link>
					);
				})}
			</div>
		</nav>
	);
}
