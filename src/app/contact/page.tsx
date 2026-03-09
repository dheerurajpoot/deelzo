'use client'
import { Card, CardContent } from "@/components/ui/card";
import { Mail, MessageCircle, Clock, MapPin, User, Mail as MailIcon, MessageSquare, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { EMAIL, PHONE } from "@/lib/constant";


export default function Contact() {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		subject: "",
		message: ""
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitSuccess, setSubmitSuccess] = useState(false);
	const [submitError, setSubmitError] = useState("");

	const contactInfo = [
		{
			icon: Mail,
			title: "Email",
			value: EMAIL,
			href: `mailto:${EMAIL}`,
			color: "from-blue-500 to-sky-500",
			bgColor: "from-blue-50 to-sky-50",
			borderColor: "border-blue-200",
			textColor: "text-blue-700",
		},
		{
			icon: MessageCircle,
			title: "WhatsApp",
			value: PHONE,
			href: `https://wa.me/${PHONE}`,
			color: "from-emerald-500 to-green-500",
			bgColor: "from-emerald-50 to-green-50",
			borderColor: "border-emerald-200",
			textColor: "text-emerald-700",
		},
		{
			icon: Clock,
			title: "Response Time",
			value: "Within 12 hours",
			href: null,
			color: "from-amber-500 to-orange-500",
			bgColor: "from-amber-50 to-amber-50",
			borderColor: "border-amber-200",
			textColor: "text-amber-700",
		},
		{
			icon: MapPin,
			title: "Support Hours",
			value: "Mon - Fri: 9 AM - 6 PM IST",
			href: null,
			color: "from-purple-500 to-pink-500",
			bgColor: "from-purple-50 to-purple-50",
			borderColor: "border-purple-200",
			textColor: "text-purple-700",
		},
	];

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: value
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setSubmitError("");
		
		try {
			// Simulate API call to backend
			const response = await fetch('/api/contact', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(formData),
			});

			if (response.ok) {
				setSubmitSuccess(true);
				setFormData({ name: "", email: "", subject: "", message: "" });
				setTimeout(() => setSubmitSuccess(false), 5000); // Reset success message after 5 seconds
			} else {
				const data = await response.json();
				setSubmitError(data.message || "Something went wrong. Please try again.");
			}
		} catch (error) {
			setSubmitError("Network error. Please try again later.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100'>
			{/* Hero Section */}
			<div className='relative overflow-hidden bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 py-16 md:py-20'>
				<div className='absolute inset-0 bg-[url("https://www.transparenttextures.com/patterns/cubes.png")] opacity-5' />
				<div className='absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-500/20 to-rose-500/20 rounded-full blur-3xl' />
				<div className='absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-full blur-3xl' />
				<div className='max-w-4xl mx-auto px-4 md:px-8 text-center relative z-10'>
					<h1 className='text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4'>
						Contact Us
					</h1>
					<p className='text-white/90 text-lg md:text-xl max-w-2xl mx-auto'>
						Have questions? We'd love to hear from you. Get in touch
						and we'll respond as soon as possible.
					</p>
				</div>
			</div>

			{/* Content */}
			<div className='max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-16'>
				<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
					{/* Contact Info */}
					<div className='lg:col-span-1 space-y-6'>
						{contactInfo.map((info, index) => {
							const Icon = info.icon;
							return (
								<Card
									key={index}
									className={`bg-gradient-to-br ${
										info.bgColor
									} border ${
										info.borderColor
									} shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
										info.href ? "cursor-pointer" : ""
									}`}>
									<CardContent className='p-6'>
										<div className='flex items-start gap-4'>
											<div
												className={`w-12 h-12 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center shrink-0`}>
												<Icon
													size={24}
													className='text-white'
												/>
											</div>
											<div className='flex-1'>
												<h3
													className={`font-bold ${info.textColor} mb-1 text-base`}>
													{info.title}
												</h3>
												{info.href ? (
													<a
														href={info.href}
														className={`${info.textColor} hover:underline text-sm font-medium`}>
														{info.value}
													</a>
												) : (
													<p
														className={`${info.textColor} text-sm font-medium`}>
														{info.value}
													</p>
												)}
											</div>
										</div>
									</CardContent>
								</Card>
							);
						})}
					</div>

					{/* Contact Form */}
					<div className='lg:col-span-2'>
						<Card className='bg-white border-slate-200 shadow-lg'>
							<CardContent className='p-8'>
								<h2 className='text-2xl font-bold text-slate-900 mb-2'>Send us a message</h2>
								<p className='text-slate-600 mb-6'>Fill out the form below and our team will get back to you as soon as possible.</p>
								
								{submitSuccess && (
									<div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
										Thank you for contacting us! We've received your message and will get back to you shortly.
									</div>
								)}
								
								{submitError && (
									<div className="mb-6 p-4 bg-rose-50 text-rose-700 rounded-lg border border-rose-200">
										{submitError}
									</div>
								)}
								
								<form onSubmit={handleSubmit} className="space-y-6">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div className="space-y-2">
											<label htmlFor="name" className="text-sm font-medium text-slate-700">
												Name
											</label>
											<div className="relative">
												<User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
												<Input
													id="name"
													name="name"
													placeholder="Enter your name"
													value={formData.name}
													onChange={handleChange}
													required
													className="pl-10 h-12 border-slate-300 focus:border-slate-400 focus:ring-slate-400"
												/>
											</div>
										</div>
										
										<div className="space-y-2">
											<label htmlFor="email" className="text-sm font-medium text-slate-700">
												Email
											</label>
											<div className="relative">
												<MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
												<Input
													id="email"
													name="email"
													type="email"
													placeholder="Enter your email"
													value={formData.email}
													onChange={handleChange}
													required
													className="pl-10 h-12 border-slate-300 focus:border-slate-400 focus:ring-slate-400"
												/>
											</div>
										</div>
									</div>
									
									<div className="space-y-2">
										<label htmlFor="subject" className="text-sm font-medium text-slate-700">
											Subject
										</label>
										<div className="relative">
											<MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
											<Input
												id="subject"
												name="subject"
												placeholder="What is this regarding?"
												value={formData.subject}
												onChange={handleChange}
												required
												className="pl-10 h-12 border-slate-300 focus:border-slate-400 focus:ring-slate-400"
											/>
										</div>
									</div>
									
									<div className="space-y-2">
										<label htmlFor="message" className="text-sm font-medium text-slate-700">
											Message
										</label>
										<Textarea
											id="message"
											name="message"
											placeholder="Type your message here..."
											value={formData.message}
											onChange={handleChange}
											required
											rows={6}
											className="border-slate-300 focus:border-slate-400 focus:ring-slate-400"
										/>
									</div>
									
									<Button
										type="submit"
										disabled={isSubmitting}
										className="w-full bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-slate-950 text-white h-12 text-base font-medium shadow-md hover:shadow-lg transition-all duration-300"
									>
										{isSubmitting ? (
											<>
												<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
													<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
													<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
												</svg>
												Sending...
											</>
										) : (
											<>
												<Send className="mr-2" size={18} />
												Send Message
											</>
										)}
									</Button>
								</form>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}