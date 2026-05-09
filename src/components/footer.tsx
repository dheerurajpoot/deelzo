"use client";

import Image from "next/image";
import Link from "next/link";
import { EMAIL } from "@/lib/constant";
import {
	ShoppingBag,
	Shield,
	HelpCircle,
	ArrowRight,
	Sparkles,
	Users,
	Globe,
} from "lucide-react";

export default function Footer() {
	const quickLinks = [
		{ name: "Shop", href: "/shop" },
		{ name: "How It Works", href: "/guide" },
		{ name: "About Us", href: "/about" },
	];

	const legalLinks = [
		{ name: "Privacy Policy", href: "/privacy" },
		{ name: "Terms of Service", href: "/terms" },
		{ name: "Refund Policy", href: "/refund-policy" },
	];

	const supportLinks = [
		{ name: "Contact Us", href: "/contact" },
		{ name: "FAQ", href: "/guide" },
		{ name: "Email Support", href: `mailto:${EMAIL}` },
	];

	return (
		<footer className='relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden'>
			{/* Background decorations */}
			<div className='absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent' />
			<div className='absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-orange-500/10 to-rose-500/10 rounded-full blur-3xl' />
			<div className='absolute bottom-20 left-20 w-48 h-48 bg-gradient-to-br from-sky-500/10 to-blue-500/10 rounded-full blur-3xl' />

			<div className='relative max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-20'>
				{/* Top Section - Newsletter */}
				<div className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 pb-12 border-b border-white/10'>
					<div className='max-w-md'>
						<div className='inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20 mb-4'>
							<Sparkles size={14} className='text-orange-400' />
							<span className='text-xs font-semibold text-white'>Stay Updated</span>
						</div>
						<h3 className='text-2xl md:text-3xl font-bold text-white mb-2'>Join Our Newsletter</h3>
						<p className='text-slate-400'>Get the latest digital asset trends and exclusive deals delivered to your inbox.</p>
					</div>
					<div className='flex gap-3 w-full lg:w-auto'>
						<input
							type='email'
							placeholder='Enter your email'
							className='flex-1 lg:w-64 px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500/50 transition-colors'
						/>
						<button className='px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 whitespace-nowrap'>
							Subscribe
							<ArrowRight size={16} />
						</button>
					</div>
				</div>

				{/* Main Footer Grid */}
				<div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12 py-12'>
					{/* Brand Column */}
					<div className='col-span-2 md:col-span-4 lg:col-span-2'>
						<div className='flex items-center gap-3 mb-6'>
							<Image src='/slogo.png' alt='Deelzo Logo' width={152} height={32} />
						</div>
						<p className='text-slate-400 text-sm leading-relaxed mb-6 max-w-sm'>
							The premier marketplace for buying and selling digital assets. 
							Trusted by thousands of entrepreneurs worldwide.
						</p>
						
						{/* Platform fee badge */}
						<div className='inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 w-fit mb-6'>
							<div className='w-2 h-2 bg-emerald-400 rounded-full' />
							<span className='text-sm font-semibold text-emerald-400'>Low Platform Fee: 5%</span>
						</div>

						{/* Social proof */}
						<div className='flex items-center gap-4'>
							<div className='flex -space-x-2'>
								{[0, 1, 2, 3].map((i) => (
									<div
										key={i}
										className='w-8 h-8 rounded-full border-2 border-slate-800 bg-gradient-to-br from-orange-400 to-rose-400 flex items-center justify-center'
									>
										<span className='text-xs font-bold text-white'>{String.fromCharCode(65 + i)}</span>
									</div>
								))}
							</div>
							<div className='text-sm text-slate-400'>
								<span className='text-white font-semibold'>10,000+</span> happy users
							</div>
						</div>
					</div>

					{/* Quick Links */}
					<div>
						<h4 className='text-white font-semibold mb-4 flex items-center gap-2'>
							<ShoppingBag size={16} className='text-orange-400' />
							Quick Links
						</h4>
						<ul className='space-y-3'>
							{quickLinks.map((link) => (
								<li key={link.name}>
									<Link
										href={link.href}
										className='group flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-all duration-200'>
										<span className='w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-orange-400 transition-colors' />
										{link.name}
									</Link>
								</li>
								))}
						</ul>
					</div>

					{/* Legal */}
					<div>
						<h4 className='text-white font-semibold mb-4 flex items-center gap-2'>
							<Shield size={16} className='text-orange-400' />
							Legal
						</h4>
						<ul className='space-y-3'>
							{legalLinks.map((link) => (
								<li key={link.name}>
									<Link
										href={link.href}
										className='group flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-all duration-200'>
										<span className='w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-orange-400 transition-colors' />
										{link.name}
									</Link>
								</li>
								))}
						</ul>
					</div>

					{/* Support */}
					<div>
						<h4 className='text-white font-semibold mb-4 flex items-center gap-2'>
							<HelpCircle size={16} className='text-orange-400' />
							Support
						</h4>
						<ul className='space-y-3'>
							{supportLinks.map((link) => (
								<li key={link.name}>
									<Link
										href={link.href}
										className='group flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-all duration-200'>
										<span className='w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-orange-400 transition-colors' />
										{link.name}
									</Link>
								</li>
								))}
						</ul>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className='pt-8 border-t border-white/10'>
					<div className='flex flex-col md:flex-row justify-between items-center gap-4'>
						<p className='text-slate-500 text-sm text-center md:text-left'>
							© 2026{" "}
							<span className='text-white font-semibold'>Deelzo</span>
							. All rights reserved.
						</p>
						<div className='flex items-center gap-6 text-sm text-slate-500'>
							<div className='flex items-center gap-2'>
								<Globe size={14} />
								<span>Global Platform</span>
							</div>
							<div className='flex items-center gap-2'>
								<Users size={14} />
								<span>Community Driven</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}
