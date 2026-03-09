"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
	Mail,
	Loader2,
	CheckCircle,
	AlertCircle,
	ArrowLeft,
	Shield,
	Key,
} from "lucide-react";
import Image from "next/image";

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState("");
	const [submitted, setSubmitted] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		try {
			await fetch("/api/auth/forgot-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email }),
			});
			setSubmitted(true);
		} catch {
			setError("Something went wrong, try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='min-h-[calc(100vh-80px)] flex bg-white'>
			{/* Left Side - Form */}
			<div className='w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-20 xl:px-28 py-12'>
				{/* Logo */}
				<div className='mb-6'>
					<div className='flex items-center gap-2'>
						<Image src="/plogo.png" alt="Deelzo Logo" width={132} height={32} />
					</div>
				</div>

				{submitted ? (
					<div className='text-center'>
						<div className='w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6'>
							<CheckCircle size={40} className='text-emerald-600' />
						</div>
						<h2 className='text-3xl font-bold text-slate-900 mb-3'>
							Check Your Email
						</h2>
						<p className='text-slate-500 text-base mb-2 leading-relaxed'>
							We've sent a password reset link to
						</p>
						<p className='text-slate-900 font-semibold mb-6'>{email}</p>
						<p className='text-slate-500 text-sm mb-8'>
							Please check your inbox and follow the instructions to reset your password.
						</p>
						<Button
							className='w-full sm:w-auto px-10 h-12 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-base font-semibold'
							onClick={() => router.push("/login")}>
							<ArrowLeft size={18} className='mr-2' />
							Back to Login
						</Button>
					</div>
				) : (
					<>
						{/* Heading */}
						<div className='mb-10'>
							<h1 className='text-4xl font-bold text-slate-900 mb-2'>
								Forgot
							</h1>
							<h2 className='text-4xl font-bold text-slate-900 mb-4'>
								Password?
							</h2>
							<p className='text-slate-500 text-base'>
								Don't worry! Enter your email and we'll send you reset instructions.
							</p>
						</div>

						{/* Error Message */}
						{error && (
							<div className='mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-start gap-3'>
								<AlertCircle
									size={18}
									className='text-rose-600 mt-0.5 shrink-0'
								/>
								<span>{error}</span>
							</div>
						)}

						{/* Form */}
						<form className='space-y-6' onSubmit={handleSubmit}>
							<div>
								<Label
									htmlFor='email'
									className='text-slate-700 font-medium text-sm mb-2.5 block'>
									Email Address
								</Label>
								<div className='relative'>
									<Mail
										size={18}
										className='absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400'
									/>
									<Input
										id='email'
										type='email'
										placeholder='you@example.com'
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										disabled={loading}
										required
										autoFocus
										className='pl-11 pr-4 h-12 bg-white border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:ring-amber-500/20'
									/>
								</div>
							</div>

							<Button
								type='submit'
								disabled={loading || !email}
								className='w-full sm:w-auto px-10 h-12 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-base font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed'>
								{loading ? (
									<>
										<Loader2 size={18} className='animate-spin mr-2' />
										Sending...
									</>
								) : (
									"Send Reset Link"
								)}
							</Button>
						</form>

						{/* Back to Login */}
						<div className='mt-10'>
							<Link
								href='/login'
								className='inline-flex items-center gap-2 text-slate-500 hover:text-amber-600 font-medium transition-colors'>
								<ArrowLeft size={18} />
								Back to Login
							</Link>
						</div>
					</>
				)}
			</div>

			{/* Right Side - Illustration */}
			<div className='hidden lg:flex lg:w-1/2 bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 relative overflow-hidden items-center justify-center'>
				{/* Decorative Clouds */}
				<div className='absolute top-10 left-10 w-32 h-16 bg-white/20 rounded-full blur-xl' />
				<div className='absolute top-20 right-20 w-40 h-20 bg-white/15 rounded-full blur-xl' />
				<div className='absolute bottom-32 left-20 w-36 h-18 bg-white/10 rounded-full blur-xl' />
				<div className='absolute bottom-20 right-10 w-48 h-24 bg-white/15 rounded-full blur-xl' />
				<div className='absolute top-1/3 left-1/4 w-24 h-12 bg-white/10 rounded-full blur-lg' />

				{/* Main Illustration Content */}
				<div className='relative z-10 text-center px-12'>
					{/* Phone Mockup */}
					<div className='relative mx-auto mb-8'>
						<div className='w-64 h-[420px] bg-slate-900 rounded-[2.5rem] border-4 border-slate-700 shadow-2xl relative overflow-hidden'>
							{/* Screen */}
							<div className='absolute inset-2 bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 rounded-[2rem] flex flex-col items-center justify-center'>
								{/* Key Icon */}
								<div className='w-24 h-24 rounded-full border-4 border-white/40 flex items-center justify-center mb-4'>
									<Key size={40} className='text-white' />
								</div>
								<p className='text-white/80 text-xs'>Reset your password</p>
								<p className='text-white/60 text-xs'>Secure your account</p>
							</div>
							{/* Notch */}
							<div className='absolute top-3 left-1/2 transform -translate-x-1/2 w-20 h-5 bg-slate-900 rounded-full' />
						</div>

						{/* Mail Bubble */}
						<div className='absolute -top-4 -right-4 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg'>
							<Mail size={24} className='text-amber-500' />
						</div>

						{/* Lock Icon */}
						<div className='absolute -bottom-2 -right-8 w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center'>
							<Key size={32} className='text-white' />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
