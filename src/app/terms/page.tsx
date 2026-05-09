import type { Metadata } from "next";
import { Check, CheckCircle, XCircle, Shield, Mail, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
	title: "Terms of Service",
	description:
		"Terms of service for Deelzo, the trusted marketplace for buying and selling digital products.",
};

export default function Terms() {
	return (
		<div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100'>
			{/* Header */}
			<div className='bg-white border-b border-slate-200'>
				<div className='max-w-4xl mx-auto px-4 md:px-8 py-12'>
					<h1 className='text-4xl md:text-5xl font-bold text-slate-900 mb-4'>
						Terms of Service
					</h1>
					<p className='text-slate-600 text-lg'>
						Last updated: December 2025
					</p>
				</div>
			</div>

			{/* Content */}
			<div className='max-w-4xl mx-auto px-4 md:px-8 py-16'>
				<div className='space-y-12 text-slate-700'>
					
					{/* Introduction */}
					<section className='bg-white rounded-2xl border border-slate-200 p-8 shadow-lg'>
						<h2 className='text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3'>
							<div className='w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center'>
								<span className='text-white font-bold text-lg'>1</span>
							</div>
							Acceptance of Terms
						</h2>
						<div className='prose prose-slate max-w-none space-y-4'>
							<p className='text-lg leading-relaxed'>
								By accessing and using Deelzo, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
							</p>
							<div className='bg-gradient-to-r from-orange-50 to-rose-50 border-l-4 border-orange-500 p-4 rounded-r-lg'>
								<p className='text-slate-700 font-medium'>
									Important: These terms apply to all users of our digital product marketplace, including buyers, sellers, and visitors.
								</p>
							</div>
						</div>
					</section>

					{/* Account Terms */}
					<section className='bg-white rounded-2xl border border-slate-200 p-8 shadow-lg'>
						<h2 className='text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3'>
							<div className='w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center'>
								<span className='text-white font-bold text-lg'>2</span>
							</div>
							Account Terms
						</h2>
						<div className='space-y-4'>
							<div className='flex items-start gap-3'>
								<div className='w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-1'>
									<CheckCircle size={16} className='text-emerald-600' />
								</div>
								<div>
									<h3 className='font-semibold text-slate-900 mb-1'>Account Registration</h3>
									<p className='text-slate-600'>You must provide accurate and complete information when creating an account.</p>
								</div>
							</div>
							<div className='flex items-start gap-3'>
								<div className='w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-1'>
									<CheckCircle size={16} className='text-emerald-600' />
								</div>
								<div>
									<h3 className='font-semibold text-slate-900 mb-1'>Account Security</h3>
									<p className='text-slate-600'>You are responsible for maintaining the security of your account and password.</p>
								</div>
							</div>
							<div className='flex items-start gap-3'>
								<div className='w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-1'>
									<CheckCircle size={16} className='text-emerald-600' />
								</div>
								<div>
									<h3 className='font-semibold text-slate-900 mb-1'>Account Restrictions</h3>
									<p className='text-slate-600'>You may not use the service for any illegal or unauthorized purpose.</p>
								</div>
							</div>
						</div>
					</section>

					{/* Payment Terms */}
					<section className='bg-white rounded-2xl border border-slate-200 p-8 shadow-lg'>
						<h2 className='text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3'>
							<div className='w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center'>
								<span className='text-white font-bold text-lg'>3</span>
							</div>
							Payment Terms
						</h2>
						<div className='grid md:grid-cols-2 gap-6'>
							<div className='space-y-4'>
								<h3 className='font-semibold text-slate-900 text-lg'>For Buyers</h3>
								<ul className='space-y-2 text-slate-600'>
									<li className='flex items-start gap-2'>
										<Check size={18} className='text-emerald-500 flex-shrink-0 mt-0.5' />
										<span>Payments are processed securely through our payment partners</span>
									</li>
									<li className='flex items-start gap-2'>
										<Check size={18} className='text-emerald-500 flex-shrink-0 mt-0.5' />
										<span>5% platform fee applied to all transactions</span>
									</li>
									<li className='flex items-start gap-2'>
										<Check size={18} className='text-emerald-500 flex-shrink-0 mt-0.5' />
										<span>Refunds subject to our 30-day return policy</span>
									</li>
								</ul>
							</div>
							<div className='space-y-4'>
								<h3 className='font-semibold text-slate-900 text-lg'>For Sellers</h3>
								<ul className='space-y-2 text-slate-600'>
									<li className='flex items-start gap-2'>
										<Check size={18} className='text-emerald-500 flex-shrink-0 mt-0.5' />
										<span>Payouts processed within 5-7 business days</span>
									</li>
									<li className='flex items-start gap-2'>
										<Check size={18} className='text-emerald-500 flex-shrink-0 mt-0.5' />
										<span>95% of sale price goes to sellers after fees</span>
									</li>
									<li className='flex items-start gap-2'>
										<Check size={18} className='text-emerald-500 flex-shrink-0 mt-0.5' />
										<span>Must provide accurate product information</span>
									</li>
								</ul>
							</div>
						</div>
					</section>

					{/* Product Terms */}
					<section className='bg-white rounded-2xl border border-slate-200 p-8 shadow-lg'>
						<h2 className='text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3'>
							<div className='w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center'>
								<span className='text-white font-bold text-lg'>4</span>
							</div>
							Product Terms
						</h2>
						<div className='space-y-6'>
							<div>
								<h3 className='font-semibold text-slate-900 mb-3'>Product Listings</h3>
								<ul className='space-y-2 text-slate-600'>
									<li className='flex items-start gap-2'>
										<Check size={18} className='text-violet-500 flex-shrink-0 mt-0.5' />
										<span>All products must be accurately described with clear titles and descriptions</span>
									</li>
									<li className='flex items-start gap-2'>
										<Check size={18} className='text-violet-500 flex-shrink-0 mt-0.5' />
										<span>High-quality images are required for all listings</span>
									</li>
									<li className='flex items-start gap-2'>
										<Check size={18} className='text-violet-500 flex-shrink-0 mt-0.5' />
										<span>Products must be original work or properly licensed</span>
									</li>
								</ul>
							</div>
							<div>
								<h3 className='font-semibold text-slate-900 mb-3'>Prohibited Items</h3>
								<div className='grid md:grid-cols-2 gap-4'>
									<div className='bg-red-50 border border-red-200 rounded-lg p-4'>
										<h4 className='font-medium text-red-800 mb-2'>Strictly Prohibited</h4>
										<ul className='text-red-700 text-sm space-y-1'>
											<li>• Illegal content or activities</li>
											<li>• Copyrighted material without permission</li>
											<li>• Malicious software or code</li>
											<li>• Gambling or betting related products</li>
											<li>• Adult content</li>
										</ul>
									</div>
									<div className='bg-amber-50 border border-amber-200 rounded-lg p-4'>
										<h4 className='font-medium text-amber-800 mb-2'>Restricted Categories</h4>
										<ul className='text-amber-700 text-sm space-y-1'>
											<li>• Financial services (regulated)</li>
											<li>• Medical/health products</li>
											<li>• Cryptocurrency related</li>
											<li>• Weapons or dangerous items</li>
										</ul>
									</div>
								</div>
							</div>
						</div>
					</section>

					{/* Return Policy */}
					<section className='bg-white rounded-2xl border border-slate-200 p-8 shadow-lg'>
						<h2 className='text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3'>
							<div className='w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center'>
								<span className='text-white font-bold text-lg'>5</span>
							</div>
							Return Policy
						</h2>
						<div className='space-y-6'>
							<div className='bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6'>
								<div className='flex items-center gap-3 mb-3'>
									<Shield size={24} className='text-emerald-600' />
									<h3 className='text-xl font-bold text-slate-900'>30-Day Money Back Guarantee</h3>
								</div>
								<p className='text-slate-700 mb-4'>
									We offer a 30-day satisfaction guarantee on all digital products purchased through our platform.
								</p>
								<div className='grid md:grid-cols-3 gap-4 text-sm'>
									<div className='bg-white rounded-lg p-3'>
										<p className='font-semibold text-slate-900'>Full Refund</p>
										<p className='text-slate-600'>Within 30 days of purchase</p>
									</div>
									<div className='bg-white rounded-lg p-3'>
										<p className='font-semibold text-slate-900'>No Reason Required</p>
										<p className='text-slate-600'>Simple return process</p>
									</div>
									<div className='bg-white rounded-lg p-3'>
										<p className='font-semibold text-slate-900'>Quick Processing</p>
										<p className='text-slate-600'>Refunded within 48 hours</p>
									</div>
								</div>
							</div>
							
							<div className='grid md:grid-cols-2 gap-6'>
								<div>
									<h4 className='font-semibold text-slate-900 mb-3'>Eligibility Requirements</h4>
									<ul className='space-y-2 text-slate-600'>
										<li className='flex items-start gap-2'>
											<Check size={18} className='text-emerald-500 flex-shrink-0 mt-0.5' />
											<span>Request made within 30 days of purchase</span>
										</li>
										<li className='flex items-start gap-2'>
											<Check size={18} className='text-emerald-500 flex-shrink-0 mt-0.5' />
											<span>Original files must be unused</span>
										</li>
										<li className='flex items-start gap-2'>
											<Check size={18} className='text-emerald-500 flex-shrink-0 mt-0.5' />
											<span>Valid proof of purchase required</span>
										</li>
									</ul>
								</div>
								<div>
									<h4 className='font-semibold text-slate-900 mb-3'>Non-Refundable Items</h4>
									<ul className='space-y-2 text-slate-600'>
										<li className='flex items-start gap-2'>
											<XCircle size={18} className='text-rose-500 flex-shrink-0 mt-0.5' />
											<span>Partially used or modified products</span>
										</li>
										<li className='flex items-start gap-2'>
											<XCircle size={18} className='text-rose-500 flex-shrink-0 mt-0.5' />
											<span>Products used for commercial purposes</span>
										</li>
										<li className='flex items-start gap-2'>
											<XCircle size={18} className='text-rose-500 flex-shrink-0 mt-0.5' />
											<span>Digital content that has been downloaded</span>
										</li>
									</ul>
								</div>
							</div>
						</div>
					</section>

					{/* Intellectual Property */}
					<section className='bg-white rounded-2xl border border-slate-200 p-8 shadow-lg'>
						<h2 className='text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3'>
							<div className='w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center'>
								<span className='text-white font-bold text-lg'>6</span>
							</div>
							Intellectual Property
						</h2>
						<div className='space-y-4'>
							<div className='flex items-start gap-3'>
								<div className='w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-1'>
									<CheckCircle size={16} className='text-amber-600' />
								</div>
								<div>
									<h3 className='font-semibold text-slate-900 mb-1'>Ownership</h3>
									<p className='text-slate-600'>You retain all rights to your original content, but grant us a license to display it on our platform.</p>
								</div>
							</div>
							<div className='flex items-start gap-3'>
								<div className='w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-1'>
									<CheckCircle size={16} className='text-amber-600' />
								</div>
								<div>
									<h3 className='font-semibold text-slate-900 mb-1'>Infringement</h3>
									<p className='text-slate-600'>You may not upload content that infringes on others' intellectual property rights.</p>
								</div>
							</div>
							<div className='flex items-start gap-3'>
								<div className='w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-1'>
									<CheckCircle size={16} className='text-amber-600' />
								</div>
								<div>
									<h3 className='font-semibold text-slate-900 mb-1'>DMCA Compliance</h3>
									<p className='text-slate-600'>We respond to valid DMCA takedown notices and have a policy for repeat infringers.</p>
								</div>
							</div>
						</div>
					</section>

					{/* Limitation of Liability */}
					<section className='bg-white rounded-2xl border border-slate-200 p-8 shadow-lg'>
						<h2 className='text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3'>
							<div className='w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500 to-gray-500 flex items-center justify-center'>
								<span className='text-white font-bold text-lg'>7</span>
							</div>
							Limitation of Liability
						</h2>
						<div className='prose prose-slate max-w-none'>
							<p className='text-lg leading-relaxed mb-4'>
								Deelzo shall not be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
							</p>
							<div className='bg-slate-50 border border-slate-200 rounded-lg p-4'>
								<h3 className='font-semibold text-slate-900 mb-2'>Our Liability is Limited to:</h3>
								<ul className='text-slate-700 space-y-1'>
									<li>• The amount you paid for the product or service</li>
									<li>• $100, whichever is greater</li>
								</ul>
							</div>
						</div>
					</section>

					{/* Contact Information */}
					<section className='bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 p-8 shadow-lg'>
						<h2 className='text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3'>
							<div className='w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center'>
								<span className='text-white font-bold text-lg'>8</span>
							</div>
							Contact Information
						</h2>
						<div className='grid md:grid-cols-2 gap-8'>
							<div>
								<h3 className='font-semibold text-slate-900 mb-4'>Get in Touch</h3>
								<div className='space-y-3'>
									<div className='flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200'>
										<div className='w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center'>
											<Mail size={20} className='text-indigo-600' />
										</div>
										<div>
											<p className='font-medium text-slate-900'>Email Support</p>
											<p className='text-slate-600 text-sm'>support@deelzo.com</p>
										</div>
									</div>
									<div className='flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200'>
										<div className='w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center'>
											<MessageCircle size={20} className='text-indigo-600' />
										</div>
										<div>
											<p className='font-medium text-slate-900'>WhatsApp</p>
											<p className='text-slate-600 text-sm'>+1 (555) 123-4567</p>
										</div>
									</div>
								</div>
							</div>
							<div>
								<h3 className='font-semibold text-slate-900 mb-4'>Legal Address</h3>
								<div className='p-4 bg-white rounded-lg border border-slate-200'>
									<p className='text-slate-700'>
										Deelzo Marketplace<br/>
										123 Business Avenue<br/>
										Tech District, CA 90210<br/>
										United States
									</p>
								</div>
							</div>
						</div>
					</section>
				</div>
			</div>
		</div>
	);
}