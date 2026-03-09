"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	LayoutDashboard,
	FileText,
	Users,
	LogOut,
	Mail,
	Shield,
	ChevronRight,
	BookOpen,
	CreditCard,
	CheckCircle,
	Plus,
	TrendingUp,
	User,
	ShoppingBag,
	ShoppingBasket,
	Tag,
} from "lucide-react";
import { userContext } from "@/context/userContext";
import Image from "next/image";

interface AdminSidebarProps {
	role?: "admin" | "user";
}

// Export menu items so they can be used by mobile-bottom-nav
export const adminMenuItems = [
	{ icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
	{ icon: FileText, label: "Listings", href: "/admin/listings" },
	{ icon: ShoppingBag, label: "Products", href: "/admin/products" },
	{ icon: ShoppingBasket, label: "Orders", href: "/admin/orders" },
	{ icon: Tag, label: "Coupons", href: "/admin/coupons" },
	{ icon: Users, label: "Users", href: "/admin/users" },
	{ icon: Mail, label: "Emails", href: "/admin/emails" },
	{ icon: BookOpen, label: "Blogs", href: "/admin/blogs" },
	{ icon: CreditCard, label: "Plans", href: "/admin/plans" },
	{
		icon: CheckCircle,
		label: "Verifications",
		href: "/admin/verifications",
	},
];

export const userMenuItems = [
	{ icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
	{ icon: Plus, label: "Listings", href: "/dashboard/listings" },
	{ icon: ShoppingBag, label: "Orders", href: "/dashboard/orders" },
	{ icon: BookOpen, label: "My Blogs", href: "/dashboard/blogs" },
	{ icon: TrendingUp, label: "Upgrade Plan", href: "/dashboard/upgrade" },
	{ icon: User, label: "Profile", href: "/dashboard/profile" },
];

export default function AdminSidebar({ role = "admin" }: AdminSidebarProps) {
	const { signOut, user } = userContext();
	const pathname = usePathname();

	const isAdmin = role === "admin" || user?.role === "admin";

	const menuItems = isAdmin ? adminMenuItems : userMenuItems;

	const handleLogout = async () => {
		await signOut();
		window.location.href = "/";
	};

	return (
		<>
			{/* Sidebar - Always visible on desktop (md+), hidden on mobile */}
			<aside
				className='fixed left-0 top-0 h-screen w-64 bg-linear-to-b from-slate-50 via-white to-slate-50 border-r border-slate-200/80 shadow-xl p-6 z-40 hidden md:block'>
				{/* Logo Section */}
				<div className='mb-8'>
					<Link href='/' className='block mb-10'>
						<Image
							src='/plogo.png'
							alt='Deelzo'
							width={120}
							height={120}
							className='transition-transform hover:scale-105'
						/>
					</Link>

					{/* User Profile Section */}
					{user && (
						<div className={`rounded-xl p-4 border shadow-sm ${
							isAdmin 
								? "bg-linear-to-br from-sky-50 to-blue-50 border-sky-100/50" 
								: "bg-linear-to-br from-emerald-50 to-teal-50 border-emerald-100/50"
						}`}>
							<div className='flex items-center gap-3'>
								<div className='relative'>
									<div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md ${
										isAdmin
											? "bg-linear-to-br from-sky-400 to-blue-500"
											: "bg-linear-to-br from-emerald-400 to-teal-500"
									}`}>
										{user.name?.charAt(0).toUpperCase() ||
											"U"}
									</div>
									<div className='absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-sm'></div>
								</div>
								<div className='flex-1 min-w-0'>
									<p className='font-semibold text-slate-900 truncate text-sm'>
										{user.name || "User"}
									</p>
									<div className='flex items-center gap-1 mt-0.5'>
										<Shield
											size={12}
											className={isAdmin ? "text-sky-500" : "text-emerald-500"}
										/>
										<p className='text-xs text-slate-600 truncate'>
											{isAdmin ? "Administrator" : "Member"}
										</p>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Menu Items */}
				<nav className='space-y-1.5 mb-8 flex-1'>
					{menuItems.map((item) => {
						const Icon = item.icon;
						// For root paths like /admin or /dashboard, only match exact
						// For sub-paths like /admin/listings, match if pathname starts with the href
						const isRootPath = item.href === "/admin" || item.href === "/dashboard";
						const isActive = isRootPath 
							? pathname === item.href 
							: pathname === item.href || pathname.startsWith(item.href + "/");
						return (
							<Link key={`${item.label}-${item.href}`} href={item.href}>
								<Button
									variant='ghost'
									className={`w-full justify-start cursor-pointer gap-3 h-11 relative group transition-all duration-200 ${
										isActive
											? isAdmin
												? "bg-linear-to-r from-sky-500 to-blue-500 text-white shadow-lg shadow-sky-500/30 hover:from-sky-600 hover:to-blue-600"
												: "bg-linear-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 hover:from-emerald-600 hover:to-teal-600"
											: "text-slate-700 hover:text-slate-900 hover:bg-slate-100/80"
										}`}>
									<Icon
										size={20}
										className={`transition-transform group-hover:scale-110 ${
											isActive
												? "text-white"
												: "text-slate-600 group-hover:text-slate-900"
										}`}
									/>
									<span className='font-medium'>
										{item.label}
									</span>
									{isActive && (
										<ChevronRight
											size={16}
											className='ml-auto text-white opacity-80'
										/>
									)}
									{isActive && (
										<div className='absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full'></div>
									)}
								</Button>
							</Link>
						);
					})}
				</nav>

				{/* Logout Button */}
				<div className='absolute bottom-6 left-6 right-6'>
					<Button
						onClick={handleLogout}
						className='w-full cursor-pointer bg-linear-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white gap-2 shadow-lg shadow-rose-500/20 transition-all duration-200 h-11 font-medium'>
						<LogOut size={20} />
						<span>Logout</span>
					</Button>
				</div>
			</aside>
		</>
	);
}
