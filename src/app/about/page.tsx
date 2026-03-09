import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
	Facebook,
	Mail,
	Phone,
	MessageCircle,
	ExternalLink,
	CheckCircle,
	Shield,
	Zap,
	TrendingUp,
	Users,
	Globe,
	Star,
	ArrowRight,
} from "lucide-react";
import Image from "next/image";
import type { Metadata } from "next";
import { EMAIL, PHONE } from "@/lib/constant";

export const metadata: Metadata = {
	title: "About Us",
	description:
		"About Deelzo, the trusted marketplace for buying and selling digital assets.",
};

export default function About() {
	const features = [
		{
			icon: Shield,
			title: "Verified Sellers",
			description: "Transparent pricing and verified sellers",
		},
		{
			icon: CheckCircle,
			title: "Asset Verification",
			description: "Comprehensive asset verification process",
		},
		{
			icon: Zap,
			title: "Secure Transactions",
			description: "Secure transactions with escrow protection",
		},
		{
			icon: TrendingUp,
			title: "Performance Metrics",
			description: "Detailed performance metrics and analytics",
		},
		{
			icon: Users,
			title: "Expert Support",
			description: "Expert support and guidance",
		},
		{
			icon: Globe,
			title: "Global Reach",
			description: "Connect with buyers and sellers worldwide",
		},
	];

	const assetTypes = [
		"Websites & Blogs",
		"YouTube Channels",
		"Social Media Accounts",
		"E-commerce Stores",
		"SaaS Businesses",
		"Mobile Applications",
	];

	return (
		<div className='min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100'>
			{/* Hero Section */}
			<div className='relative overflow-hidden bg-linear-to-r from-sky-500 via-blue-500 to-cyan-500 py-12 md:py-16'>
				<div className='absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl' />
				<div className='absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl' />
				<div className='max-w-4xl mx-auto px-4 md:px-8 text-center relative z-10'>
					<h1 className='text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4'>
						About Deelzo
					</h1>
					<p className='text-white/90 text-lg md:text-xl max-w-2xl mx-auto'>
						The trusted marketplace for buying and selling digital
						assets. Empowering entrepreneurs and digital investors
						worldwide.
					</p>
				</div>
			</div>

			{/* Content */}
			<div className='max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-16'>
				{/* Mission Section */}
				<Card className='bg-white border border-slate-200 shadow-lg mb-8'>
					<CardContent className='p-6 md:p-8'>
						<div className='flex items-start gap-4 mb-4'>
							<div className='w-12 h-12 rounded-xl bg-linear-to-br from-sky-500 to-blue-500 flex items-center justify-center shrink-0'>
								<Star size={24} className='text-white' />
							</div>
							<div>
								<h2 className='text-2xl md:text-3xl font-bold text-slate-900 mb-3'>
									Our Mission
								</h2>
								<p className='text-slate-600 leading-relaxed text-base md:text-lg'>
									Deelzo is a trusted marketplace for buying
									and selling digital assets. We empower
									entrepreneurs and digital investors to
									discover, evaluate, and acquire high-quality
									digital properties with confidence.
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Why Choose Deelzo */}
				<div className='mb-12'>
					<h2 className='text-3xl md:text-4xl font-bold text-slate-900 mb-8 text-center'>
						Why Choose Deelzo?
					</h2>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6'>
						{features.map((feature, index) => {
							const Icon = feature.icon;
							return (
								<Card
									key={index}
									className='bg-white border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1'>
									<CardContent className='p-6'>
										<div className='w-12 h-12 rounded-xl bg-linear-to-br from-sky-500 to-blue-500 flex items-center justify-center mb-4'>
											<Icon
												size={24}
												className='text-white'
											/>
										</div>
										<h3 className='text-lg font-bold text-slate-900 mb-2'>
											{feature.title}
										</h3>
										<p className='text-slate-600 text-sm leading-relaxed'>
											{feature.description}
										</p>
									</CardContent>
								</Card>
							);
						})}
					</div>
				</div>

				{/* What We Offer */}
				<Card className='bg-white border border-slate-200 shadow-lg mb-8'>
					<CardContent className='p-6 md:p-8'>
						<h2 className='text-2xl md:text-3xl font-bold text-slate-900 mb-4'>
							What We Offer
						</h2>
						<p className='text-slate-600 leading-relaxed mb-6 text-base md:text-lg'>
							We provide a comprehensive platform for trading
							digital assets including:
						</p>
						<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4'>
							{assetTypes.map((item, index) => (
								<div
									key={index}
									className='p-4 bg-linear-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 hover:border-sky-300 transition-colors'>
									<p className='text-slate-900 font-semibold text-sm md:text-base'>
										{item}
									</p>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Commitment */}
				<Card className='bg-linear-to-br from-sky-50 to-blue-50 border border-sky-200 shadow-lg mb-12'>
					<CardContent className='p-6 md:p-8'>
						<div className='flex items-start gap-4'>
							<div className='w-12 h-12 rounded-xl bg-linear-to-br from-sky-500 to-blue-500 flex items-center justify-center shrink-0'>
								<Shield size={24} className='text-white' />
							</div>
							<div>
								<h2 className='text-2xl md:text-3xl font-bold text-slate-900 mb-3'>
									Our Commitment
								</h2>
								<p className='text-slate-700 leading-relaxed text-base md:text-lg'>
									We are committed to maintaining the highest
									standards of integrity, transparency, and
									customer service. Every transaction on
									Deelzo is protected by our comprehensive
									verification process and secure payment
									system.
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* About the Owner */}
				<Card className='bg-white border p-0 border-slate-200 shadow-xl overflow-hidden'>
					<div className='bg-linear-to-r from-indigo-600 via-purple-600 to-blue-600 p-6 md:p-8'>
						<div className='flex flex-col md:flex-row gap-6 md:gap-8 items-center'>
							<div className='w-32 h-32 md:w-40 md:h-40 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center text-white text-4xl md:text-5xl font-bold shadow-xl'>
								DR
							</div>
							<div className='flex-1 text-center md:text-left'>
								<h2 className='text-2xl md:text-3xl font-bold text-white mb-3'>
									About the Founder
								</h2>
								<p className='text-white/90 leading-relaxed text-base md:text-lg mb-4'>
									Hi, I'm <b>Dheeru Rajpoot</b>, the founder
									and creator of Deelzo. With extensive
									experience in web development and digital
									solutions, I built this platform to connect
									buyers and sellers of premium digital assets
									in a secure and trustworthy environment.
								</p>
								<div className='flex flex-col sm:flex-row gap-3 justify-center md:justify-start'>
									<Link
										href='https://www.linkedin.com/in/dheerurajpoot'
										target='_blank'
										rel='noopener noreferrer'
										className='inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white hover:bg-white/30 transition-colors'>
										<Facebook size={18} />
										Connect on LinkedIn
									</Link>
									<a
										href={`mailto:${EMAIL}`}
										className='inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white hover:bg-white/30 transition-colors'>
										<Mail size={18} />
										Contact
									</a>
									<a
										href={`https://wa.me/${PHONE}`}
										className='inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white hover:bg-white/30 transition-colors'>
										<Phone size={18} />
										Call
									</a>
								</div>
							</div>
						</div>
					</div>

					<CardContent className='p-6 md:p-8'>
						<h3 className='text-xl md:text-2xl font-bold text-slate-900 mb-6'>
							Get in Touch
						</h3>
						<div className='space-y-4'>
							{/* Professional Images */}
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6'>
								<div className='rounded-xl overflow-hidden border border-slate-200 shadow-lg group hover:shadow-xl transition-shadow'>
									<Image
										src='/ipad-logo.png'
										alt='Deelzo Platform Overview'
										width={500}
										height={300}
										className='w-full h-auto group-hover:scale-105 transition-transform duration-300'
									/>
									<p className='text-center text-sm text-slate-600 p-3 bg-slate-50 font-medium'>
										Platform Overview
									</p>
								</div>
								<div className='rounded-xl overflow-hidden border border-slate-200 shadow-lg group hover:shadow-xl transition-shadow'>
									<Image
										src='/isimage.png'
										alt='Deelzo Brand Identity'
										width={500}
										height={300}
										className='w-full h-auto group-hover:scale-105 transition-transform duration-300'
									/>
									<p className='text-center text-sm text-slate-600 p-3 bg-slate-50 font-medium'>
										Brand Identity
									</p>
								</div>
							</div>

							{/* Contact Options */}
							<div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
								<Link
									href='/contact'
									className='flex items-center justify-center gap-2 p-4 bg-linear-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 rounded-xl border border-emerald-200 text-emerald-700 transition-all duration-200 hover:shadow-lg group'>
									<MessageCircle size={20} />
									<span className='font-semibold'>
										Send Message
									</span>
									<ArrowRight
										size={16}
										className='group-hover:translate-x-1 transition-transform'
									/>
								</Link>

								<Link
									href='/contact'
									className='flex items-center justify-center gap-2 p-4 bg-linear-to-r from-blue-50 to-sky-50 hover:from-blue-100 hover:to-sky-100 rounded-xl border border-blue-200 text-blue-700 transition-all duration-200 hover:shadow-lg group'>
									<Shield size={20} />
									<span className='font-semibold'>
										Support
									</span>
									<ArrowRight
										size={16}
										className='group-hover:translate-x-1 transition-transform'
									/>
								</Link>

								<Link
									href='/shop'
									className='flex items-center justify-center gap-2 p-4 bg-linear-to-r from-cyan-50 to-teal-50 hover:from-cyan-100 hover:to-teal-100 rounded-xl border border-cyan-200 text-cyan-700 transition-all duration-200 hover:shadow-lg group'>
									<ExternalLink size={20} />
									<span className='font-semibold'>Shop</span>
									<ArrowRight
										size={16}
										className='group-hover:translate-x-1 transition-transform'
									/>
								</Link>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
