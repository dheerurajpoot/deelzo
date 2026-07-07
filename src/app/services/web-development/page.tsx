"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PHONE } from "@/lib/constant";
import {
	Code,
	Sparkles,
	MessageSquare,
	Cpu,
	Terminal,
	Layers,
	Database,
	CheckCircle,
	ArrowRight,
	FileText,
	DollarSign,
	Send,
} from "lucide-react";

export default function WebDevelopmentPage() {
	// Form state
	const [projectType, setProjectType] = useState("Web Application (React/Next.js)");
	const [budgetRange, setBudgetRange] = useState("Under $100");
	const [description, setDescription] = useState("");
	const [copied, setCopied] = useState(false);

	// WhatsApp prefilled formatting
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const message = `Hello Deelzo, I want to request a custom Web Development service.\n\n` +
			`🖥️ *Project Type:* ${projectType}\n` +
			`💰 *Estimated Budget:* ${budgetRange}\n` +
			`📝 *Description:* ${description || "Not provided"}\n\n` +
			`Please let me know your thoughts and availability.`;
		
		const encodedMessage = encodeURIComponent(message);
		window.open(`https://wa.me/${PHONE}?text=${encodedMessage}`, "_blank");
	};

	const capabilities = [
		{
			title: "Next-Gen Web Apps",
			icon: Layers,
			desc: "Stunning, responsive Next.js & React frontends optimized for core web vitals and fast loading speed.",
		},
		{
			title: "Custom Automation & Scripts",
			icon: Terminal,
			desc: "Automate manual tasks, web scraping, custom bots, and automated SEO tools built in Node.js or Python.",
		},
		{
			title: "Database & Backend Design",
			icon: Database,
			desc: "Secure API development, relational databases (MongoDB, PostgreSQL), and cloud infrastructure setup.",
		},
		{
			title: "SaaS & E-commerce Solutions",
			icon: Cpu,
			desc: "Build subscription-based platforms or secure checkout architectures (Stripe, PayPal, Razorpay integrations).",
		},
	];

	return (
		<div className="min-h-screen bg-slate-50/50 pb-24 relative overflow-hidden">
			{/* Decorative floating grids */}
			<div className="absolute inset-0 pointer-events-none overflow-hidden">
				<div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-rose-100/30 rounded-full blur-3xl" />
				<div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-indigo-100/20 rounded-full blur-3xl" />
			</div>

			<div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-16 md:pt-24 relative z-10">
				{/* Page Header */}
				<div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
					<motion.div
						initial={{ scale: 0.9, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						transition={{ duration: 0.4 }}
						className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 mb-6"
					>
						<Sparkles size={14} className="text-rose-500" />
						<span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
							Bespoke Development
						</span>
					</motion.div>

					<motion.h1
						initial={{ y: -20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ delay: 0.1, duration: 0.5 }}
						className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight"
					>
						Custom Web Development &
						<span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-red-500 to-amber-600">
							Automation Solutions
						</span>
					</motion.h1>

					<motion.p
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ delay: 0.2, duration: 0.5 }}
						className="mt-6 text-lg text-slate-600 leading-relaxed"
					>
						Need a specialized SaaS dashboard, a custom scraper, or a custom tool to boost your web business? We design clean, high-performance applications based directly on your business demands.
					</motion.p>
				</div>

				{/* Capabilities Matrix */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-20">
					{capabilities.map((cap, idx) => {
						const Icon = cap.icon;
						return (
							<motion.div
								key={idx}
								initial={{ opacity: 0, y: 30 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: idx * 0.1, duration: 0.5 }}
								className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-rose-200 hover:shadow-md transition-all duration-300"
							>
								<div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
									<Icon size={20} />
								</div>
								<h4 className="font-bold text-slate-900 text-lg mb-2">{cap.title}</h4>
								<p className="text-xs md:text-sm text-slate-500 leading-relaxed">{cap.desc}</p>
							</motion.div>
						);
					})}
				</div>

				{/* Requirement-Based Quote Planner */}
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start max-w-6xl mx-auto">
					{/* Pricing Guidelines */}
					<motion.div
						initial={{ x: -30, opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						transition={{ delay: 0.3, duration: 0.6 }}
						className="lg:col-span-5 space-y-6"
					>
						<div className="bg-slate-900 text-white rounded-3xl p-8 relative overflow-hidden shadow-lg border border-slate-800">
							<div className="absolute top-0 right-0 p-6 text-slate-800/20 font-black text-6xl pointer-events-none select-none">
								QUOTE
							</div>
							<h3 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2">
								<DollarSign className="text-rose-400" />
								Flexible Pricing Model
							</h3>
							<p className="text-slate-300 text-sm leading-relaxed mb-6">
								Every custom project has a unique architecture. Rather than charging rigid standard fees, we break down costs based on your specific requirements:
							</p>

							<div className="space-y-4">
								<div className="flex gap-3">
									<CheckCircle size={16} className="text-rose-400 mt-1 flex-shrink-0" />
									<p className="text-xs md:text-sm text-slate-200">
										<strong>Requirement Mapping:</strong> Pay only for the specific features and integrations your business needs.
									</p>
								</div>
								<div className="flex gap-3">
									<CheckCircle size={16} className="text-rose-400 mt-1 flex-shrink-0" />
									<p className="text-xs md:text-sm text-slate-200">
										<strong>Milestone Delivery:</strong> Payments split across project completion milestones for complete safety.
									</p>
								</div>
								<div className="flex gap-3">
									<CheckCircle size={16} className="text-rose-400 mt-1 flex-shrink-0" />
									<p className="text-xs md:text-sm text-slate-200">
										<strong>Free Support Window:</strong> 30 days of complimentary bug monitoring and tweaks included with all web projects.
									</p>
								</div>
							</div>
						</div>

						{/* Quick Contact Alert */}
						<div className="border border-slate-200 bg-white rounded-2xl p-6">
							<h4 className="font-bold text-slate-800 text-[15px] mb-1">Have wireframes or mockups?</h4>
							<p className="text-xs text-slate-500 leading-relaxed mb-3">
								If you already have detailed requirement briefs, PDFs, or design sketches, send them directly to us on WhatsApp!
							</p>
							<a
								href={`https://wa.me/${PHONE}`}
								target="_blank"
								rel="noopener noreferrer"
								className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 hover:underline"
							>
								<span>Contact Support Directly</span>
								<ArrowRight size={12} />
							</a>
						</div>
					</motion.div>

					{/* Project Planner Form */}
					<motion.div
						initial={{ x: 30, opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						transition={{ delay: 0.3, duration: 0.6 }}
						className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-8 md:p-10 shadow-xs"
					>
						<h3 className="text-2xl font-bold text-slate-900 mb-6">
							Interactive Project Planner
						</h3>
						<form onSubmit={handleSubmit} className="space-y-6">
							{/* Project Type */}
							<div>
								<label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
									Project Type
								</label>
								<select
									value={projectType}
									onChange={(e) => setProjectType(e.target.value)}
									className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:ring-1 focus:ring-rose-500 font-semibold text-slate-800"
								>
									<option>Blog Website (WordPress/Custom)</option>
									<option>Web Application (React/Next.js)</option>
									<option>Custom Automation/Scraper Script</option>
									<option>Landing Page & Lead Funnel</option>
									<option>Full-Stack SaaS Platform</option>
									<option>E-commerce Store</option>
									<option>Chrome Browser Extension</option>
									<option>Bug Fix & UI Modernization</option>
								</select>
							</div>

							{/* Budget Select */}
							<div>
								<label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
									Estimated Budget Range
								</label>
								<select
									value={budgetRange}
									onChange={(e) => setBudgetRange(e.target.value)}
									className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:ring-1 focus:ring-rose-500 font-semibold text-slate-800"
								>
									<option>Under $100</option>
									<option>$100 - $200</option>
									<option>$200 - $500</option>
									<option>$500 - $1,500</option>
									<option>$1,500 - $5,000</option>
									<option>$5,000+</option>
								</select>
							</div>

							{/* Description Textarea */}
							<div>
								<label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
									Project Requirements & Details
								</label>
								<textarea
									rows={4}
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									placeholder="Tell us about your project goals, features you need, or custom tools required..."
									className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:ring-1 focus:ring-rose-500 text-slate-800"
									required
								/>
							</div>

							{/* Submit WhatsApp */}
							<Button
								type="submit"
								className="w-full bg-slate-950 hover:bg-rose-500 text-white rounded-2xl py-6 font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.01]"
							>
								<Send size={16} />
								<span>Submit Quote Request via WhatsApp</span>
							</Button>
						</form>
					</motion.div>
				</div>
			</div>
		</div>
	);
}
