"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Mail,
	Lock,
	User,
	Phone,
	Loader2,
	Eye,
	EyeOff,
	CheckCircle,
	AlertCircle,
	Shield,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import Image from "next/image";

export default function SignUp() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [phone, setPhone] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		password: "",
		confirmPassword: "",
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

		if (formData.password !== formData.confirmPassword) {
			setError("Passwords do not match");
			setLoading(false);
			return;
		}

		if (!phone) {
			setError("Please enter a valid phone number with country code");
			setLoading(false);
			return;
		}

		formData.phone = phone;

		try {
			const response = await axios.post("/api/auth/signup", {
				name: formData.name,
				email: formData.email,
				phone: formData.phone,
				password: formData.password,
			});

			const data = response.data;
			if (data.success) {
				if (data.next === "verify-otp") {
					toast.success(
						"Check your email for the verification code."
					);
					router.push(
						`/verify-otp?email=${encodeURIComponent(
							formData.email
						)}`
					);
				} else {
					toast.success(data.message || "Signup successful");
					setTimeout(() => {
						router.push("/login");
					}, 1200);
				}
			} else {
				setError(data.message || "Signup failed");
			}
		} catch (err: any) {
			setError(err.response.data.message || "Something went wrong!");
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
						Create Account
					</h2>
					<p className='text-slate-500 text-base'>
						Join us today and start your journey
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
				<form onSubmit={handleSubmit} className='space-y-5'>
					<div>
						<Label
							htmlFor='name'
							className='text-slate-700 font-medium text-sm mb-2.5 block'>
							Full Name
						</Label>
						<div className='relative'>
							<User
								size={18}
								className='absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400'
							/>
							<Input
								id='name'
								name='name'
								type='text'
								placeholder='John Doe'
								value={formData.name}
								onChange={handleChange}
								required
								className='pl-11 pr-4 h-12 bg-white border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20'
							/>
						</div>
					</div>

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
								className='pl-11 pr-4 h-12 bg-white border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20'
							/>
						</div>
					</div>

					<div>
						<Label
							htmlFor='phone'
							className='text-slate-700 font-medium text-sm mb-2.5 block'>
							Phone Number
						</Label>
						<div className='flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all'>
							<Phone
								size={18}
								className='text-slate-400 ml-4'
							/>
							<PhoneInput
								international
								defaultCountry='IN'
								value={phone}
								placeholder='Enter phone number'
								onChange={(value) => setPhone(value || "")}
								className='flex-1 pl-2 py-3 border-0 focus:ring-0 text-slate-900 placeholder:text-slate-400 w-full'
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
								className='pl-11 pr-12 h-12 bg-white border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20'
							/>
							<button
								type='button'
								onClick={() => setShowPassword(!showPassword)}
								className='absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors'>
								{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
							</button>
						</div>
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
								name='confirmPassword'
								type={showConfirmPassword ? "text" : "password"}
								placeholder='••••••••'
								value={formData.confirmPassword}
								onChange={handleChange}
								required
								className='pl-11 pr-12 h-12 bg-white border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20'
							/>
							<button
								type='button'
								onClick={() => setShowConfirmPassword(!showConfirmPassword)}
								className='absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors'>
								{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
							</button>
						</div>
						{formData.password && formData.confirmPassword && (
							<div className='mt-2 flex items-center gap-2'>
								{formData.password === formData.confirmPassword ? (
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
						type='submit'
						disabled={loading || formData.password !== formData.confirmPassword}
						className='w-full sm:w-auto px-12 h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-base font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed'>
						{loading ? (
							<>
								<Loader2 size={18} className='animate-spin mr-2' />
								Creating Account...
							</>
						) : (
							"Sign Up"
						)}
					</Button>
				</form>

				{/* Login Link */}
				<div className='mt-10'>
					<p className='text-slate-500 text-sm'>
						Already have an account?{" "}
						<Link
							href='/login'
							className='text-emerald-600 hover:text-emerald-700 font-semibold transition-colors'>
							Sign In
						</Link>
					</p>
				</div>
			</div>

			{/* Right Side - Illustration */}
			<div className='hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 relative overflow-hidden items-center justify-center'>
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
							<div className='absolute inset-2 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 rounded-[2rem] flex flex-col items-center justify-center'>
								{/* User Icon */}
								<div className='w-24 h-24 rounded-full border-4 border-white/40 flex items-center justify-center mb-4'>
									<User size={40} className='text-white' />
								</div>
								<p className='text-white/80 text-xs'>Create your account</p>
								<p className='text-white/60 text-xs'>Join our community</p>
							</div>
							{/* Notch */}
							<div className='absolute top-3 left-1/2 transform -translate-x-1/2 w-20 h-5 bg-slate-900 rounded-full' />
						</div>

						{/* Checkmark Bubble */}
						<div className='absolute -top-4 -right-4 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg'>
							<svg className='w-8 h-8 text-emerald-500' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={3}>
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
