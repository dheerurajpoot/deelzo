"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
	CheckCircle2,
	Zap,
	Shield,
	TrendingUp,
	Star,
	ArrowRight,
	Code,
	Globe,
	FileText,
	Rocket,
	Target,
	Award,
	Clock,
	Users,
	DollarSign,
	Sparkles,
	BadgeCheck,
	Crown,
	Loader2,
	MessageCircle,
	LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";

const scripts = [
	{
		id: 1,
		name: "ToolsHub AdSense Approval Script",
		price: "$15",
		originalPrice: "$40",
		description:
			"ToolsHub is a bundle of 50 tools that helps you get AdSense approved quickly and easily. It's a simple tool that you can use to get your AdSense approved in minutes.",
		features: [
			"50+ Tools",
			"All Tools are 100% Legal",
			"All Tools are 100% Working",
			"All Tools are 100% Safe",
			"All Tools are 100% Secure",
			"All Tools are 100% Reliable",
		],
		successRate: "100%",
		deliveryTime: "5 Minute",
		popular: true,
		icon: Rocket,
		color: "from-blue-500 to-cyan-500",
		liveDemo: "https://toolshub123.vercel.app/",
	},
	{
		id: 2,
		name: "Image Converter AdSense Approval Script",
		price: "$15",
		originalPrice: "$20",
		description:
			"Image Converter is a tool that helps you convert images to different formats quickly and easily. It's a simple tool that you can use to convert images to different formats in minutes.",
		features: [
			"Convert Images to Different Formats",
			"Convert Images to Different Sizes",
			"Convert Images to Different Quality",
			"Convert Images to Different Format",
			"Convert Images to Different Size",
			"Convert Images to Different Quality",
		],
		successRate: "100%",
		deliveryTime: "1 Minute",
		popular: false,
		icon: Award,
		color: "from-purple-500 to-pink-500",
		liveDemo: "https://image-converter-toolz.vercel.app/",
	},
	{
		id: 3,
		name: "WordPress Theme & Plugin detector",
		price: "$15",
		originalPrice: "$29",
		description:
			"WordPress Theme & Plugin detector is a tool that helps you detect WordPress themes and plugins quickly and easily. It's a simple tool that you can use to detect WordPress themes and plugins in minutes.",
		features: [
			"Detect WordPress Themes",
			"Detect WordPress Plugins",
			"100% Legal",
			"100% Working",
			"100% Safe",
			"100% Secure",
			"100% Reliable",
		],
		successRate: "100%",
		deliveryTime: "1 Minute",
		popular: false,
		icon: Target,
		color: "from-green-500 to-emerald-500",
		liveDemo: "https://wp-theme-detector.vercel.app/",
	},
	{
		id: 4,
		name: "PDF to Word Converter",
		price: "$15",
		originalPrice: "$29",
		description:
			"PDF to Word Converter is a tool that helps you convert PDF to Word quickly and easily. It's a simple tool that you can use to convert PDF to Word in minutes.",
		features: [
			"Convert PDF to Word",
			"Convert PDF to Word",
			"100% Working",
		],
		popular: false,
		icon: Zap,
		color: "from-orange-500 to-red-500",
		liveDemo: "https://pdf2wordconverter.vercel.app/",
	},
	{
		id: 5,
		name: "Image & PDF Compressor",
		price: "$15",
		originalPrice: "$20",
		description:
			"Image & PDF Compressor is a tool that helps you compress images and PDF files quickly and easily. It's a simple tool that you can use to compress images and PDF files in minutes.",
		features: [
			"Compress Images",
			"Compress PDF",
			"Compress Images and PDF",
			"Working Good",
			"100% SEO done",
		],
		popular: true,
		icon: Crown,
		color: "from-yellow-500 to-orange-500",
		liveDemo: "https://compressall.vercel.app/",
	},
	{
		id: 6,
		name: "PDF to Word Converter",
		price: "$15",
		originalPrice: "$29",
		description:
			"PDF to Word Converter is a tool that helps you convert PDF to Word quickly and easily. It's a simple tool that you can use to convert PDF to Word in minutes.",
		features: [
			"Convert PDF to Word",
			"Convert PDF to PDF",
			"Convert PDF to PDF",
			"Convert PDF to PDF",
			"Convert PDF to PDF",
			"Convert PDF to PDF",
		],
		successRate: "100%",
		deliveryTime: "1 Minute",
		popular: false,
		icon: FileText,
		color: "from-indigo-500 to-blue-500",
		liveDemo: "https://pdf2wordconverter.vercel.app/",
	},
	{
		id: 7,
		name: "Age & EMI Calculator",
		price: "$15",
		originalPrice: "$29",
		description:
			"Age & EMI Calculator is a tool that helps you calculate your age and EMI quickly and easily. It's a simple tool that you can use to calculate your age and EMI in minutes.",
		features: [
			"Calculate Age",
			"Calculate EMI",
			"Calculate Age and EMI",
			"Working Good",
			"100% SEO done",
		],
		successRate: "100%",
		deliveryTime: "1 Minute",
		popular: false,
		icon: Shield,
		color: "from-teal-500 to-cyan-500",
		liveDemo: "https://age-and-loan-calculator.vercel.app/",
	},
	{
		id: 8,
		name: "QR Code Generator",
		price: "$15",
		originalPrice: "$29",
		description:
			"QR Code Generator is a tool that helps you generate QR codes quickly and easily. It's a simple tool that you can use to generate QR codes in minutes.",
		features: [
			"Generate QR Codes",
			"10+ QR Codes ways",
			"100% Working",
			"100% SEO done",
		],
		successRate: "100%",
		deliveryTime: "1 Minute",
		popular: false,
		icon: TrendingUp,
		color: "from-violet-500 to-purple-500",
		liveDemo: "https://qr-code-generator-tool.vercel.app/",
	},
	{
		id: 9,
		name: "Image Resizer",
		price: "$15",
		originalPrice: "$29",
		description:
			"Image Resizer is a tool that helps you resize images quickly and easily. It's a simple tool that you can use to resize images in minutes.",
		features: [
			"Resize Images",
			"Resize Images",
			"100% Working",
			"100% SEO done",
		],
		successRate: "100%",
		deliveryTime: "1 Minute",
		popular: false,
		icon: Globe,
		color: "from-pink-500 to-rose-500",
		liveDemo: "https://image-resize-tool.vercel.app/",
	},
	{
		id: 10,
		name: "DOB & Age Calculator",
		price: "$15",
		originalPrice: "$29",
		description:
			"DOB & Age Calculator is a tool that helps you calculate your age and DOB quickly and easily. It's a simple tool that you can use to calculate your age and DOB in minutes.",
		features: [
			"Calculate Age",
			"Calculate DOB",
			"Calculate Age and DOB",
			"Working Good",
			"100% SEO done",
		],
		successRate: "100%",
		deliveryTime: "1 Minute",
		popular: false,
		icon: Code,
		color: "from-amber-500 to-yellow-500",
		liveDemo: "https://dob-calculator-eight.vercel.app/",
	},
	{
		id: 11,
		name: "Online Quiz Script",
		price: "$15",
		originalPrice: "$29",
		description:
			"Quiz Maker is a tool that helps you make quizzes quickly and easily. It's a simple tool that you can use to make quizzes in minutes.",
		features: ["Make Quizzes", "100% Working", "100% SEO done"],
		successRate: "100%",
		deliveryTime: "1 Minute",
		popular: false,
		icon: CheckCircle2,
		color: "from-lime-500 to-green-500",
		liveDemo: "https://quiz-master-blush.vercel.app/",
	},
	{
		id: 12,
		name: "Tool Hub: 15+ Professional Online Tools",
		price: "$15",
		originalPrice: "$29",
		description:
			"Tool Hub is a bundle of all scripts that helps you get AdSense approved quickly and easily. It's a simple tool that you can use to get AdSense approved in minutes.",
		features: ["15+ Tools", "100% Working", "100% SEO done"],
		successRate: "100%",
		deliveryTime: "1 Minute",
		popular: true,
		icon: Sparkles,
		color: "from-rose-500 to-pink-500",
		liveDemo: "https://tool-zone-omega.vercel.app/",
	},
	{
		id: 13,
		name: "Calc Hub: 8+ Calculator Tools",
		price: "$15",
		originalPrice: "$29",
		description:
			"Calc Hub is a bundle of all scripts that helps you get AdSense approved quickly and easily. It's a simple tool that you can use to get AdSense approved in minutes.",
		features: ["8+ Tools", "100% Working", "100% SEO done"],
		successRate: "100%",
		deliveryTime: "1 Minute",
		popular: true,
		icon: Sparkles,
		color: "from-rose-500 to-pink-500",
		liveDemo: "https://calculatortoolz.vercel.app/",
	},
	{
		id: 14,
		name: "Downloader Pro",
		price: "$15",
		originalPrice: "$29",
		description:
			"Facebook, Instagram and Youtube Videos downloader tool that helps you get AdSense approved quickly and easily. It's a simple tool that you can use to get AdSense approved in minutes.",
		features: ["Video Downloader", "100% Working", "100% SEO done"],
		successRate: "100%",
		deliveryTime: "1 Minute",
		popular: true,
		icon: Sparkles,
		color: "from-rose-500 to-pink-500",
		liveDemo: "https://downloader-pro.vercel.app/",
	},
	{
		id: 15,
		name: "Quizwinz Quick Script",
		price: "$15",
		originalPrice: "$29",
		description:
			"Quizwinz Quick Script is a bundle of all scripts that helps you get AdSense approved quickly and easily. It's a simple tool that you can use to get AdSense approved in minutes.",
		features: ["Online Quiz Script", "100% Working", "100% SEO done"],
		successRate: "100%",
		deliveryTime: "1 Minute",
		popular: true,
		icon: Sparkles,
		color: "from-rose-500 to-pink-500",
		liveDemo: "https://quizwinz.vercel.app/",
	},
	{
		id: 16,
		name: "All Scripts Bundle",
		price: "$99",
		originalPrice: "$225",
		description:
			"All Scripts Bundle is a bundle of all scripts that helps you get AdSense approved quickly and easily. It's a simple tool that you can use to get AdSense approved in minutes.",
		features: ["All Scripts Included", "100% Working", "100% SEO done"],
		successRate: "100%",
		deliveryTime: "1 Minute",
		popular: true,
		icon: Sparkles,
		color: "from-rose-500 to-pink-500",
		liveDemo: "https://all-scripts-bundle.vercel.app/",
	},
];

