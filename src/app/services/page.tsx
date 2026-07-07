"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
	Briefcase,
	ShieldCheck,
	Globe,
	Code,
	Sparkles,
	ArrowRight,
	CheckCircle2,
	ChevronDown,
	Lock,
	Rocket,
	Terminal,
} from "lucide-react";
import { useState } from "react";

// Service items data
const services = [
	{
		id: "adsense-approval",
		title: "Google AdSense Approval",
		description: "Get 100% policy-compliant Google AdSense approval for your website. Safe and fast approval process handled by experts.",
		details: ["$50 flat fee ($10 extra for fresh domains)", "Approved via Blogs or Tool Scripts", "Completed within 15 days"],
		link: "/services/adsense-approval",
		icon: ShieldCheck,
		color: "from-amber-500 to-orange-600",
		badge: "Popular Service",
	},
	{
		id: "buy-sale",
		title: "Buy & Sell AdSense Accounts",
		description: "Access high-quality, verified Google AdSense accounts from all countries, or sell your account safely with minimal fees.",
		details: ["Accounts from all countries", "Safe transaction escrow", "Only 5% seller commission"],
		link: "/services/buy-sale",
		icon: Globe,
		color: "from-sky-500 to-blue-600",
		badge: "Secure Escrow",
	},
	{
		id: "web-development",
		title: "Custom Web Development",
		description: "High-performance websites, custom automation tools, SEO scripts, and complete SaaS platforms tailored to your business needs.",
		details: ["Bespoke custom solutions", "Charges based on requirements", "Modern responsive tech stack"],
		link: "/services/web-development",
		icon: Code,
		color: "from-rose-500 to-red-600",
		badge: "Custom Pricing",
	},
];

const faqs = [
	{
		q: "What is your refund policy for services?",
		a: "We strive to deliver top-notch results. For our AdSense Approval service, if we fail to secure approval within the agreed timeline, we offer a transparent refund process based on your project terms.",
	},
	{
		q: "How does the 50% upfront payment work?",
		a: "For selected services like AdSense Approval, you pay 50% of the project cost ($25) to initiate the work. The remaining 50% is paid once the service is successfully completed.",
	},
	{
		q: "Is buying or selling AdSense accounts safe?",
		a: "Yes, we act as a secure escrow provider. We verify all accounts before transfer, coordinate the domain/email transitions safely, and ensure payments are only released when both parties are satisfied.",
	},
	{
		q: "How long does custom web development take?",
		a: "Development timelines depend entirely on your requirements. Simple scripts or single-page apps can take 2-4 days, while complex platforms might take a few weeks. Contact us to get an exact quote.",
	},
];

