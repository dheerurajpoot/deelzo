"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Mail,
	Lock,
	Loader2,
	Eye,
	EyeOff,
	AlertCircle,
	Shield,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import Image from "next/image";

export default function Login() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [rememberMe, setRememberMe] = useState(false);
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const response = await axios.post("/api/auth/login", {
				email: formData.email,
				password: formData.password,
			});

			const data = response.data;

			if (data.success) {
				localStorage.setItem("user", JSON.stringify(data.user));
				toast.success(data.message || "Login successful");
				window.location.reload();
				setTimeout(() => {
					router.push(
						data.user.role === "admin" ? "/admin" : "/dashboard"
					);
				}, 1000);
			} else {
				setError(data.message || "Login failed");
				if (data.message && data.message.includes("verify")) {
					toast.error(data.message);
					router.push(
						`/verify-otp?email=${encodeURIComponent(
							formData.email
						)}`
					);
				}
			}
		} catch (err: any) {
			const res = err.response.data;
			setError(res.message || "An error occurred. Please try again.");
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

				{/* Heading */}
				<div className='mb-10'>
					<h2 className='text-4xl font-bold text-slate-900 mb-4'>
						Welcome Back
					</h2>
					<p className='text-slate-500 text-base'>
						Hey, welcome back to your special place
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
				<form onSubmit={handleSubmit} className='space-y-6'>
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
								name='email'
								type='email'
								placeholder='you@example.com'
								value={formData.email}
								onChange={handleChange}
								required
								className='pl-11 pr-4 h-12 bg-white border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:ring-violet-500/20'
							/>
						</div>
					</div>

					<div>
						<Label
							htmlFor='password'
							className='text-slate-700 font-medium text-sm mb-2.5 block'>
							Password
						</Label>
						<div className='relative'>
							<Lock
								size={18}
								className='absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400'
							/>
							<Input
								id='password'
								name='password'
								type={showPassword ? "text" : "password"}
								placeholder='••••••••'
								value={formData.password}
								onChange={handleChange}
								required
								className='pl-11 pr-12 h-12 bg-white border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:ring-violet-500/20'
							/>
							<button
								type='button'
								onClick={() => setShowPassword(!showPassword)}
								className='absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors'>
								{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
							</button>
						</div>
					</div>

					<div className='flex items-center justify-between'>
						<div className='flex items-center gap-2.5'>
							<Checkbox
								id='remember'
								checked={rememberMe}
								onCheckedChange={(checked: boolean | "indeterminate") => setRememberMe(checked === true)}
								className='border-slate-300 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600'
							/>
							<Label
								htmlFor='remember'
								className='text-sm text-slate-600 font-normal cursor-pointer'>
								Remember me
							</Label>
						</div>
						<Link
							href='/forgot-password'
							className='text-sm text-slate-500 hover:text-violet-600 font-medium transition-colors'>
							Forgot Password?
						</Link>
					</div>

					<Button
						type='submit'
						disabled={loading}
						className='w-full sm:w-auto px-12 h-12 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-base font-semibold transition-all'>
						{loading ? (
							<>
								<Loader2 size={18} className='animate-spin mr-2' />
								Signing in...
							</>
						) : (
							"Sign In"
						)}
					</Button>
				</form>

				{/* Sign Up Link */}
				<div className='mt-10'>
					<p className='text-slate-500 text-sm'>
						Don't have an account?{" "}
						<Link
							href='/signup'
							className='text-violet-600 hover:text-violet-700 font-semibold transition-colors'>
							Sign Up
						</Link>
					</p>
				</div>
			</div>

			{/* Right Side - Illustration */}
			<div className='hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 relative overflow-hidden items-center justify-center'>
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
							<div className='absolute inset-2 bg-gradient-to-br from-fuchsia-400 via-purple-500 to-violet-600 rounded-[2rem] flex flex-col items-center justify-center'>
								{/* Fingerprint Icon */}
								<div className='w-24 h-24 rounded-full border-4 border-white/40 flex items-center justify-center mb-4'>
									<svg className='w-14 h-14 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}>
										<path strokeLinecap='round' strokeLinejoin='round' d='M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 017.5 0c0 .527-.021 1.048-.064 1.562M12 10.5h.008v.008H12V10.5zm0 3.75h.008v.008H12v-.008z' />
									</svg>
								</div>
								<p className='text-white/80 text-xs'>Please tap your finger</p>
								<p className='text-white/60 text-xs'>to your phone</p>
							</div>
							{/* Notch */}
							<div className='absolute top-3 left-1/2 transform -translate-x-1/2 w-20 h-5 bg-slate-900 rounded-full' />
						</div>

						{/* Checkmark Bubble */}
						<div className='absolute -top-4 -right-4 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg'>
							<svg className='w-8 h-8 text-violet-600' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={3}>
								<path strokeLinecap='round' strokeLinejoin='round' d='M4.5 12.75l6 6 9-13.5' />
							</svg>
						</div>

						{/* Lock Icon */}
						<div className='absolute -bottom-2 -right-8 w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center'>
							<Lock size={32} className='text-white' />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
