"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Shield,
	Loader2,
	CheckCircle,
	AlertCircle,
	Mail,
	ArrowLeft,
} from "lucide-react";

function VerifyOTPForm() {
	const [code, setCode] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");
	const [success, setSuccess] = useState(false);
	const router = useRouter();
	const params = useSearchParams();
	const email = params.get("email") || "";

	const handleSubmit = async (e: any) => {
		e.preventDefault();
		setLoading(true);
		setMessage("");
		try {
			const res = await fetch("/api/auth/verify-otp", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, otp: code.trim() }),
			});
			const data = await res.json();
			if (data.success) {
				setSuccess(true);
				setTimeout(() => {
					router.push("/login");
				}, 1200);
				setMessage("Your email was verified! You may now log in.");
			} else {
				setMessage(data.message || "Verification failed.");
			}
		} catch {
			setMessage("Verification failed. Try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 via-white to-slate-100 p-4 pb-24 md:pb-8'>
			<Card className='w-full max-w-md border p-0 border-slate-200 bg-white shadow-2xl overflow-hidden'>
				{/* Header with gradient */}
				<div className='bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 text-center relative overflow-hidden'>
					<div className='absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl' />
					<div className='absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-3xl' />
					<div className='relative z-10'>
						<div className='flex justify-center mb-4'>
							<div className='w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-lg'>
								<Shield size={32} className='text-white' />
							</div>
						</div>
						<CardTitle className='text-white text-2xl md:text-3xl font-bold mb-2'>
							Verify Your Account
						</CardTitle>
						<CardDescription className='text-white/90 text-sm'>
							Enter the 6-digit code sent to your email
						</CardDescription>
					</div>
				</div>

				<CardContent className='p-6 md:p-8'>
					{success ? (
						<div className='text-center space-y-4'>
							<div className='w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto'>
								<CheckCircle
									size={32}
									className='text-emerald-600'
								/>
							</div>
							<h3 className='text-xl font-bold text-slate-900'>
								Account Verified!
							</h3>
							<p className='text-slate-600 text-sm'>{message}</p>
							<Button
								className='w-full bg-linear-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white shadow-lg shadow-sky-500/20 mt-6 gap-2'
								onClick={() => router.push("/login")}>
								Go to Login
								<ArrowLeft size={18} className='rotate-180' />
							</Button>
						</div>
					) : (
						<>
							<div className='mb-6 text-center'>
								<div className='inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg border border-slate-200 mb-4'>
									<Mail
										size={16}
										className='text-slate-500'
									/>
									<span className='text-sm font-medium text-slate-700'>
										{email}
									</span>
								</div>
								<p className='text-slate-600 text-sm'>
									We've sent a verification code to your email
									address
								</p>
							</div>

							<form onSubmit={handleSubmit} className='space-y-5'>
								<div>
									<Label
										htmlFor='otp'
										className='text-slate-700 font-semibold text-sm mb-2 block text-center'>
										Enter Verification Code
									</Label>
									<Input
										id='otp'
										type='text'
										pattern='[0-9]{6}'
										maxLength={6}
										disabled={loading || success}
										placeholder='000000'
										value={code}
										onChange={(e) =>
											setCode(
												e.target.value
													.replace(/\D/g, "")
													.slice(0, 6)
											)
										}
										className='w-full h-14 text-center text-2xl tracking-[0.5em] font-mono bg-white border-slate-200 text-slate-900 placeholder:text-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20'
										autoFocus
										required
									/>
									<p className='text-xs text-slate-500 text-center mt-2'>
										6-digit code
									</p>
								</div>

								<Button
									type='submit'
									disabled={
										loading || !code.match(/^[0-9]{6}$/)
									}
									className='w-full bg-linear-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg shadow-indigo-500/20 h-11 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed gap-2'>
									{loading ? (
										<>
											<Loader2
												size={18}
												className='animate-spin'
											/>
											Verifying...
										</>
									) : (
										<>
											<Shield size={18} />
											Verify Account
										</>
									)}
								</Button>
							</form>

							{message && !success && (
								<div
									className={`mt-4 p-4 rounded-xl text-sm flex items-start gap-2 ${
										success
											? "bg-emerald-50 border border-emerald-200 text-emerald-700"
											: "bg-rose-50 border border-rose-200 text-rose-700"
									}`}>
									<AlertCircle
										size={18}
										className='mt-0.5 shrink-0'
									/>
									<span>{message}</span>
								</div>
							)}
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

export default function VerifyOtpPage() {
	return (
		<Suspense
			fallback={
				<div className='flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 via-white to-slate-100 p-4'>
					<Card className='w-full max-w-md border border-slate-200 bg-white shadow-lg'>
						<CardContent className='p-8'>
							<div className='flex items-center justify-center'>
								<Loader2 className='h-8 w-8 animate-spin text-sky-600' />
							</div>
						</CardContent>
					</Card>
				</div>
			}>
			<VerifyOTPForm />
		</Suspense>
	);
}