export default function ServicesPage() {
	const [openFaq, setOpenFaq] = useState<number | null>(null);

	const containerVariants: Variants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: { staggerChildren: 0.15 },
		},
	};

	const itemVariants: Variants = {
		hidden: { y: 30, opacity: 0 },
		visible: {
			y: 0,
			opacity: 1,
			transition: { type: "spring", stiffness: 100, damping: 15 },
		},
	};

	return (
		<div className="min-h-screen bg-slate-50/50 text-slate-800 pb-20 relative overflow-hidden">
			{/* Page Title & Background Gradients */}
			<div className="absolute inset-0 pointer-events-none overflow-hidden">
				<div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-3xl" />
				<div className="absolute top-1/3 left-10 w-[400px] h-[400px] bg-orange-100/20 rounded-full blur-3xl" />
				<div className="absolute bottom-10 right-10 w-[600px] h-[600px] bg-rose-100/20 rounded-full blur-3xl" />
			</div>

			<div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-16 md:pt-24 relative z-10">
				{/* Hero Header */}
				<div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
					<motion.div
						initial={{ scale: 0.9, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						transition={{ duration: 0.5 }}
						className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 mb-6"
					>
						<Sparkles size={14} className="text-orange-500 animate-pulse" />
						<span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
							Deelzo Agency Services
						</span>
					</motion.div>

					<motion.h1
						initial={{ y: -20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ delay: 0.1, duration: 0.6 }}
						className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-tight"
					>
						Professional Digital Services to
						<span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-rose-500 to-blue-600">
							Grow Your Business
						</span>
					</motion.h1>

					<motion.p
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ delay: 0.2, duration: 0.6 }}
						className="mt-6 text-lg text-slate-600 leading-relaxed"
					>
						Empower your digital journey with our expert-led services. From securing Google AdSense approvals to buying/selling verified accounts and custom programming, we deliver quality you can trust.
					</motion.p>
				</div>

				{/* Services Grid */}
				<motion.div
					variants={containerVariants}
					initial="hidden"
					animate="visible"
					className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24"
				>
					{services.map((service) => {
						const Icon = service.icon;
						return (
							<motion.div
								key={service.id}
								variants={itemVariants}
								className="group relative flex flex-col bg-white rounded-3xl border border-slate-200/80 shadow-md shadow-slate-100 hover:shadow-xl hover:border-slate-300/90 transition-all duration-300 overflow-hidden"
							>
								{/* Subtle border highlight on hover */}
								<div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${service.color}`} />

								{/* Card Content */}
								<div className="p-8 flex-1 flex flex-col">
									{/* Icon and Badge */}
									<div className="flex justify-between items-start mb-6">
										<div className={`p-4 rounded-2xl bg-gradient-to-br ${service.color} text-white shadow-lg shadow-slate-200`}>
											<Icon size={24} />
										</div>
										<span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
											{service.badge}
										</span>
									</div>

									{/* Title */}
									<h2 className="text-2xl font-bold text-slate-900 group-hover:text-orange-500 transition-colors mb-3">
										{service.title}
									</h2>

									{/* Description */}
									<p className="text-slate-600 text-[15px] leading-relaxed mb-6 flex-1">
										{service.description}
									</p>

									{/* Detailed bullet points */}
									<div className="space-y-3 mb-8 bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
										{service.details.map((detail, dIdx) => (
											<div key={dIdx} className="flex items-center gap-2 text-sm text-slate-700 font-medium">
												<CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
												<span>{detail}</span>
											</div>
										))}
									</div>

									{/* Button Link */}
									<Link href={service.link} className="w-full mt-auto">
										<Button className="w-full bg-slate-950 hover:bg-orange-500 text-white rounded-xl py-6 font-semibold group/btn flex items-center justify-center gap-2 transition-all duration-300">
											<span>Learn More</span>
											<ArrowRight size={16} className="transition-transform duration-300 group-hover/btn:translate-x-1.5" />
										</Button>
									</Link>
								</div>
							</motion.div>
						);
					})}
				</motion.div>

				{/* Why Choose Us */}
				<section className="mb-24 rounded-3xl bg-slate-900 text-white p-8 md:p-16 relative overflow-hidden shadow-2xl">
					<div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-400 via-rose-400 to-indigo-500 pointer-events-none" />
					<div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
						<div>
							<span className="text-orange-400 text-xs font-bold uppercase tracking-widest block mb-3">
								Trust & Reliability
							</span>
							<h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight leading-tight">
								Why Global Brands and Webmasters Partner with Deelzo
							</h2>
							<p className="text-slate-300 leading-relaxed mb-8">
								We bridge the gap between complex digital operations and seamless solutions. Whether you want to start generating ad revenue or need premium tools developed, we stand behind our execution metrics.
							</p>
							<div className="grid grid-cols-2 gap-6">
								<div>
									<div className="text-3xl md:text-4xl font-extrabold text-orange-400">100%</div>
									<div className="text-sm text-slate-400 font-medium mt-1">Satisfaction Rate</div>
								</div>
								<div>
									<div className="text-3xl md:text-4xl font-extrabold text-orange-400">15 Days</div>
									<div className="text-sm text-slate-400 font-medium mt-1">Maximum Delivery Time</div>
								</div>
							</div>
						</div>

						{/* Pillars list */}
						<div className="space-y-6">
							<div className="flex gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
								<div className="h-10 w-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center flex-shrink-0">
									<Lock size={20} />
								</div>
								<div>
									<h4 className="font-semibold text-white text-lg">Guaranteed Safe Escrow</h4>
									<p className="text-sm text-slate-300 mt-1">All financial assets, account transfers, and codes undergo rigorous checks to prevent fraudulent risk.</p>
								</div>
							</div>

							<div className="flex gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
								<div className="h-10 w-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0">
									<Terminal size={20} />
								</div>
								<div>
									<h4 className="font-semibold text-white text-lg">Bespoke Technical Mastery</h4>
									<p className="text-sm text-slate-300 mt-1">Our engineers build scalable apps utilizing the latest industry frameworks (React, Next.js, Node.js).</p>
								</div>
							</div>

							<div className="flex gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
								<div className="h-10 w-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
									<Rocket size={20} />
								</div>
								<div>
									<h4 className="font-semibold text-white text-lg">Express Execution Focus</h4>
									<p className="text-sm text-slate-300 mt-1">We respect project timelines and deliver milestones efficiently without compromising on craftsmanship.</p>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Frequently Asked Questions */}
				<section className="max-w-4xl mx-auto">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold text-slate-900 tracking-tight">
							Frequently Asked Questions
						</h2>
						<p className="text-slate-500 mt-2">Have a question about our services? Find your answer below.</p>
					</div>

					<div className="space-y-4">
						{faqs.map((faq, idx) => {
							const isOpen = openFaq === idx;
							return (
								<div
									key={idx}
									className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden transition-all duration-300 shadow-xs"
								>
									<button
										onClick={() => setOpenFaq(isOpen ? null : idx)}
										className="w-full px-6 py-5 flex justify-between items-center text-left hover:bg-slate-50/50 transition-colors"
									>
										<span className="font-semibold text-slate-800 text-[15px] md:text-base pr-4">
											{faq.q}
										</span>
										<ChevronDown
											size={18}
											className={`text-slate-400 transition-transform duration-300 flex-shrink-0 ${
												isOpen ? "rotate-180 text-orange-500" : ""
											}`}
										/>
									</button>

									<div
										className={`transition-all duration-300 ease-in-out overflow-hidden ${
											isOpen ? "max-h-60 border-t border-slate-100" : "max-h-0"
										}`}
									>
										<div className="p-6 text-sm md:text-[15px] leading-relaxed text-slate-600 bg-slate-50/30">
											{faq.a}
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</section>
			</div>
		</div>
	);
}
