"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PHONE } from "@/lib/constant";
import {
	Globe,
	ShieldCheck,
	Coins,
	ArrowRightLeft,
	CheckCircle,
	MessageSquare,
	Sparkles,
	Lock,
	ChevronRight,
	FileText,
} from "lucide-react";

export default function BuySalePage() {
	// WhatsApp prefilled strings
	const buyMessage = encodeURIComponent(
		"Hello Deelzo, I am interested in buying a Google AdSense account. Please let me know which country accounts you have available and their pricing details."
	);
	const sellMessage = encodeURIComponent(
		"Hello Deelzo, I want to sell my Google AdSense account. I agree to your 5% commission term. Here are my account details (Country, PIN-verified status, Balance, Website niche):"
	);

	const buyWhatsappUrl = `https://wa.me/${PHONE}?text=${buyMessage}`;
	const sellWhatsappUrl = `https://wa.me/${PHONE}?text=${sellMessage}`;

	// Safety features list
	const safetyFeatures = [
		{
			title: "100% Direct Escrow",
			desc: "We operate strictly as the escrow coordinator. There is zero third-party involvement: this is a clean 3-person transaction between the Seller, the Buyer, and us (Deelzo) for absolute transparency.",
			icon: Lock,
		},
		{
			title: "Verification Process",
			desc: "We perform a thorough policy audit on every seller account to ensure it has no active violations, warnings, or hidden bans.",
			icon: ShieldCheck,
		},
		{
			title: "Ownership Transition Support",
			desc: "Our escrow experts guide you step-by-step through changing email addresses, phone configurations, and payee settings safely.",
			icon: ArrowRightLeft,
		},
	];

	return (
		<div className="min-h-screen bg-slate-50/50 pb-24 relative overflow-hidden">
			{/* Gradient elements */}
			<div className="absolute inset-0 pointer-events-none overflow-hidden">
				<div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-sky-100/30 rounded-full blur-3xl" />
				<div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-blue-100/20 rounded-full blur-3xl" />
			</div>

			<div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-16 md:pt-24 relative z-10">
				{/* Page Header */}
				<div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
					<motion.div
						initial={{ scale: 0.9, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						transition={{ duration: 0.4 }}
						className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-200 mb-6"
					>
						<Sparkles size={14} className="text-sky-500 animate-spin-slow" />
						<span className="text-xs font-bold text-sky-700 uppercase tracking-wider">
							Marketplace Escrow
						</span>
					</motion.div>

					<motion.h1
						initial={{ y: -20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ delay: 0.1, duration: 0.5 }}
						className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight"
					>
						Buy & Sell Verified
						<span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600">
							AdSense Accounts
						</span>
					</motion.h1>

					<motion.p
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ delay: 0.2, duration: 0.5 }}
						className="mt-6 text-lg text-slate-600 leading-relaxed"
					>
						We support webmasters globally by facilitating secure, fast, and verified AdSense account transactions. Select your path below to begin the secure transaction process.
					</motion.p>
				</div>

				{/* Dual Grid Layout: Buy vs Sell */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
					{/* Buy Side Card */}
					<motion.div
						initial={{ x: -40, opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						transition={{ delay: 0.2, duration: 0.6 }}
						className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden group"
					>
						<div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-sky-400 to-blue-600" />
						
						<div>
							<div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-sky-600 bg-sky-50 px-3 py-1 rounded-full mb-6">
								For Buyers
							</div>
							<h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
								Acquire Verified Accounts
							</h3>
							<p className="text-slate-600 text-sm md:text-base leading-relaxed mb-8">
								Looking for instant monetization? We provide fully verified, high-standing AdSense accounts for multiple countries, ensuring compliance with local rules.
							</p>

							{/* Buy terms checklist */}
							<div className="space-y-4 mb-10">
								<div className="flex items-start gap-3">
									<CheckCircle size={18} className="text-sky-500 mt-0.5 flex-shrink-0" />
									<div>
										<h4 className="font-semibold text-slate-800 text-sm">Global Country Selection</h4>
										<p className="text-xs text-slate-500 mt-0.5">Accounts available from USA, UK, India, Germany, Canada, and more.</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<CheckCircle size={18} className="text-sky-500 mt-0.5 flex-shrink-0" />
									<div>
										<h4 className="font-semibold text-slate-800 text-sm">PIN & Non-PIN Options</h4>
										<p className="text-xs text-slate-500 mt-0.5">Select from brand new accounts to PIN-verified accounts with payment history.</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<CheckCircle size={18} className="text-sky-500 mt-0.5 flex-shrink-0" />
									<div>
										<h4 className="font-semibold text-slate-800 text-sm">Complete Escrow Protection</h4>
										<p className="text-xs text-slate-500 mt-0.5">Your money is held in escrow until you verify full access to your account.</p>
									</div>
								</div>
							</div>
						</div>

						<a href={buyWhatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full">
							<Button className="w-full bg-slate-950 hover:bg-sky-600 text-white rounded-2xl py-7 font-bold flex items-center justify-center gap-2 shadow-md transition-all duration-300">
								<MessageSquare size={18} />
								<span>Inquire to Buy Account</span>
							</Button>
						</a>
					</motion.div>

					{/* Sell Side Card */}
					<motion.div
						initial={{ x: 40, opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						transition={{ delay: 0.2, duration: 0.6 }}
						className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden group"
					>
						<div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 to-teal-600" />
						
						<div>
							<div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full mb-6">
								For Sellers
							</div>
							<h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
								Sell Your Account Safely
							</h3>
							<p className="text-slate-600 text-sm md:text-base leading-relaxed mb-8">
								Ready to cash out? Sell your AdSense account through our trusted network. We find qualified buyers and handle payment delivery securely.
							</p>

							{/* Sell terms checklist */}
							<div className="space-y-4 mb-10">
								<div className="flex items-start gap-3">
									<CheckCircle size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
									<div>
										<h4 className="font-semibold text-slate-800 text-sm">Low Commission Fee</h4>
										<p className="text-xs text-slate-500 mt-0.5">We only charge a flat **5% sales commission** on successful account sales.</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<CheckCircle size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
									<div>
										<h4 className="font-semibold text-slate-800 text-sm">Escrow-Guaranteed Payouts</h4>
										<p className="text-xs text-slate-500 mt-0.5">Get paid directly via secure methods once ownership has successfully migrated.</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<CheckCircle size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
									<div>
										<h4 className="font-semibold text-slate-800 text-sm">Confidential Process</h4>
										<p className="text-xs text-slate-500 mt-0.5">Your email, personal details, and site domains are kept strictly private.</p>
									</div>
								</div>
							</div>
						</div>

						<a href={sellWhatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full">
							<Button className="w-full bg-slate-950 hover:bg-emerald-600 text-white rounded-2xl py-7 font-bold flex items-center justify-center gap-2 shadow-md transition-all duration-300">
								<MessageSquare size={18} />
								<span>Sell Your Account (5% Fee)</span>
							</Button>
						</a>
					</motion.div>
				</div>

				{/* Safety & Escrow Procedures */}
				<section className="bg-slate-900 text-white rounded-3xl p-8 md:p-16 relative overflow-hidden shadow-xl mb-12">
					<div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-400 via-sky-400 to-indigo-500 pointer-events-none" />
					<div className="relative z-10">
						<div className="text-center max-w-2xl mx-auto mb-12">
							<span className="text-sky-400 text-xs font-bold uppercase tracking-widest block mb-2">
								Transaction Security
							</span>
							<h3 className="text-3xl font-bold tracking-tight">
								Our Bulletproof Safety Protocol
							</h3>
							<p className="text-slate-300 mt-2 text-sm md:text-base">
								To maintain account health and prevent Google policy strikes, we manage all steps through our proven escrow pipeline.
							</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
							{safetyFeatures.map((feat, idx) => {
								const Icon = feat.icon;
								return (
									<div
										key={idx}
										className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
									>
										<div className="h-10 w-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center mb-4">
											<Icon size={20} />
										</div>
										<h4 className="font-bold text-white text-lg mb-2">{feat.title}</h4>
										<p className="text-sm text-slate-300 leading-relaxed">{feat.desc}</p>
									</div>
								);
							})}
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}
