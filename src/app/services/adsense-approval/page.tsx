"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PHONE } from "@/lib/constant";
import {
	ShieldAlert,
	Coins,
	CreditCard,
	Clock,
	CheckCircle,
	MessageSquare,
	Sparkles,
	FileText,
	HeartHandshake,
	Terminal,
} from "lucide-react";

export default function AdsenseApprovalPage() {
	// Format WhatsApp URL
	const message = encodeURIComponent(
		"Hello Deelzo, I want to get AdSense approval for my website. I have read and agree to the terms: $50 charge ($10 extra for fresh domains), 50% upfront payment, and up to 15 days timeline."
	);
	const whatsappUrl = `https://wa.me/${PHONE}?text=${message}`;

	// Key Terms data
	const terms = [
		{
			icon: Coins,
			title: "Flat Charge",
			value: "$50",
			subText: "per site*",
			description: "Complete service until approval. *For fresh domains, we publish custom blog posts for the site ($10 extra, i.e., $60 total).",
			color: "from-amber-500 to-orange-600",
		},
		{
			icon: CreditCard,
			title: "Advance Payment",
			value: "50%",
			subText: "upfront ($25)",
			description: "Paid to initiate audit, layout customization, and template configuration to meet strict Google policies.",
			color: "from-orange-500 to-rose-500",
		},
		{
			icon: Clock,
			title: "Approval Window",
			value: "15 Days",
			subText: "maximum timeline",
			description: "Typical approval takes 5-10 days, but we set a maximum of 15 days to allow full Google verification cycles.",
			color: "from-rose-500 to-red-600",
		},
	];

	// Process Steps
	const steps = [
		{
			title: "Step 1: Thorough Site Audit",
			desc: "We analyze your site's template structure, navigation flow, loading speed, and current content footprint to find policy violations.",
		},
		{
			title: "Step 2: Legal & Layout Pages Setup",
			desc: "We configure required pages (Privacy Policy, Contact Us, Terms of Service) and build a clean, ad-friendly UI/UX structure.",
		},
		{
			title: "Step 3: Content Optimization",
			desc: "We optimize your site content to meet AdSense high-quality policy requirements, fixing low-value or thin content areas.",
		},
		{
			title: "Step 4: Submission & Monitoring",
			desc: "We submit the site and closely monitor the approval lifecycle. If Google raises any issues, we solve them immediately at no extra cost.",
		},
	];

	return (
		<div className="min-h-screen bg-slate-50/50 pb-24 relative overflow-hidden">
			{/* Dynamic Background */}
			<div className="absolute inset-0 pointer-events-none overflow-hidden">
				<div className="absolute top-0 right-1/3 w-[600px] h-[600px] bg-amber-100/30 rounded-full blur-3xl" />
				<div className="absolute bottom-20 left-10 w-[450px] h-[450px] bg-orange-100/20 rounded-full blur-3xl" />
			</div>

			<div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-16 md:pt-24 relative z-10">
				{/* Back link & Header */}
				<div className="text-center max-w-3xl mx-auto mb-16">
					<motion.div
						initial={{ scale: 0.9, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						transition={{ duration: 0.4 }}
						className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 mb-6"
					>
						<Sparkles size={14} className="text-amber-500" />
						<span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
							Google AdSense Approval
						</span>
					</motion.div>

					<motion.h1
						initial={{ y: -20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ delay: 0.1, duration: 0.5 }}
						className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight"
					>
						Get Your Site Approved by
						<span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600">
							Google AdSense
						</span>
					</motion.h1>

					<motion.p
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ delay: 0.2, duration: 0.5 }}
						className="mt-6 text-lg text-slate-600 leading-relaxed"
					>
						Tired of rejection letters for &ldquo;Low Value Content&rdquo; or &ldquo;Policy Violations&rdquo;? Let our experts rebuild, optimize, and submit your website to ensure AdSense approval.
					</motion.p>
				</div>

				{/* Key Terms Grid */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
					{terms.map((term, index) => {
						const Icon = term.icon;
						return (
							<motion.div
								key={index}
								initial={{ opacity: 0, y: 30 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.1, duration: 0.5 }}
								className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs hover:shadow-lg transition-all duration-300 relative overflow-hidden group"
							>
								{/* Icon overlay */}
								<div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${term.color}`} />
								
								<div className="flex items-center justify-between mb-6">
									<div className={`p-3.5 rounded-2xl bg-gradient-to-br ${term.color} text-white shadow-md`}>
										<Icon size={22} />
									</div>
									<span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
										{term.title}
									</span>
								</div>

								<div className="flex items-baseline gap-2 mb-4">
									<span className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
										{term.value}
									</span>
									<span className="text-slate-500 text-sm font-semibold">
										{term.subText}
									</span>
								</div>

								<p className="text-slate-600 text-[14px] leading-relaxed">
									{term.description}
								</p>
							</motion.div>
						);
					})}
				</div>

				{/* Strict Requirement Notice Box */}
				<motion.div
					initial={{ scale: 0.95, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ delay: 0.3, duration: 0.5 }}
					className="max-w-3xl mx-auto mb-16 border-2 border-rose-500/20 bg-rose-50/50 rounded-3xl p-8 text-center relative overflow-hidden"
				>
					<div className="absolute top-0 left-0 bottom-0 w-2 bg-rose-500" />
					<div className="flex flex-col items-center">
						<div className="h-14 w-14 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mb-4 animate-pulse">
							<ShieldAlert size={28} />
						</div>
						<h3 className="text-xl font-bold text-rose-950 mb-3 tracking-tight">
							Strict Service Agreement
						</h3>
						<p className="text-rose-800 text-[15px] leading-relaxed max-w-2xl mb-6">
							Please note that these terms are absolute and non-negotiable. We offer dedicated, premium resources to guarantee success. **Only contact us on WhatsApp if you explicitly agree to these 3 terms.**
						</p>

						{/* Interactive Checkbox Style list */}
						<div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-bold text-rose-950 uppercase tracking-wider mb-8">
							<div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50">
								<CheckCircle size={14} className="text-rose-600" />
								<span>$50 Total Cost</span>
							</div>
							<div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50">
								<CheckCircle size={14} className="text-rose-600" />
								<span>50% Upfront Advance</span>
							</div>
							<div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50">
								<CheckCircle size={14} className="text-rose-600" />
								<span>Up to 15 Days</span>
							</div>
						</div>

						{/* Main WhatsApp CTA */}
						<a
							href={whatsappUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex"
						>
							<Button className="bg-[#25D366] hover:bg-[#20ba59] text-white px-8 py-6 rounded-2xl font-bold shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/30 transition-all duration-300 hover:scale-[1.03] text-[15px] flex items-center gap-2.5">
								<MessageSquare size={18} />
								<span>I Agree - Chat on WhatsApp</span>
							</Button>
						</a>
					</div>
				</motion.div>

				{/* Approval Methodology */}
				<section className="mb-20 max-w-5xl mx-auto">
					<div className="text-center mb-10">
						<h2 className="text-3xl font-bold text-slate-900 tracking-tight">
							Two Custom Approval Methods
						</h2>
						<p className="text-slate-500 mt-2 text-sm md:text-base">
							We optimize and configure your site using two highly successful strategies
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						<div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xs flex flex-col sm:flex-row gap-5 hover:shadow-md transition-shadow">
							<div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 shadow-xs">
								<FileText size={24} />
							</div>
							<div>
								<h4 className="text-lg font-bold text-slate-950 mb-2">WordPress Blog Posting</h4>
								<p className="text-sm text-slate-600 leading-relaxed">
									We write and publish policy-compliant, high-quality blog posts formatted precisely to satisfy Google&apos;s editorial standards. 
									<span className="block mt-2 text-amber-700 font-semibold bg-amber-50/50 rounded-lg p-2 text-xs border border-amber-100/50">
										💡 Note: Fresh domains require custom blog writing & posting ($10 extra, i.e., $60 total).
									</span>
								</p>
							</div>
						</div>

						<div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xs flex flex-col sm:flex-row gap-5 hover:shadow-md transition-shadow">
							<div className="h-12 w-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0 shadow-xs">
								<Terminal size={24} />
							</div>
							<div>
								<h4 className="text-lg font-bold text-slate-950 mb-2">Interactive Tool Scripts</h4>
								<p className="text-sm text-slate-600 leading-relaxed">
									We integrate custom tools, utility scripts, or calculator apps. Google values interactive features extremely highly because they guarantee rich user value and programmatic engagement.
								</p>
							</div>
						</div>
					</div>
				</section>

				{/* Our Process Section */}
				<section className="mb-16">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold text-slate-900 tracking-tight">
							How We Secure Your Approval
						</h2>
						<p className="text-slate-500 mt-2">A step-by-step layout of our approval implementation lifecycle</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
						{steps.map((step, idx) => (
							<div
								key={idx}
								className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs hover:border-slate-300 transition-colors"
							>
								<div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 font-bold flex items-center justify-center text-sm mb-4">
									{idx + 1}
								</div>
								<h4 className="font-bold text-slate-900 text-lg mb-2">{step.title}</h4>
								<p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
							</div>
						))}
					</div>
				</section>

				{/* Guarantee Badge */}
				<div className="max-w-2xl mx-auto text-center border border-slate-200 bg-white/60 backdrop-blur-xs rounded-3xl p-8 flex flex-col sm:flex-row items-center gap-6 shadow-2xs">
					<div className="h-16 w-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
						<HeartHandshake size={32} />
					</div>
					<div className="text-left">
						<h4 className="font-bold text-slate-900 text-[17px] mb-1">Our Compliance Guarantee</h4>
						<p className="text-sm text-slate-600 leading-relaxed">
							If Google AdSense rejects the site due to structural or policy issues, we will make adjustments and re-submit as many times as necessary under our original agreement. We get you across the finish line.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
