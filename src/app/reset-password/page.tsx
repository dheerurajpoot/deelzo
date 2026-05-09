"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import {
	Lock,
	Loader2,
	CheckCircle,
	AlertCircle,
	Eye,
	EyeOff,
	Shield,
	Key,
} from "lucide-react";
import Image from "next/image";

function ResetPasswordForm() {
	const params = useSearchParams();
	const email = params.get("email") || "";
	const token = params.get("token") || "";
	const [pw1, setPw1] = useState("");
	const [pw2, setPw2] = useState("");
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		if (!pw1 || pw1.length < 6) {
			setError("Password must be at least 6 characters.");
			setLoading(false);
			return;
		}
		if (pw1 !== pw2) {
			setError("Passwords do not match.");
			setLoading(false);
			return;
		}
		try {
			const res = await fetch("/api/auth/reset-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, token, password: pw1 }),
			});
			const data = await res.json();
			if (data.success) {
				setSuccess(true);
			} else {
				setError(data.message || "Reset failed.");
			}
		} catch {
			setError("Something went wrong.");
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

				{success ? (
					<div className='text-center'>
						<div className='w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6'>
							<CheckCircle size={40} className='text-emerald-600' />
						</div>
						<h2 className='text-3xl font-bold text-slate-900 mb-3'>
							Success!
						</h2>
						<p className='text-slate-500 text-base mb-8 leading-relaxed'>
							Your password has been reset successfully. You can now login with your new password.
						</p>
						<Button
							className='w-full sm:w-auto px-10 h-12 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-base font-semibold'
							onClick={() => router.push("/login")}>
							Go to Login
						</Button>
					</div>
				) : (
					<>
						{/* Heading */}
						<div className='mb-10'>
							<h1 className='text-4xl font-bold text-slate-900 mb-2'>
								Set New
							</h1>
							<h2 className='text-4xl font-bold text-slate-900 mb-4'>
								Password
							</h2>
							<p className='text-slate-500 text-base'>
								Create a strong password to secure your account
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
						<form className='space-y-5' onSubmit={handleSubmit}>
							<div>
								<Label
									htmlFor='password'
									className='text-slate-700 font-medium text-sm mb-2.5 block'>
									New Password
								</Label>
								<div className='relative'>
									<Lock
										size={18}
										className='absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400'
									/>
									<Input
										id='password'
										type={showPassword ? "text" : "password"}
										required
										minLength={6}
										placeholder='Enter new password'
										disabled={loading}
										value={pw1}
										onChange={(e) => setPw1(e.target.value)}
										className='pl-11 pr-12 h-12 bg-white border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:border-rose-500 focus:ring-rose-500/20'
									/>
									<button
										type='button'
										onClick={() => setShowPassword(!showPassword)}
										className='absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors'>
										{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
									</button>
								</div>
								<p className='text-xs text-slate-500 mt-1.5'>
									Must be at least 6 characters
								</p>
							</div>

							<div>
								<Label
									htmlFor='confirmPassword'
									className='text-slate-700 font-medium text-sm mb-2.5 block'>
									Confirm Password
								</Label>
								<div className='relative'>
									<Lock
										size={18}
										className='absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400'
									/>
									<Input
										id='confirmPassword'
										type={showConfirmPassword ? "text" : "password"}
										required
										minLength={6}
										placeholder='Repeat new password'
										disabled={loading}
										value={pw2}
										onChange={(e) => setPw2(e.target.value)}
										className='pl-11 pr-12 h-12 bg-white border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:border-rose-500 focus:ring-rose-500/20'
									/>
									<button
										type='button'
										onClick={() => setShowConfirmPassword(!showConfirmPassword)}
										className='absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors'>
										{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
									</button>
								</div>
								{pw1 && pw2 && (
									<div className='mt-2 flex items-center gap-2'>
										{pw1 === pw2 ? (
											<>
												<CheckCircle size={14} className='text-emerald-600' />
												<span className='text-xs text-emerald-600 font-medium'>
													Passwords match
												</span>
											</>
										) : (
											<>
												<AlertCircle size={14} className='text-rose-600' />
												<span className='text-xs text-rose-600 font-medium'>
													Passwords do not match
												</span>
											</>
										)}
									</div>
								)}
							</div>

							<Button
								disabled={loading || !pw1 || !pw2 || pw1 !== pw2}
								className='w-full sm:w-auto px-10 h-12 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-base font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed'
								type='submit'>
								{loading ? (
									<>
										<Loader2 size={18} className='animate-spin mr-2' />
										Resetting...
									</>
								) : (
									"Reset Password"
								)}
							</Button>
						</form>
					</>
				)}
			</div>

			{/* Right Side - Illustration */}
			<div className='hidden lg:flex lg:w-1/2 bg-gradient-to-br from-rose-400 via-pink-500 to-purple-600 relative overflow-hidden items-center justify-center'>
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
							<div className='absolute inset-2 bg-gradient-to-br from-rose-400 via-pink-500 to-purple-600 rounded-[2rem] flex flex-col items-center justify-center'>
								{/* Lock Icon */}
								<div className='w-24 h-24 rounded-full border-4 border-white/40 flex items-center justify-center mb-4'>
									<Key size={40} className='text-white' />
								</div>
								<p className='text-white/80 text-xs'>Secure your account</p>
								<p className='text-white/60 text-xs'>Set a new password</p>
							</div>
							{/* Notch */}
							<div className='absolute top-3 left-1/2 transform -translate-x-1/2 w-20 h-5 bg-slate-900 rounded-full' />
						</div>

						{/* Checkmark Bubble */}
						<div className='absolute -top-4 -right-4 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg'>
							<svg className='w-8 h-8 text-rose-500' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={3}>
								<path strokeLinecap='round' strokeLinejoin='round' d='M4.5 12.75l6 6 9-13.5' />
							</svg>
						</div>

						{/* Shield Icon */}
						<div className='absolute -bottom-2 -right-8 w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center'>
							<Lock size={32} className='text-white' />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function LoadingFallback() {
	return (
		<div className='min-h-screen flex items-center justify-center bg-white'>
			<div className='flex items-center justify-center'>
				<Loader2 className='h-10 w-10 animate-spin text-rose-500' />
			</div>
		</div>
	);
}

export default function ResetPasswordPage() {
	return (
		<Suspense fallback={<LoadingFallback />}>
			<ResetPasswordForm />
		</Suspense>
	);
}