const paymentOptions = {
	upi: {
		label: "UPI",
		id: "adsenseservices90@axl",
		qr: "/upiscanner.jpeg",
		note: "Scan using any UPI app (PhonePe, GPay, Paytm, etc.) and enter the transaction ID.",
		currency: "INR",
	},
	binance: {
		label: "Binance Pay",
		id: "556105059",
		qr: "/usdtscanner.jpeg",
		note: "Send USDT (TRC20) via Binance Pay. Copy the transaction hash.",
		currency: "USDT",
	},
};

const whatsappNumber = "447846137395";

const testimonials = [
	{
		name: "Sarah Khan",
		role: "Blogger",
		content:
			"Got approved in just 3 days! The script worked perfectly and saved me weeks of work.",
		rating: 5,
	},
	{
		name: "Aniket Sharma",
		role: "Affiliate Marketer",
		content:
			"Best investment I've made. The premium package is worth every penny. Highly recommended!",
		rating: 5,
	},
	{
		name: "Ansh Singh",
		role: "Content Creator",
		content:
			"I was struggling for months. This script got me approved on my first try. Amazing!",
		rating: 5,
	},
];

const features = [
	{
		icon: Zap,
		title: "Instant Setup",
		description:
			"Get started in minutes, not days. No technical knowledge required.",
	},
	{
		icon: Shield,
		title: "100% Legal",
		description:
			"All scripts comply with Google AdSense policies and guidelines.",
	},
	{
		icon: TrendingUp,
		title: "High Success Rate",
		description:
			"98%+ approval rate with our proven scripts and templates.",
	},
	{
		icon: Clock,
		title: "Fast Delivery",
		description: "Instant download after purchase. No waiting, no delays.",
	},
	{
		icon: Users,
		title: "24/7 Support",
		description:
			"Get help whenever you need it from our expert support team.",
	},
	{
		icon: DollarSign,
		title: "Money-Back Guarantee",
		description:
			"Not satisfied? Get a full refund within 30 days, no questions asked.",
	},
];

