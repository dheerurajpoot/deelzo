"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	Menu,
	X,
	LogOut,
	User,
	ShoppingBag,
	BookOpen,
	LayoutDashboard,
	Shield,
	Book,
	TrendingUp,
} from "lucide-react";
import { userContext } from "@/context/userContext";
import Image from "next/image";

export default function Navbar() {
	const router = useRouter();
	const pathname = usePathname();
	const [isOpen, setIsOpen] = useState(false);
	const { user, signOut } = userContext();

	const handleLogout = async () => {
		await signOut();
		router.push("/");
	};

	const navLinks = [
		{ href: "/shop", label: "Shop", icon: ShoppingBag },
		{ href: "/blogs", label: "Blogs", icon: Book },
		{ href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
		{ href: "/guide", label: "Guide", icon: BookOpen },
	];

	return (
		<nav className='sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-slate-200/80 shadow-lg shadow-slate-900/5'>
			<div className='max-w-7xl mx-auto px-4 md:px-6 lg:px-8'>
				<div className='flex justify-between items-center h-16 md:h-20'>
					{/* Logo */}
					<Link href='/' className='flex items-center gap-2 group'>
						<Image
							src='/plogo.png'
							alt='Deelzo'
							width={120}
							height={120}
							className='transition-transform duration-300 group-hover:scale-105'
						/>
					</Link>

					{/* Desktop Menu */}
					<div className='hidden md:flex items-center gap-1'>
						{navLinks.map((link) => {
							const Icon = link.icon;
							const isActive = pathname === link.href;
							return (
								<Link
									key={link.href}
									href={link.href}
									className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
										isActive
											? "text-sky-600 bg-linear-to-r from-sky-50 to-blue-50"
											: "text-slate-700 hover:text-sky-600 hover:bg-slate-50"
									}`}>
									<Icon
										size={16}
										className={
											isActive
												? "text-sky-600"
												: "text-slate-500"
										}
									/>
									<span>{link.label}</span>
									{isActive && (
										<div className='absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-linear-to-r from-sky-500 to-blue-500 rounded-full' />
									)}
								</Link>
							);
						})}
					</div>

					{/* Auth Buttons */}
					<div className='hidden md:flex items-center gap-3'>
						{user ? (
							<div className='flex items-center gap-3'>
								{user.role === "admin" && (
									<Link href='/admin'>
										<Button
											variant='outline'
											className='border-sky-200 text-sky-700 hover:bg-sky-50 gap-2'>
											<Shield size={16} />
											Admin
										</Button>
									</Link>
								)}
								<Link href='/dashboard'>
									<Button className='bg-linear-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white gap-2 shadow-lg shadow-sky-500/20'>
										<LayoutDashboard size={16} />
										Dashboard
									</Button>
								</Link>
								<Button
									onClick={handleLogout}
									variant='outline'
									size='icon'
									className='border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200'>
									<LogOut size={18} />
								</Button>
							</div>
						) : (
							<div className='flex items-center gap-2'>
								<Link href='/login'>
									<Button
										variant='outline'
										className='border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200'>
										Login
									</Button>
								</Link>
								<Link href='/signup'>
									<Button className='bg-linear-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white shadow-lg shadow-sky-500/20 transition-all duration-200'>
										Sign Up
									</Button>
								</Link>
							</div>
						)}
					</div>

					{/* Mobile Menu */}
					<div className='md:hidden flex items-center gap-2'>
						{user && (
							<Link href='/dashboard'>
								<Button
									variant='ghost'
									size='icon'
									className='text-slate-600 hover:bg-slate-100'>
									<LayoutDashboard size={20} />
								</Button>
							</Link>
						)}
						<Button
							variant='ghost'
							size='icon'
							onClick={() => setIsOpen(!isOpen)}
							className='text-slate-600 hover:bg-slate-100'>
							{isOpen ? <X size={24} /> : <Menu size={24} />}
						</Button>
					</div>
				</div>

				{/* Mobile Menu Dropdown */}
				{isOpen && (
					<div className='md:hidden border-t border-slate-200 bg-white'>
						<div className='px-4 py-4 space-y-1'>
							{navLinks.map((link) => {
								const Icon = link.icon;
								const isActive = pathname === link.href;
								return (
									<Link
										key={link.href}
										href={link.href}
										onClick={() => setIsOpen(false)}
										className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
											isActive
												? "text-sky-600 bg-linear-to-r from-sky-50 to-blue-50"
												: "text-slate-700 hover:bg-slate-50"
										}`}>
										<Icon size={18} />
										<span>{link.label}</span>
									</Link>
								);
							})}
							<div className='border-t border-slate-200 my-2' />
							{user ? (
								<>
									<Link
										href={`/profile/${user?._id}`}
										onClick={() => setIsOpen(false)}
										className='flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all duration-200'>
										<User size={18} />
										<span>Profile</span>
									</Link>
									<Link
										href={`/dashboard/upgrade`}
										onClick={() => setIsOpen(false)}
										className='flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all duration-200'>
										<TrendingUp size={18} />
										<span>Upgrade</span>
									</Link>
									{user.role === "admin" && (
										<Link
											href='/admin'
											onClick={() => setIsOpen(false)}
											className='flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-sky-700 hover:bg-sky-50 transition-all duration-200'>
											<Shield size={18} />
											<span>Admin Panel</span>
										</Link>
									)}
									<button
										onClick={() => {
											setIsOpen(false);
											handleLogout();
										}}
										className='w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 transition-all duration-200'>
										<LogOut size={18} />
										<span>Logout</span>
									</button>
								</>
							) : (
								<>
									<Link
										href='/login'
										onClick={() => setIsOpen(false)}
										className='flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all duration-200'>
										<User size={18} />
										<span>Login</span>
									</Link>
									<Link
										href='/signup'
										onClick={() => setIsOpen(false)}
										className='flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium bg-linear-to-r from-sky-500 to-blue-500 text-white hover:from-sky-600 hover:to-blue-600 transition-all duration-200'>
										<span>Sign Up</span>
									</Link>
								</>
							)}
						</div>
					</div>
				)}
			</div>
		</nav>
	);
}
