import { EMAIL, PHONE } from "@/lib/constant";
import type { Metadata } from "next";
import { Shield, Lock, Eye, User, Database, Cookie, Check, CheckCircle, XCircle, Globe, Mail, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
	title: "Privacy Policy",
	description:
		"Privacy policy for Deelzo, the trusted marketplace for buying and selling digital products.",
};

export default function Privacy() {
	return (
		<div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100'>
			{/* Header */}
			<div className='bg-white border-b border-slate-200'>
				<div className='max-w-4xl mx-auto px-4 md:px-8 py-12'>
					<h1 className='text-4xl md:text-5xl font-bold text-slate-900 mb-4'>
						Privacy Policy
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
								<Shield size={20} className='text-white' />
							</div>
							Information We Collect
						</h2>
						<div className='space-y-6'>
							<div className='grid md:grid-cols-2 gap-6'>
								<div className='bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6'>
									<div className='flex items-center gap-3 mb-4'>
										<div className='w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center'>
											<User size={20} className='text-blue-600' />
										</div>
										<h3 className='font-semibold text-slate-900'>Personal Information</h3>
									</div>
									<ul className='space-y-2 text-slate-600 text-sm'>
										<li className='flex items-start gap-2'>
											<span className='text-blue-500'>•</span>
											<span>Name and contact information</span>
										</li>
										<li className='flex items-start gap-2'>
											<span className='text-blue-500'>•</span>
											<span>Email address and phone number</span>
										</li>
										<li className='flex items-start gap-2'>
											<span className='text-blue-500'>•</span>
											<span>Payment and billing information</span>
										</li>
										<li className='flex items-start gap-2'>
											<span className='text-blue-500'>•</span>
											<span>Account credentials and preferences</span>
										</li>
									</ul>
								</div>
								<div className='bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6'>
									<div className='flex items-center gap-3 mb-4'>
										<div className='w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center'>
											<Database size={20} className='text-emerald-600' />
										</div>
										<h3 className='font-semibold text-slate-900'>Usage Data</h3>
									</div>
									<ul className='space-y-2 text-slate-600 text-sm'>
										<li className='flex items-start gap-2'>
											<span className='text-emerald-500'>•</span>
											<span>Browsing and search history</span>
										</li>
										<li className='flex items-start gap-2'>
											<span className='text-emerald-500'>•</span>
											<span>Product views and interactions</span>
										</li>
										<li className='flex items-start gap-2'>
											<span className='text-emerald-500'>•</span>
											<span>Device and browser information</span>
										</li>
										<li className='flex items-start gap-2'>
											<span className='text-emerald-500'>•</span>
											<span>IP address and location data</span>
										</li>
									</ul>
								</div>
							</div>
							<div className='bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6'>
								<div className='flex items-center gap-3 mb-4'>
									<Cookie size={20} className='text-amber-600' />
									<h3 className='font-semibold text-slate-900'>Cookies and Tracking</h3>
								</div>
								<p className='text-slate-700 mb-3'>
									We use cookies and similar tracking technologies to enhance your experience and understand how our platform is used.
								</p>
								<div className='grid md:grid-cols-3 gap-4 text-sm'>
									<div className='bg-white rounded-lg p-3'>
										<p className='font-medium text-slate-900 mb-1'>Essential Cookies</p>
										<p className='text-slate-600'>Required for basic functionality</p>
									</div>
									<div className='bg-white rounded-lg p-3'>
										<p className='font-medium text-slate-900 mb-1'>Analytics Cookies</p>
										<p className='text-slate-600'>Help us improve our service</p>
									</div>
									<div className='bg-white rounded-lg p-3'>
										<p className='font-medium text-slate-900 mb-1'>Marketing Cookies</p>
										<p className='text-slate-600'>Personalize your experience</p>
									</div>
								</div>
							</div>
						</div>
					</section>

					{/* How We Use Information */}
					<section className='bg-white rounded-2xl border border-slate-200 p-8 shadow-lg'>
						<h2 className='text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3'>
							<div className='w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center'>
								<Eye size={20} className='text-white' />
							</div>
							How We Use Your Information
						</h2>
						<div className='grid md:grid-cols-2 gap-8'>
							<div className='space-y-6'>
								<div>
									<h3 className='font-semibold text-slate-900 mb-3 text-lg'>Service Provision</h3>
									<ul className='space-y-3'>
										<li className='flex items-start gap-3'>
											<div className='w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0 mt-0.5'>
												<Check size={14} className='text-sky-600' />
											</div>
											<span className='text-slate-600'>Process your purchases and transactions</span>
										</li>
										<li className='flex items-start gap-3'>
											<div className='w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0 mt-0.5'>
												<Check size={14} className='text-sky-600' />
											</div>
											<span className='text-slate-600'>Provide customer support and assistance</span>
										</li>
										<li className='flex items-start gap-3'>
											<div className='w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0 mt-0.5'>
												<Check size={14} className='text-sky-600' />
											</div>
											<span className='text-slate-600'>Manage your account and preferences</span>
										</li>
									</ul>
								</div>
								<div>
									<h3 className='font-semibold text-slate-900 mb-3 text-lg'>Communication</h3>
									<ul className='space-y-3'>
										<li className='flex items-start gap-3'>
											<div className='w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5'>
												<Check size={14} className='text-indigo-600' />
											</div>
											<span className='text-slate-600'>Send order confirmations and updates</span>
										</li>
										<li className='flex items-start gap-3'>
											<div className='w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5'>
												<Check size={14} className='text-indigo-600' />
											</div>
											<span className='text-slate-600'>Provide important service notifications</span>
										</li>
										<li className='flex items-start gap-3'>
											<div className='w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5'>
												<Check size={14} className='text-indigo-600' />
											</div>
											<span className='text-slate-600'>Respond to your inquiries and requests</span>
										</li>
									</ul>
								</div>
							</div>
							<div className='space-y-6'>
								<div>
									<h3 className='font-semibold text-slate-900 mb-3 text-lg'>Improvement & Analytics</h3>
									<ul className='space-y-3'>
										<li className='flex items-start gap-3'>
											<div className='w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5'>
												<Check size={14} className='text-emerald-600' />
											</div>
											<span className='text-slate-600'>Analyze platform usage and performance</span>
										</li>
										<li className='flex items-start gap-3'>
											<div className='w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5'>
												<Check size={14} className='text-emerald-600' />
											</div>
											<span className='text-slate-600'>Develop new features and improvements</span>
										</li>
										<li className='flex items-start gap-3'>
											<div className='w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5'>
												<Check size={14} className='text-emerald-600' />
											</div>
											<span className='text-slate-600'>Personalize your shopping experience</span>
										</li>
									</ul>
								</div>
								<div>
									<h3 className='font-semibold text-slate-900 mb-3 text-lg'>Legal Compliance</h3>
									<ul className='space-y-3'>
										<li className='flex items-start gap-3'>
											<div className='w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5'>
												<Check size={14} className='text-amber-600' />
											</div>
											<span className='text-slate-600'>Comply with legal obligations</span>
										</li>
										<li className='flex items-start gap-3'>
											<div className='w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5'>
												<Check size={14} className='text-amber-600' />
											</div>
											<span className='text-slate-600'>Protect our rights and property</span>
										</li>
										<li className='flex items-start gap-3'>
											<div className='w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5'>
												<Check size={14} className='text-amber-600' />
											</div>
											<span className='text-slate-600'>Prevent fraud and security issues</span>
										</li>
									</ul>
								</div>
							</div>
						</div>
					</section>

					{/* Data Protection */}
					<section className='bg-white rounded-2xl border border-slate-200 p-8 shadow-lg'>
						<h2 className='text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3'>
							<div className='w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center'>
								<Lock size={20} className='text-white' />
							</div>
							Data Security & Protection
						</h2>
						<div className='space-y-6'>
							<div className='bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6'>
								<h3 className='font-semibold text-slate-900 mb-4 text-lg'>Our Security Measures</h3>
								<div className='grid md:grid-cols-2 gap-4'>
									<div className='space-y-3'>
										<div className='flex items-start gap-3'>
											<Shield size={20} className='text-emerald-600 flex-shrink-0 mt-0.5' />
											<div>
												<p className='font-medium text-slate-900'>Encryption</p>
												<p className='text-slate-600 text-sm'>All data transmitted is encrypted using industry-standard SSL/TLS</p>
											</div>
										</div>
										<div className='flex items-start gap-3'>
											<Shield size={20} className='text-emerald-600 flex-shrink-0 mt-0.5' />
											<div>
												<p className='font-medium text-slate-900'>Secure Storage</p>
												<p className='text-slate-600 text-sm'>Sensitive data is stored with advanced security protocols</p>
											</div>
										</div>
									</div>
									<div className='space-y-3'>
										<div className='flex items-start gap-3'>
											<Shield size={20} className='text-emerald-600 flex-shrink-0 mt-0.5' />
											<div>
												<p className='font-medium text-slate-900'>Regular Audits</p>
												<p className='text-slate-600 text-sm'>We conduct regular security assessments and updates</p>
											</div>
										</div>
										<div className='flex items-start gap-3'>
											<Shield size={20} className='text-emerald-600 flex-shrink-0 mt-0.5' />
											<div>
												<p className='font-medium text-slate-900'>Access Controls</p>
												<p className='text-slate-600 text-sm'>Strict access controls limit who can view your data</p>
											</div>
										</div>
									</div>
								</div>
							</div>
							
							<div className='grid md:grid-cols-3 gap-6'>
								<div className='bg-white border border-slate-200 rounded-xl p-6 text-center'>
									<div className='w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4'>
										<Lock size={24} className='text-white' />
									</div>
									<h4 className='font-semibold text-slate-900 mb-2'>99.9% Uptime</h4>
									<p className='text-slate-600 text-sm'>Reliable infrastructure with minimal downtime</p>
								</div>
								<div className='bg-white border border-slate-200 rounded-xl p-6 text-center'>
									<div className='w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mx-auto mb-4'>
										<Shield size={24} className='text-white' />
									</div>
									<h4 className='font-semibold text-slate-900 mb-2'>PCI DSS Compliant</h4>
									<p className='text-slate-600 text-sm'>Meeting payment card industry security standards</p>
								</div>
								<div className='bg-white border border-slate-200 rounded-xl p-6 text-center'>
									<div className='w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-4'>
										<Eye size={24} className='text-white' />
									</div>
									<h4 className='font-semibold text-slate-900 mb-2'>GDPR Ready</h4>
									<p className='text-slate-600 text-sm'>Compliant with global privacy regulations</p>
								</div>
							</div>
						</div>
					</section>

					{/* Data Sharing */}
					<section className='bg-white rounded-2xl border border-slate-200 p-8 shadow-lg'>
						<h2 className='text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3'>
							<div className='w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center'>
								<User size={20} className='text-white' />
							</div>
							Information Sharing
						</h2>
						<div className='space-y-6'>
							<div className='bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-xl p-6'>
								<h3 className='font-semibold text-slate-900 mb-4'>We Do NOT Sell Your Data</h3>
								<p className='text-slate-700 mb-4'>
									We never sell, rent, or trade your personal information to third parties for marketing purposes.
								</p>
								<div className='flex items-center gap-2 text-sm text-slate-600'>
									<CheckCircle size={16} className='text-emerald-500' />
									<span>We only share data when necessary for service provision</span>
								</div>
							</div>
							
							<div className='grid md:grid-cols-2 gap-6'>
								<div className='border border-slate-200 rounded-xl p-6'>
									<h4 className='font-semibold text-slate-900 mb-3 flex items-center gap-2'>
										<CheckCircle size={18} className='text-emerald-500' />
										Limited Sharing
									</h4>
									<ul className='space-y-2 text-slate-600 text-sm'>
										<li className='flex items-start gap-2'>
											<span className='text-emerald-500'>•</span>
											<span>Payment processors for transaction completion</span>
										</li>
										<li className='flex items-start gap-2'>
											<span className='text-emerald-500'>•</span>
											<span>Shipping providers for delivery services</span>
										</li>
										<li className='flex items-start gap-2'>
											<span className='text-emerald-500'>•</span>
											<span>Analytics services to improve our platform</span>
										</li>
									</ul>
								</div>
								<div className='border border-slate-200 rounded-xl p-6'>
									<h4 className='font-semibold text-slate-900 mb-3 flex items-center gap-2'>
										<XCircle size={18} className='text-rose-500' />
										Never Shared
									</h4>
									<ul className='space-y-2 text-slate-600 text-sm'>
										<li className='flex items-start gap-2'>
											<span className='text-rose-500'>•</span>
											<span>Your personal information for marketing</span>
										</li>
										<li className='flex items-start gap-2'>
											<span className='text-rose-500'>•</span>
											<span>Financial details with unauthorized parties</span>
										</li>
										<li className='flex items-start gap-2'>
											<span className='text-rose-500'>•</span>
											<span>Your browsing history or preferences</span>
										</li>
									</ul>
								</div>
							</div>
						</div>
					</section>

					{/* Your Rights */}
					<section className='bg-white rounded-2xl border border-slate-200 p-8 shadow-lg'>
						<h2 className='text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3'>
							<div className='w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center'>
								<Eye size={20} className='text-white' />
							</div>
							Your Privacy Rights
						</h2>
						<div className='grid md:grid-cols-2 gap-8'>
							<div className='space-y-6'>
								<div>
									<h3 className='font-semibold text-slate-900 mb-4 text-lg'>Access & Control</h3>
									<div className='space-y-4'>
										<div className='flex items-start gap-3'>
											<div className='w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0 mt-0.5'>
												<Eye size={16} className='text-rose-600' />
											</div>
											<div>
												<p className='font-medium text-slate-900'>Access Your Data</p>
												<p className='text-slate-600 text-sm'>Request a copy of your personal information</p>
											</div>
										</div>
										<div className='flex items-start gap-3'>
											<div className='w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0 mt-0.5'>
												<CheckCircle size={16} className='text-rose-600' />
											</div>
											<div>
												<p className='font-medium text-slate-900'>Update Information</p>
												<p className='text-slate-600 text-sm'>Correct or update your personal details</p>
											</div>
										</div>
										<div className='flex items-start gap-3'>
											<div className='w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0 mt-0.5'>
												<XCircle size={16} className='text-rose-600' />
											</div>
											<div>
												<p className='font-medium text-slate-900'>Delete Account</p>
												<p className='text-slate-600 text-sm'>Request deletion of your account and data</p>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div className='space-y-6'>
								<div>
									<h3 className='font-semibold text-slate-900 mb-4 text-lg'>How to Exercise Rights</h3>
									<div className='space-y-4'>
										<div className='bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-lg p-4'>
											<h4 className='font-medium text-slate-900 mb-2'>Through Your Account</h4>
											<p className='text-slate-600 text-sm'>
												Access most privacy controls directly through your account settings
											</p>
										</div>
										<div className='bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4'>
											<h4 className='font-medium text-slate-900 mb-2'>Contact Us</h4>
											<p className='text-slate-600 text-sm mb-2'>
												For formal requests, contact our privacy team:
											</p>
											<p className='text-indigo-600 font-medium'>{EMAIL}</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</section>

					{/* International Transfers */}
					<section className='bg-white rounded-2xl border border-slate-200 p-8 shadow-lg'>
						<h2 className='text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3'>
							<div className='w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center'>
								<Globe size={20} className='text-white' />
							</div>
							International Data Transfers
						</h2>
						<div className='prose prose-slate max-w-none'>
							<p className='text-lg leading-relaxed mb-6'>
								Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with applicable laws.
							</p>
							<div className='bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6'>
								<h3 className='font-semibold text-slate-900 mb-3'>Data Protection Standards</h3>
								<ul className='space-y-2 text-slate-700'>
									<li className='flex items-start gap-2'>
										<Check size={18} className='text-amber-600 flex-shrink-0 mt-0.5' />
										<span>We implement EU-standard contractual clauses for international transfers</span>
									</li>
									<li className='flex items-start gap-2'>
										<Check size={18} className='text-amber-600 flex-shrink-0 mt-0.5' />
										<span>All third-party processors must meet our security requirements</span>
									</li>
									<li className='flex items-start gap-2'>
										<Check size={18} className='text-amber-600 flex-shrink-0 mt-0.5' />
										<span>We regularly audit our data processing activities</span>
									</li>
								</ul>
							</div>
						</div>
					</section>

					{/* Contact Information */}
					<section className='bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 p-8 shadow-lg'>
						<h2 className='text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3'>
							<div className='w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center'>
								<Mail size={20} className='text-white' />
							</div>
							Contact Our Privacy Team
						</h2>
						<div className='grid md:grid-cols-2 gap-8'>
							<div>
								<h3 className='font-semibold text-slate-900 mb-4'>Get in Touch</h3>
								<div className='space-y-4'>
									<div className='flex items-center gap-3 p-4 bg-white rounded-lg border border-slate-200'>
										<div className='w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center'>
											<Mail size={24} className='text-indigo-600' />
										</div>
										<div>
											<p className='font-medium text-slate-900'>Privacy Email</p>
											<p className='text-slate-600'>{EMAIL}</p>
										</div>
									</div>
									<div className='flex items-center gap-3 p-4 bg-white rounded-lg border border-slate-200'>
										<div className='w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center'>
											<MessageCircle size={24} className='text-indigo-600' />
										</div>
										<div>
											<p className='font-medium text-slate-900'>WhatsApp Support</p>
											<p className='text-slate-600'>{PHONE}</p>
										</div>
									</div>
								</div>
							</div>
							<div>
								<h3 className='font-semibold text-slate-900 mb-4'>Response Time</h3>
								<div className='space-y-4'>
									<div className='bg-white border border-slate-200 rounded-lg p-4'>
										<div className='flex items-center gap-2 mb-2'>
											<div className='w-3 h-3 rounded-full bg-emerald-500'></div>
											<p className='font-medium text-slate-900'>Standard Requests</p>
										</div>
										<p className='text-slate-600 text-sm'>Responded to within 5 business days</p>
									</div>
									<div className='bg-white border border-slate-200 rounded-lg p-4'>
										<div className='flex items-center gap-2 mb-2'>
											<div className='w-3 h-3 rounded-full bg-amber-500'></div>
											<p className='font-medium text-slate-900'>Complex Requests</p>
										</div>
										<p className='text-slate-600 text-sm'>May take up to 30 days for thorough review</p>
									</div>
								</div>
							</div>
						</div>
					</section>
				</div>
			</div>
		</div>
	);
}