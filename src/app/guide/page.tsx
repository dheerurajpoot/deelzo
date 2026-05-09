import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	UserPlus,
	Shield,
	FileText,
	DollarSign,
	MessageSquare,
	CheckCircle,
	Search,
	Eye,
	Handshake,
	CreditCard,
	TrendingUp,
	ArrowRight,
	Info,
	Percent,
} from "lucide-react";

import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Getting Started Guide",
	description:
		"Learn how to buy and sell digital assets on Deelzo. Follow our simple steps to get started today!",
};

export default function Guide() {
	const sellerSteps = [
		{
			icon: UserPlus,
			title: "Create Your Account",
			description:
				"Sign up with your email and phone number to get started on Deelzo. It only takes a few minutes!",
			color: "from-blue-500 to-cyan-500",
			bgColor: "from-blue-50 to-cyan-50",
		},
		{
			icon: Shield,
			title: "Verify Your Identity",
			description:
				"Complete our verification process to build trust with buyers and get verified seller status.",
			color: "from-emerald-500 to-green-500",
			bgColor: "from-emerald-50 to-green-50",
		},
		{
			icon: FileText,
			title: "List Your Asset",
			description:
				"Add your digital asset with detailed metrics, images, and comprehensive information to attract buyers.",
			color: "from-purple-500 to-pink-500",
			bgColor: "from-purple-50 to-pink-50",
		},
		{
			icon: DollarSign,
			title: "Set Your Price",
			description:
				"Determine the asking price based on market value, performance metrics, and your asset's potential.",
			color: "from-amber-500 to-orange-500",
			bgColor: "from-amber-50 to-orange-50",
		},
		{
			icon: MessageSquare,
			title: "Receive Offers",
			description:
				"Buyers will review your listing and make purchase offers. You can negotiate and accept the best offer.",
			color: "from-indigo-500 to-blue-500",
			bgColor: "from-indigo-50 to-blue-50",
		},
		{
			icon: CheckCircle,
			title: "Complete Transaction",
			description:
				"Finalize the sale securely and receive payment minus our 5% platform fee. Transfer ownership smoothly.",
			color: "from-teal-500 to-cyan-500",
			bgColor: "from-teal-50 to-cyan-50",
		},
	];

	const buyerSteps = [
		{
			icon: Search,
			title: "Browse Listings",
			description:
				"Explore our marketplace to find digital assets that match your investment goals and budget. Use filters to narrow down your search.",
			color: "from-sky-500 to-blue-500",
		},
		{
			icon: Eye,
			title: "Review Details",
			description:
				"Examine comprehensive metrics, performance data, traffic statistics, and seller information before making a decision.",
			color: "from-violet-500 to-purple-500",
		},
		{
			icon: Handshake,
			title: "Make an Offer",
			description:
				"Contact the seller via WhatsApp or make a direct purchase. Our secure payment system protects both parties throughout the process.",
			color: "from-emerald-500 to-teal-500",
		},
		{
			icon: CreditCard,
			title: "Complete Purchase",
			description:
				"Finalize the transaction securely and receive immediate access to your newly acquired digital asset. Start growing it right away!",
			color: "from-rose-500 to-pink-500",
		},
	];

	return (
		<div className='min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100'>
			{/* Hero Section */}
			<div className='relative overflow-hidden bg-linear-to-r from-sky-500 via-blue-500 to-cyan-500 py-12 md:py-16'>
				<div className='absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl' />
				<div className='absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl' />
				<div className='max-w-4xl mx-auto px-4 md:px-8 text-center relative z-10'>
					<div className='inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 mb-6 shadow-lg'>
						<TrendingUp size={40} className='text-white' />
					</div>
					<h1 className='text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4'>
						Getting Started Guide
					</h1>
					<p className='text-white/90 text-lg md:text-xl max-w-2xl mx-auto'>
						Learn how to buy and sell digital assets on Deelzo.
						Follow our simple steps to get started today!
					</p>
				</div>
			</div>

			{/* Content */}
			<div className='max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-16'>
				{/* For Sellers */}
				<section className='mb-16'>
					<div className='text-center mb-12'>
						<div className='inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-emerald-50 to-green-50 rounded-full border border-emerald-200 mb-4'>
							<UserPlus size={20} className='text-emerald-600' />
							<span className='text-sm font-semibold text-emerald-700'>
								For Sellers
							</span>
						</div>
						<h2 className='text-3xl md:text-4xl font-bold text-slate-900 mb-4'>
							Sell Your Digital Assets
						</h2>
						<p className='text-slate-600 text-lg max-w-2xl mx-auto'>
							Follow these simple steps to list and sell your
							digital assets on Deelzo
						</p>
					</div>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
						{sellerSteps.map((step, index) => {
							const Icon = step.icon;
							return (
								<Card
									key={index}
									className='bg-white border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden'>
									{/* Step Number Badge */}
									<div className='absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm group-hover:bg-slate-200 transition-colors'>
										{index + 1}
									</div>
									<CardHeader className='pb-3'>
										<div
											className={`w-14 h-14 rounded-xl bg-linear-to-br ${step.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
											<Icon
												size={28}
												className='text-white'
											/>
										</div>
										<CardTitle className='text-slate-900 text-xl font-bold'>
											{step.title}
										</CardTitle>
									</CardHeader>
									<CardContent>
										<p className='text-slate-600 leading-relaxed text-sm'>
											{step.description}
										</p>
									</CardContent>
									{/* Connecting Line (for visual flow) */}
									{index < sellerSteps.length - 1 && (
										<div className='hidden lg:block absolute -right-3 top-1/2 transform -translate-y-1/2 z-10'>
											<ArrowRight
												size={24}
												className='text-slate-300'
											/>
										</div>
									)}
								</Card>
							);
						})}
					</div>
				</section>

				{/* For Buyers */}
				<section className='mb-16'>
					<div className='text-center mb-12'>
						<div className='inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-blue-50 to-sky-50 rounded-full border border-blue-200 mb-4'>
							<Search size={20} className='text-blue-600' />
							<span className='text-sm font-semibold text-blue-700'>
								For Buyers
							</span>
						</div>
						<h2 className='text-3xl md:text-4xl font-bold text-slate-900 mb-4'>
							Buy Digital Assets
						</h2>
						<p className='text-slate-600 text-lg max-w-2xl mx-auto'>
							Discover and purchase high-quality digital assets in
							just a few simple steps
						</p>
					</div>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						{buyerSteps.map((step, index) => {
							const Icon = step.icon;
							return (
								<Card
									key={index}
									className='bg-white border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden'>
									<CardHeader className='pb-3'>
										<div className='flex items-start gap-4'>
											<div
												className={`w-14 h-14 rounded-xl bg-linear-to-br ${step.color} flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
												<Icon
													size={28}
													className='text-white'
												/>
											</div>
											<div className='flex-1'>
												<div className='flex items-center gap-2 mb-2'>
													<span className='w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs'>
														{index + 1}
													</span>
													<CardTitle className='text-slate-900 text-xl font-bold'>
														{step.title}
													</CardTitle>
												</div>
												<p className='text-slate-600 leading-relaxed text-sm'>
													{step.description}
												</p>
											</div>
										</div>
									</CardHeader>
								</Card>
							);
						})}
					</div>
				</section>

				{/* Platform Fee */}
				<Card className='bg-linear-to-br p-0 from-slate-50 to-slate-100 border border-slate-200 shadow-xl overflow-hidden'>
					<div className='bg-linear-to-r from-sky-500 via-blue-500 to-cyan-500 p-6 md:p-8'>
						<div className='flex items-center gap-4 mb-4'>
							<div className='w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-lg'>
								<Percent size={32} className='text-white' />
							</div>
							<div>
								<CardTitle className='text-white text-2xl md:text-3xl font-bold mb-2'>
									Platform Fee
								</CardTitle>
								<p className='text-white/90 text-sm md:text-base'>
									Transparent pricing with no hidden costs
								</p>
							</div>
						</div>
					</div>
					<CardContent className='p-6 md:p-8'>
						<div className='mb-6'>
							<p className='text-slate-700 leading-relaxed text-base md:text-lg mb-6'>
								Deelzo charges a{" "}
								<strong className='text-slate-900'>
									5% success fee
								</strong>{" "}
								on all completed transactions. This fee is
								deducted from the seller's proceeds and helps us
								maintain a secure, verified marketplace with
								comprehensive support.
							</p>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
								<div className='bg-white rounded-xl p-6 border border-slate-200 shadow-sm'>
									<div className='flex items-center gap-3 mb-3'>
										<div className='w-10 h-10 rounded-lg bg-linear-to-br from-emerald-500 to-green-500 flex items-center justify-center'>
											<Info
												size={20}
												className='text-white'
											/>
										</div>
										<h4 className='font-bold text-slate-900 text-lg'>
											Fee Structure
										</h4>
									</div>
									<p className='text-slate-600 text-sm mb-2'>
										Only charged on successful sales
									</p>
									<p className='text-3xl font-bold text-emerald-600'>
										5%
									</p>
								</div>
								<div className='bg-white rounded-xl p-6 border border-slate-200 shadow-sm'>
									<div className='flex items-center gap-3 mb-3'>
										<div className='w-10 h-10 rounded-lg bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center'>
											<DollarSign
												size={20}
												className='text-white'
											/>
										</div>
										<h4 className='font-bold text-slate-900 text-lg'>
											Example Calculation
										</h4>
									</div>
									<div className='space-y-2'>
										<div className='flex justify-between text-sm'>
											<span className='text-slate-600'>
												Sale Price:
											</span>
											<span className='font-semibold text-slate-900'>
												$1,000
											</span>
										</div>
										<div className='flex justify-between text-sm'>
											<span className='text-slate-600'>
												Platform Fee (5%):
											</span>
											<span className='font-semibold text-rose-600'>
												-$50
											</span>
										</div>
										<div className='pt-2 border-t border-slate-200 flex justify-between'>
											<span className='font-bold text-slate-900'>
												You Receive:
											</span>
											<span className='font-bold text-emerald-600 text-lg'>
												$950
											</span>
										</div>
									</div>
								</div>
							</div>
							<div className='bg-linear-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200'>
								<p className='text-blue-900 text-sm font-medium flex items-start gap-2'>
									<Info
										size={18}
										className='text-blue-600 mt-0.5 shrink-0'
									/>
									<span>
										The platform fee is only charged when a
										transaction is successfully completed.
										No listing fees, no monthly fees, no
										hidden costs.
									</span>
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* CTA Section */}
				<div className='mt-12 text-center'>
					<Card className='bg-linear-to-r from-sky-500 via-blue-500 to-cyan-500 border-0 shadow-2xl overflow-hidden'>
						<div className='absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl' />
						<CardContent className='p-8 md:p-12 relative z-10'>
							<h3 className='text-2xl md:text-3xl font-bold text-white mb-4'>
								Ready to Get Started?
							</h3>
							<p className='text-white/90 text-lg mb-6 max-w-2xl mx-auto'>
								Join thousands of users buying and selling
								digital assets on Deelzo today
							</p>
							<div className='flex flex-col sm:flex-row gap-4 justify-center'>
								<Link href='/signup'>
									<Button
										size='lg'
										className='bg-white text-sky-600 hover:bg-slate-50 shadow-lg gap-2'>
										<UserPlus size={20} />
										Create Account
									</Button>
								</Link>
								<Link href='/marketplace'>
									<Button
										size='lg'
										variant='outline'
										className='border-2 border-white/30 hover:bg-white/20 backdrop-blur-sm gap-2'>
										<Search size={20} />
										Browse Marketplace
									</Button>
								</Link>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