const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			delayChildren: 0.2,
			staggerChildren: 0.1,
		},
	},
};

const itemVariants = {
	hidden: { y: 20, opacity: 0 },
	visible: {
		y: 0,
		opacity: 1,
	},
};

export default function OffersPage() {
	const [selectedCategory, setSelectedCategory] = useState("All");
	const [checkoutOpen, setCheckoutOpen] = useState(false);
	const [selectedScript, setSelectedScript] = useState(null);
	const [paymentMethod, setPaymentMethod] = useState("upi");
	const [formData, setFormData] = useState({ email: "", transactionId: "" });
	const [isLoading, setIsLoading] = useState(false);
	const [successDialogOpen, setSuccessDialogOpen] = useState(false);
	const [successDetails, setSuccessDetails] = useState(null);

	const buildWhatsappLink = (scriptTitle = "AdSense script") =>
		`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
			`Hi team, I just purchased the ${scriptTitle} and submitted my payment. Please help me activate it. My email is ${formData.email} and my transaction ID is ${formData.transactionId}.`
		)}`;

	const filteredScripts =
		selectedCategory === "All"
			? scripts
			: selectedCategory === "Popular"
			? scripts.filter((s) => s.popular)
			: scripts.filter((s) => parseFloat(s.price.replace("$", "")) < 50);

	const handleOpenCheckout = (script) => {
		setSelectedScript(script);
		setCheckoutOpen(true);
		setPaymentMethod("upi");
		setFormData({ email: "", transactionId: "" });
	};

	const apiKey = "46122254";
	const formId = "47128296-eb12-4bcf-ac0c-715230af3f49";

	const handleSubmitCheckout = async (event) => {
		event.preventDefault();
		setIsLoading(true);
		try {
			const data = {
				fields: [
					{ name: "full_name", value: selectedScript?.name },
					{ name: "email", value: formData.email },
					{ name: "transaction_id", value: formData.transactionId },
				],
			};

			const response = await axios.post(
				`https://api.hsforms.com/submissions/v3/integration/submit/${apiKey}/${formId}`,
				data,
				{
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
			if (response.status === 200) {
				setSuccessDetails({
					email: formData.email,
					scriptName: selectedScript?.name,
					paymentMethod,
				});
				setCheckoutOpen(false);
				setSuccessDialogOpen(true);
				setFormData({ email: "", transactionId: "" });
			}
		} catch (error) {
			console.log(error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'>
			{/* Hero Section */}
			<section className='relative pt-20 pb-16 px-4 overflow-hidden'>
				<div className='absolute inset-0 opacity-10'></div>
				<div className='container mx-auto relative z-10'>
					<motion.div
						className='text-center max-w-4xl mx-auto'
						initial='hidden'
						animate='visible'
						variants={containerVariants}>
						<motion.div
							className='inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 rounded-full px-4 py-2 mb-6'
							variants={itemVariants}>
							<BadgeCheck className='h-4 w-4 text-purple-400' />
							<span className='text-sm text-purple-300'>
								Trusted by 10,000+ Users Worldwide
							</span>
						</motion.div>
						<motion.h1
							className='text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent'
							variants={itemVariants}>
							Get AdSense Approved
							<br />
							<span className='bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'>
								In Days, Not Months
							</span>
						</motion.h1>
						<motion.p
							className='text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed'
							variants={itemVariants}>
							Premium AdSense Approval Scripts & Tools That
							Actually Work.
							<br />
							<span className='text-purple-400 font-semibold'>
								98%+ Success Rate • Instant Download •
								Money-Back Guarantee
							</span>
						</motion.p>
						<motion.div
							className='flex flex-col sm:flex-row gap-4 justify-center items-center'
							variants={itemVariants}>
							<Button
								asChild
								size='lg'
								className='bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg px-8 py-6 rounded-full shadow-lg shadow-purple-500/50'>
								<Link href='#scripts'>
									View All Scripts
									<ArrowRight className='ml-2 h-5 w-5' />
								</Link>
							</Button>
							<Button
								asChild
								size='lg'
								variant='outline'
								className='border-purple-500/50 hover:bg-purple-500/10 hover:text-white text-lg px-8 py-6 rounded-full'>
								<Link href='#testimonials'>
									See Success Stories
								</Link>
							</Button>
						</motion.div>
						<motion.div
							className='mt-12 flex flex-wrap justify-center gap-8 text-center'
							variants={itemVariants}>
							<div>
								<div className='text-3xl font-bold text-purple-400'>
									10,000+
								</div>
								<div className='text-gray-400'>
									Happy Customers
								</div>
							</div>
							<div>
								<div className='text-3xl font-bold text-pink-400'>
									98%
								</div>
								<div className='text-gray-400'>
									Success Rate
								</div>
							</div>
							<div>
								<div className='text-3xl font-bold text-cyan-400'>
									24/7
								</div>
								<div className='text-gray-400'>
									Support Available
								</div>
							</div>
						</motion.div>
					</motion.div>
				</div>
			</section>

			{/* Scripts Section */}
			<section id='scripts' className='py-16 px-4'>
				<div className='container mx-auto'>
					<motion.div
						className='text-center mb-12'
						initial='hidden'
						whileInView='visible'
						viewport={{ once: true }}
						variants={containerVariants}>
						<motion.h2
							className='text-4xl md:text-5xl font-bold mb-4 text-white'
							variants={itemVariants}>
							Choose Your Perfect Script
						</motion.h2>
						<motion.p
							className='text-xl text-gray-300 max-w-2xl mx-auto mb-8'
							variants={itemVariants}>
							From quick solutions to complete packages - we have
							everything you need
						</motion.p>
						<motion.div
							className='flex flex-wrap justify-center gap-4'
							variants={itemVariants}>
							{["All", "Popular", "Budget"].map((cat) => (
								<Button
									key={cat}
									variant={
										selectedCategory === cat
											? "default"
											: "outline"
									}
									onClick={() => setSelectedCategory(cat)}
									className={
										selectedCategory === cat
											? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none"
											: "border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
									}>
									{cat}
								</Button>
							))}
						</motion.div>
					</motion.div>

					<motion.div
						className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'
						initial='hidden'
						whileInView='visible'
						viewport={{ once: true }}
						variants={containerVariants}>
						{filteredScripts.map((script) => (
							<motion.div
								key={script.id}
								variants={itemVariants}
								whileHover={{ y: -5 }}
								transition={{ duration: 0.2 }}>
								<Card className='bg-gradient-to-br border-purple-500/20 hover:border-purple-500/50 transition-all h-full flex flex-col relative overflow-hidden'>
									{script.popular && (
										<div className='absolute top-4 right-4 z-10'>
											<Badge className='bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-none'>
												<Star className='h-3 w-3 mr-1' />
												Popular
											</Badge>
										</div>
									)}
									<div
										className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${script.color}`}></div>
									<CardHeader>
										<div
											className={`w-14 h-14 rounded-xl bg-gradient-to-br ${script.color} flex items-center justify-center mb-4`}>
											<script.icon className='h-7 w-7 text-white' />
										</div>
										<CardTitle className='text-white text-xl mb-2'>
											{script.name}
										</CardTitle>
										<CardDescription className='text-gray-400'>
											{script.description}
										</CardDescription>
									</CardHeader>
									<CardContent className='flex-grow'>
										<div className='mb-4'>
											<div className='flex items-baseline gap-2 mb-2'>
												<span className='text-3xl font-bold text-white'>
													{script.price}
												</span>
												<span className='text-lg text-gray-500 line-through'>
													{script.originalPrice}
												</span>
											</div>
											<div className='flex items-center gap-4 text-sm text-gray-400'>
												<span className='flex items-center gap-1'>
													<CheckCircle2 className='h-4 w-4 text-green-400' />
													{script.successRate} Success
												</span>
												<span className='flex items-center gap-1'>
													<Clock className='h-4 w-4 text-blue-400' />
													{script.deliveryTime}
												</span>
											</div>
										</div>
										<ul className='space-y-2 mb-4'>
											{script.features.map(
												(feature, idx) => (
													<li
														key={idx}
														className='flex items-start gap-2 text-sm text-gray-300'>
														<CheckCircle2 className='h-4 w-4 text-green-400 mt-0.5 flex-shrink-0' />
														<span>{feature}</span>
													</li>
												)
											)}
										</ul>
									</CardContent>
									<CardFooter className='flex justify-center gap-2'>
										<Link
											href={script?.liveDemo || ""}
											target='_blank'>
											<Button className='w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'>
												Live Demo
												<LinkIcon className='ml-2 h-4 w-4' />
											</Button>
										</Link>
										<Button
											className='bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
											onClick={() =>
												handleOpenCheckout(script)
											}>
											Get Instant Access
											<ArrowRight className='ml-2 h-4 w-4' />
										</Button>
									</CardFooter>
								</Card>
							</motion.div>
						))}
					</motion.div>
				</div>
			</section>

			{/* Features Section */}
			<section className='py-16 px-4 bg-black/20'>
				<div className='container mx-auto'>
					<motion.div
						className='text-center mb-12'
						initial='hidden'
						whileInView='visible'
						viewport={{ once: true }}
						variants={containerVariants}>
						<motion.h2
							className='text-4xl md:text-5xl font-bold mb-4 text-white'
							variants={itemVariants}>
							Why Choose Our Scripts?
						</motion.h2>
						<motion.p
							className='text-xl text-gray-300 max-w-2xl mx-auto'
							variants={itemVariants}>
							Everything you need to get AdSense approved quickly
							and easily
						</motion.p>
					</motion.div>
					<div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
						{features.map((feature, index) => (
							<motion.div
								key={index}
								initial='hidden'
								whileInView='visible'
								viewport={{ once: true }}
								variants={itemVariants}
								transition={{ delay: index * 0.1 }}>
								<Card className='bg-white/5 backdrop-blur-sm border-purple-500/20 hover:border-purple-500/50 transition-all'>
									<CardHeader>
										<div className='w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4'>
											<feature.icon className='h-6 w-6 text-white' />
										</div>
										<CardTitle className='text-white'>
											{feature.title}
										</CardTitle>
									</CardHeader>
									<CardContent>
										<CardDescription className='text-gray-400'>
											{feature.description}
										</CardDescription>
									</CardContent>
								</Card>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* Testimonials Section */}
			<section id='testimonials' className='py-16 px-4 bg-black/20'>
				<div className='container mx-auto'>
					<motion.div
						className='text-center mb-12'
						initial='hidden'
						whileInView='visible'
						viewport={{ once: true }}
						variants={containerVariants}>
						<motion.h2
							className='text-4xl md:text-5xl font-bold mb-4 text-white'
							variants={itemVariants}>
							Success Stories
						</motion.h2>
						<motion.p
							className='text-xl text-gray-300 max-w-2xl mx-auto'
							variants={itemVariants}>
							Join thousands of satisfied customers who got
							AdSense approved
						</motion.p>
					</motion.div>
					<div className='grid md:grid-cols-3 gap-6'>
						{testimonials.map((testimonial, index) => (
							<motion.div
								key={index}
								initial='hidden'
								whileInView='visible'
								viewport={{ once: true }}
								variants={itemVariants}
								transition={{ delay: index * 0.1 }}>
								<Card className='bg-white/5 backdrop-blur-sm border-purple-500/20'>
									<CardHeader>
										<div className='flex items-center gap-1 mb-2'>
											{[...Array(testimonial.rating)].map(
												(_, i) => (
													<Star
														key={i}
														className='h-5 w-5 fill-yellow-400 text-yellow-400'
													/>
												)
											)}
										</div>
										<CardDescription className='text-gray-300 text-base'>
											"{testimonial.content}"
										</CardDescription>
									</CardHeader>
									<CardContent>
										<div className='font-semibold text-white'>
											{testimonial.name}
										</div>
										<div className='text-sm text-gray-400'>
											{testimonial.role}
										</div>
									</CardContent>
								</Card>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className='py-20 px-4'>
				<div className='container mx-auto'>
					<motion.div
						className='max-w-4xl mx-auto text-center bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-3xl p-12 border border-purple-500/30'
						initial='hidden'
						whileInView='visible'
						viewport={{ once: true }}
						variants={containerVariants}>
						<motion.h2
							className='text-4xl md:text-5xl font-bold mb-6 text-white'
							variants={itemVariants}>
							Ready to Get AdSense Approved?
						</motion.h2>
						<motion.p
							className='text-xl text-gray-300 mb-8 max-w-2xl mx-auto'
							variants={itemVariants}>
							Stop waiting months for approval. Get instant access
							to proven scripts that work. Join 10,000+ successful
							users today!
						</motion.p>
						<motion.div
							className='flex flex-col sm:flex-row gap-4 justify-center'
							variants={itemVariants}>
							<Button
								asChild
								size='lg'
								className='bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg px-10 py-6 rounded-full shadow-lg shadow-purple-500/50'>
								<Link href='#scripts'>
									Browse All Scripts
									<ArrowRight className='ml-2 h-5 w-5' />
								</Link>
							</Button>
							<Button
								asChild
								size='lg'
								variant='outline'
								className='border-purple-500/50 text-purple-300 hover:bg-purple-500/10 text-lg px-10 py-6 rounded-full'>
								<Link href='/contact'>Contact Support</Link>
							</Button>
						</motion.div>
						<motion.div
							className='mt-8 flex flex-wrap justify-center gap-6 text-sm text-gray-400'
							variants={itemVariants}>
							<div className='flex items-center gap-2'>
								<CheckCircle2 className='h-4 w-4 text-green-400' />
								Instant Download
							</div>
							<div className='flex items-center gap-2'>
								<CheckCircle2 className='h-4 w-4 text-green-400' />
								30-Day Money-Back Guarantee
							</div>
							<div className='flex items-center gap-2'>
								<CheckCircle2 className='h-4 w-4 text-green-400' />
								Lifetime Updates
							</div>
						</motion.div>
					</motion.div>
				</div>
			</section>

			<Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
				<DialogContent className='bg-slate-900 text-white border border-purple-500/30 max-w-4xl'>
					{selectedScript && (
						<>
							<DialogHeader>
								<DialogTitle className='text-2xl text-white'>
									Checkout • {selectedScript.name}
								</DialogTitle>
								<DialogDescription className='text-gray-300'>
									Complete your payment via UPI or Binance
									Pay, then share your email and transaction
									ID for instant activation.
								</DialogDescription>
							</DialogHeader>
							<div className='grid md:grid-cols-2 gap-8 mt-6'>
								<div className='space-y-5'>
									<div className='rounded-2xl bg-white/5 p-5 border border-purple-500/20'>
										<p className='text-sm uppercase tracking-widest text-purple-300'>
											Package Summary
										</p>
										<div className='mt-3 text-3xl font-bold text-white'>
											{selectedScript.price}
											<span className='text-base text-gray-400 font-medium ml-2 line-through'>
												{selectedScript.originalPrice}
											</span>
										</div>
										<p className='text-sm text-gray-400 mt-2'>
											Includes lifetime updates + 24/7
											support
										</p>
									</div>

									<div className='flex gap-3'>
										{Object.entries(paymentOptions).map(
											([key, option]) => (
												<button
													key={key}
													type='button'
													onClick={() =>
														setPaymentMethod(key)
													}
													className={`flex-1 rounded-2xl border px-4 py-3 text-left transition ${
														paymentMethod === key
															? "border-purple-500 bg-purple-500/10 text-white"
															: "border-white/10 text-gray-300 hover:border-purple-400/60"
													}`}>
													<div className='text-sm text-gray-400'>
														Pay with
													</div>
													<div className='text-lg font-semibold'>
														{option.label}
													</div>
												</button>
											)
										)}
									</div>

									<div className='rounded-2xl bg-white/5 p-4 border border-white/10 text-center'>
										<p className='text-sm text-gray-400'>
											{
												paymentOptions[paymentMethod]
													.label
											}{" "}
											ID
										</p>
										<p className='text-lg font-semibold text-white mt-1'>
											{paymentOptions[paymentMethod].id}
										</p>
										<div className='mt-4 flex flex-col items-center gap-3'>
											<Image
												src={
													paymentOptions[
														paymentMethod
													].qr
												}
												alt={`${paymentOptions[paymentMethod].label} QR`}
												width={220}
												height={220}
												className='rounded-xl border border-purple-500/30 w-full max-w-[220px] object-cover'
											/>
											<p className='text-xs text-gray-400'>
												{
													paymentOptions[
														paymentMethod
													].note
												}
											</p>
										</div>
									</div>
								</div>

								<form
									onSubmit={handleSubmitCheckout}
									className='space-y-5'>
									<div>
										<Label
											htmlFor='email'
											className='text-gray-300'>
											Email address
										</Label>
										<Input
											id='email'
											type='email'
											required
											placeholder='you@example.com'
											value={formData.email}
											onChange={(e) =>
												setFormData((prev) => ({
													...prev,
													email: e.target.value,
												}))
											}
											className='mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-500'
										/>
									</div>

									<div>
										<Label
											htmlFor='transaction'
											className='text-gray-300'>
											Transaction / UTR / Txn Hash
										</Label>
										<Input
											id='transaction'
											required
											placeholder='Enter the payment reference'
											value={formData.transactionId}
											onChange={(e) =>
												setFormData((prev) => ({
													...prev,
													transactionId:
														e.target.value,
												}))
											}
											className='mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-500'
										/>
									</div>

									<div className='rounded-2xl bg-black/30 border border-white/5 p-4 text-sm text-gray-400 space-y-2'>
										<p>
											⚡ Send the exact amount mentioned
											above. Orders are verified within
											10-30 minutes.
										</p>
										<p>
											📧 After submission our team will
											send the download link and setup
											guide directly to your mail inbox.
										</p>
									</div>

									<Button
										disabled={
											!formData.email ||
											!formData.transactionId ||
											isLoading
										}
										type='submit'
										className='w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg flex items-center justify-center gap-2'>
										{isLoading ? (
											<>
												<Loader2 className='h-4 w-4 animate-spin' />
												Processing
											</>
										) : (
											<>
												Order Now
												<ArrowRight className='h-4 w-4' />
											</>
										)}
									</Button>

									<p className='text-xs text-gray-500 text-center'>
										Need help?{" "}
										<Link
											href={buildWhatsappLink(
												selectedScript?.name
											)}
											className='text-purple-300 underline-offset-2 hover:underline'>
											Chat with support
										</Link>
									</p>
								</form>
							</div>
						</>
					)}
				</DialogContent>
			</Dialog>

			<Dialog
				open={successDialogOpen}
				onOpenChange={setSuccessDialogOpen}>
				{successDetails && (
					<DialogContent className='bg-slate-900 text-white border border-emerald-500/30 max-w-xl text-center space-y-6'>
						<DialogHeader>
							<DialogTitle className='text-3xl font-bold text-white'>
								Payment Received 🎉
							</DialogTitle>
							<DialogDescription className='text-gray-300 text-base'>
								Thanks, {successDetails.email}! We are verifying
								your{" "}
								{successDetails.paymentMethod.toUpperCase()}{" "}
								transaction for{" "}
								<span className='font-semibold text-white'>
									{successDetails.scriptName}
								</span>
								. Expect your access email within 10-30 minutes.
							</DialogDescription>
						</DialogHeader>

						<div className='rounded-2xl bg-white/5 border border-white/10 p-5 text-left space-y-3'>
							<p className='text-sm text-gray-300'>
								✅ Order received • Our team is matching your
								transaction ID.
							</p>
							<p className='text-sm text-gray-300'>
								📩 We will send the download link and onboarding
								guide to{" "}
								<span className='text-white font-medium'>
									{successDetails.email}
								</span>
							</p>
							<p className='text-sm text-gray-300'>
								💬 Need instant help? Ping us on WhatsApp and
								share your transaction screenshot.
							</p>
						</div>

						<div className='flex flex-col sm:flex-row gap-3'>
							<Button
								asChild
								className='flex-1 bg-green-500 hover:bg-green-600 text-white'>
								<a
									href={buildWhatsappLink(
										successDetails.scriptName
									)}
									target='_blank'
									rel='noreferrer'>
									<MessageCircle className='h-4 w-4' />
									WhatsApp Support
								</a>
							</Button>
							<Button
								variant='outline'
								className='flex-1 text-gray-800 hover:text-white border-gray-400/20 hover:bg-gray-400/10'
								onClick={() => setSuccessDialogOpen(false)}>
								Browse more scripts
							</Button>
						</div>
					</DialogContent>
				)}
			</Dialog>
		</div>
	);
}
