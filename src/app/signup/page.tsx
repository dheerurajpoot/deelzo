"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
} from "lucide-react";
import { toast } from "sonner";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { auth, googleProvider } from "@/lib/firebase";
import { 
    createUserWithEmailAndPassword, 
    sendEmailVerification, 
    signInWithPopup,
    updateProfile
} from "firebase/auth";
import { loginAction } from "@/app/actions/authActions";
import { userService } from "@/services/userService";
import { GoogleIcon } from "@/components/icons/GoogleIcon";

export default function SignUp() {
	const router = useRouter();
	const [step, setStep] = useState<"signup" | "verification" | "profile">("signup");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [phone, setPhone] = useState("");
	const [showPassword, setShowPassword] = useState(false);
    const [tempUser, setTempUser] = useState<any>(null);

	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
	});

    const searchParams = useSearchParams();

    useEffect(() => {
        const queryStep = searchParams.get("step");
        if (queryStep === "profile") {
            setStep("profile");
            const uid = searchParams.get("uid");
            if (uid) {
                setTempUser({ uid });
            }
        }
    }, [searchParams]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleGoogleSignUp = async () => {
		setError("");
		setLoading(true);
		try {
			const result = await signInWithPopup(auth, googleProvider);
			const user = result.user;
            
            // Check if profile exists
            let userData = await userService.getUser(user.uid);
            
            if (!userData) {
                // Initial profile creation for Google users
                await userService.createUserProfile(user.uid, {
                    name: user.displayName || "",
                    email: user.email || "",
                    phone: "",
                    isEmailVerified: true, // Google emails are pre-verified
                    role: 'user'
                });
                userData = await userService.getUser(user.uid);
            }

            setTempUser(user);
            
            if (!userData?.phone) {
                setStep("profile");
            } else {
                await finalizeLogin(user);
            }
		} catch (err: any) {
			console.error("Google Auth Error:", err);
			setError(err.message || "Google signup failed");
            toast.error("Google Authentication failed");
		} finally {
			setLoading(false);
		}
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

		try {
			// 1. Create user with Firebase Auth
			const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
			const user = userCredential.user;
            
            // 2. Set display name
            await updateProfile(user, { displayName: formData.name });

			// 3. Send Verification Email
			await sendEmailVerification(user);

			// 4. Create initial profile
			await userService.createUserProfile(user.uid, {
				name: formData.name,
				email: formData.email,
				phone: "",
				role: 'user',
                isEmailVerified: false
			});

            setTempUser(user);
            setStep("verification");
            toast.success("Verification email sent!");
		} catch (err: any) {
			setError(err.message || "Signup failed");
            toast.error(err.message || "Signup failed");
		} finally {
			setLoading(false);
		}
	};

    const handlePhoneSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone) {
            setError("Please enter a valid phone number");
            return;
        }

        setLoading(true);
        try {
            await userService.updateUserProfile(tempUser.uid, { phone });
            await finalizeLogin(tempUser);
        } catch (err: any) {
            setError(err.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const finalizeLogin = async (user: any) => {
        const firebaseUser = user.getIdToken ? user : auth.currentUser;
        if (!firebaseUser) {
            setError("Authentication context lost. Please sign in again.");
            return;
        }
        const idToken = await firebaseUser.getIdToken();
        const result = await loginAction(idToken);
        if (result.success) {
            const userData = await userService.getUser(firebaseUser.uid);
            localStorage.setItem("user", JSON.stringify(userData));
            toast.success("Welcome to Deelzo!");
            router.push("/dashboard");
						router.refresh();
        } else {
            setError("Session creation failed");
        }
    };

    const checkVerification = async () => {
        if (!tempUser) return;
        setLoading(true);
        try {
            await tempUser.reload();
            if (auth.currentUser?.emailVerified) {
                await userService.updateUserProfile(tempUser.uid, { isEmailVerified: true });
                const userData = await userService.getUser(tempUser.uid);
                if (!userData?.phone) {
                    setStep("profile");
                } else {
                    await finalizeLogin(tempUser);
                }
            } else {
                toast.error("Email not yet verified. Please check your inbox.");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

	return (
		<div className='min-h-[calc(100vh-80px)] flex bg-white'>
			{/* Left Side - Form */}
			<div className='w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-20 xl:px-28 py-12'>
				{step === "signup" && (
					<>
						<div className='mb-8'>
							<h2 className='text-4xl font-black text-slate-900 mb-3 tracking-tight'>
								Join Deelzo
							</h2>
							<p className='text-slate-500 font-medium'>
								Create your professional account today
							</p>
						</div>

						{error && (
							<div className='mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm flex items-start gap-3'>
								<AlertCircle size={18} className='shrink-0 mt-0.5' />
								<span className="font-medium">{error}</span>
							</div>
						)}

						<Button
							type='button'
							onClick={handleGoogleSignUp}
							disabled={loading}
							variant="outline"
							className='w-full h-12 rounded-xl border-slate-200 hover:bg-slate-50 gap-3 font-bold text-slate-700 transition-all active:scale-[0.98]'
						>
							<GoogleIcon className='w-5 h-5' />
							Continue with Google
						</Button>

						<div className='my-8 flex items-center gap-4'>
							<div className='h-px flex-1 bg-slate-100' />
							<span className='text-[10px] font-black text-slate-300 uppercase tracking-widest'>Or email signup</span>
							<div className='h-px flex-1 bg-slate-100' />
						</div>

						<form onSubmit={handleSubmit} className='space-y-4'>
							<div className="space-y-1.5">
								<Label htmlFor='name' className='text-slate-900 font-bold text-xs uppercase tracking-widest ml-1'>Full Name</Label>
								<div className='relative'>
									<User size={18} className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400' />
									<Input
										id='name'
										name='name'
										type='text'
										placeholder='John Doe'
										value={formData.name}
										onChange={handleChange}
										required
										className='pl-11 h-12 bg-slate-50/50 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/10 font-medium'
									/>
								</div>
							</div>

							<div className="space-y-1.5">
								<Label htmlFor='email' className='text-slate-900 font-bold text-xs uppercase tracking-widest ml-1'>Email Address</Label>
								<div className='relative'>
									<Mail size={18} className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400' />
									<Input
										id='email'
										name='email'
										type='email'
										placeholder='you@example.com'
										value={formData.email}
										onChange={handleChange}
										required
										className='pl-11 h-12 bg-slate-50/50 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/10 font-medium'
									/>
								</div>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div className="space-y-1.5">
									<Label htmlFor='password' className='text-slate-900 font-bold text-xs uppercase tracking-widest ml-1'>Password</Label>
									<div className='relative'>
										<Lock size={18} className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400' />
										<Input
											id='password'
											name='password'
											type={showPassword ? "text" : "password"}
											placeholder='••••••••'
											value={formData.password}
											onChange={handleChange}
											required
											className='pl-11 h-12 bg-slate-50/50 border-slate-200 rounded-xl font-medium'
										/>
									</div>
								</div>
								<div className="space-y-1.5">
									<Label htmlFor='confirmPassword' className='text-slate-900 font-bold text-xs uppercase tracking-widest ml-1'>Confirm</Label>
									<div className='relative'>
										<Lock size={18} className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400' />
										<Input
											id='confirmPassword'
											name='confirmPassword'
											type={showPassword ? "text" : "password"}
											placeholder='••••••••'
											value={formData.confirmPassword}
											onChange={handleChange}
											required
											className='pl-11 h-12 bg-slate-50/50 border-slate-200 rounded-xl font-medium'
										/>
									</div>
								</div>
							</div>

							<Button
								type='submit'
								disabled={loading}
								className='w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black uppercase text-xs tracking-widest transition-all mt-4'>
								{loading ? <Loader2 size={18} className='animate-spin' /> : "Create Account"}
							</Button>
						</form>

						<div className='mt-8 pt-8 border-t border-slate-100'>
							<p className='text-slate-400 font-bold text-xs uppercase tracking-widest'>
								Already a member?{" "}
								<Link href='/login' className='text-emerald-600 hover:text-emerald-700 transition-colors'>
									Sign In
								</Link>
							</p>
						</div>
					</>
				)}

				{step === "verification" && (
					<div className='text-center space-y-6'>
						<div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-500 mx-auto mb-8 shadow-inner">
							<Mail size={40} />
						</div>
						<h2 className='text-3xl font-black text-slate-900 tracking-tight'>Check your inbox</h2>
						<p className='text-slate-500 font-medium max-w-sm mx-auto'>
							We've sent a verification link to <span className="text-slate-900 font-bold">{formData.email}</span>. 
							Please verify your email to continue.
						</p>
						<div className="pt-8 flex flex-col gap-3">
							<Button 
								onClick={checkVerification}
								disabled={loading}
								className="h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black uppercase text-xs tracking-widest"
							>
								{loading ? <Loader2 className="animate-spin" /> : "I've Verified My Email"}
							</Button>
							<Button 
								variant="ghost" 
								onClick={() => setStep("signup")}
								className="text-slate-400 font-bold text-[10px] uppercase tracking-widest"
							>
								Back to signup
							</Button>
						</div>
					</div>
				)}

				{step === "profile" && (
					<div className='space-y-6'>
						<div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white mb-8">
							<Phone size={24} />
						</div>
						<h2 className='text-3xl font-black text-slate-900 tracking-tight'>One last thing</h2>
						<p className='text-slate-500 font-medium'>
							We need your phone number for order notifications and security.
						</p>
						
						<form onSubmit={handlePhoneSubmit} className="space-y-4 pt-4">
							<div className='flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all px-4'>
								<Phone size={18} className='text-slate-400 shrink-0' />
								<PhoneInput
									international
									defaultCountry='IN'
									value={phone}
									onChange={(val) => setPhone(val || "")}
									className='flex-1 py-4 px-2 border-0 focus:ring-0 text-slate-900 font-medium placeholder:text-slate-400'
								/>
							</div>
							<Button 
								type="submit"
								disabled={loading || !phone}
								className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black uppercase text-xs tracking-widest"
							>
								{loading ? <Loader2 className="animate-spin" /> : "Complete Setup"}
							</Button>
						</form>
					</div>
				)}
			</div>

			{/* Right Side - Features Illustration */}
			<div className='hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center p-20'>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                <div className="relative z-10 space-y-12 max-w-md">
                    <div className="space-y-4">
                        <div className="w-12 h-1 bg-emerald-500" />
                        <h3 className="text-5xl font-black text-white leading-tight">Digital excellence starts here.</h3>
                    </div>
                    <div className="space-y-8">
                        {[
                            { title: "Secure Transactions", desc: "Enterprise-grade security for every asset exchange." },
                            { title: "Verified Sellers", desc: "A curated community of trusted digital merchants." },
                            { title: "Instant Access", desc: "Get your digital products immediately after checkout." }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-6">
                                <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 shrink-0 flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold mb-1 uppercase text-xs tracking-widest">{item.title}</h4>
                                    <p className="text-slate-400 text-sm font-medium">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
			</div>
		</div>
	);
}
