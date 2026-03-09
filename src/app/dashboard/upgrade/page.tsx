"use client";

import { useState, useEffect } from "react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Check, Copy } from "lucide-react";
import { userContext } from "@/context/userContext";
import AdminSidebar from "@/components/admin-sidebar";

interface Plan {
	_id: string;
	name: string;
	price: number;
	description: string;
	postLimit: number;
	frequency: string;
}

export default function UpgradePage() {
	const { user } = userContext();
	const [plans, setPlans] = useState<Plan[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
	const [transactionId, setTransactionId] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [paymentMethod, setPaymentMethod] = useState("binance"); // binance or qr

	// Dummy payment details - In real app, fetch from settings or config
	const paymentDetails = {
		binanceId: "556105059",
		qrCodeUrl: "/upiscanner.jpeg",
		walletAddress: "adsenseservices90@axl",
	};

	useEffect(() => {
		const fetchPlans = async () => {
			try {
				const res = await fetch("/api/plans");
				const data = await res.json();
				if (data.success) {
					setPlans(data.plans);
				}
			} catch (error) {
				console.error("Failed to fetch plans:", error);
			} finally {
				setLoading(false);
			}
		};
		fetchPlans();
	}, []);

	const handleUpgrade = (plan: Plan) => {
		setSelectedPlan(plan);
		setTransactionId("");
	};

	const handleSubmitPayment = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedPlan) return;

		setSubmitting(true);
		try {
			const res = await fetch("/api/transactions", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					plan: selectedPlan.name.toLowerCase(),
					amount: selectedPlan.price,
					transactionId,
					paymentMethod,
				}),
			});
			const data = await res.json();
			if (data.success) {
				toast.success("Payment submitted! Admin will verify shortly.");
				setSelectedPlan(null);
			} else {
				toast.error(data.message || "Failed to submit payment");
			}
		} catch (error) {
			toast.error("An error occurred");
		} finally {
			setSubmitting(false);
		}
	};

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
		toast.success("Copied to clipboard");
	};



	return (
		<div className='min-h-[calc(100vh-85px)] bg-linear-to-br from-slate-50 via-white to-slate-100 p-4 md:p-6 lg:p-8 pb-24 md:pb-8'>
			<AdminSidebar role="user" />
			<div className='md:ml-64 mx-auto'>
				<div className='mb-8'>
					<h1 className='text-3xl font-bold text-slate-900'>
						Upgrade Plan
					</h1>
					<p className='text-slate-500 mt-1'>
						Choose a plan that fits your needs.
					</p>
				</div>

				<div className='grid gap-6 md:grid-cols-3'>
					{plans.map((plan) => {
						const isCurrent =
							user?.currentPlan === plan.name.toLowerCase();
						return (
							<Card
								key={plan._id}
								className={`flex flex-col border-none shadow-sm hover:shadow-md transition-all ${
									isCurrent
										? "ring-2 ring-sky-500 shadow-md"
										: ""
								}`}>
								<CardHeader>
									<CardTitle className='flex justify-between items-center'>
										{plan.name}
										{isCurrent && (
											<span className='text-xs bg-sky-100 text-sky-700 px-2 py-1 rounded-full'>
												Current
											</span>
										)}
									</CardTitle>
									<div className='mt-2'>
										<span className='text-3xl font-bold text-slate-900'>
											${plan.price}
										</span>
										<span className='text-slate-500 text-sm'>
											{" "}
											/ month
										</span>
									</div>
								</CardHeader>
								<CardContent className='flex-1'>
									<p className='text-slate-600 mb-6'>
										{plan.description}
									</p>
									<ul className='space-y-3 text-sm'>
										<li className='flex items-center gap-3'>
											<div className='p-1 bg-green-100 rounded-full'>
												<Check
													size={12}
													className='text-green-600'
												/>
											</div>
											<span className='text-slate-700'>
												{plan.postLimit} posts per{" "}
												{plan.frequency === "daily"
													? "day"
													: "week"}
											</span>
										</li>
										<li className='flex items-center gap-3'>
											<div className='p-1 bg-green-100 rounded-full'>
												<Check
													size={12}
													className='text-green-600'
												/>
											</div>
											<span className='text-slate-700'>
												Admin support
											</span>
										</li>
									</ul>
								</CardContent>
								<CardFooter>
									<Button
										className='w-full'
										disabled={isCurrent || plan.price === 0}
										variant={
											isCurrent ? "outline" : "default"
										}
										onClick={() => handleUpgrade(plan)}>
										{isCurrent
											? "Active Plan"
											: plan.price === 0
											? "Default Plan"
											: "Upgrade"}
									</Button>
								</CardFooter>
							</Card>
						);
					})}
				</div>

				{selectedPlan && (
					<div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
						<Card className='w-full max-w-md bg-white border-none shadow-xl animate-in fade-in zoom-in duration-200'>
							<CardHeader>
								<CardTitle>Complete Payment</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='space-y-6'>
									<div className='bg-slate-50 p-4 rounded-lg space-y-3 border border-slate-100'>
										<p className='text-sm font-medium text-slate-700'>
											Send{" "}
											<span className='text-lg font-bold text-slate-900'>
												${selectedPlan.price}
											</span>{" "}
											via:
										</p>
										<div className='flex gap-2'>
											<Button
												variant={
													paymentMethod === "binance"
														? "default"
														: "outline"
												}
												size='sm'
												onClick={() =>
													setPaymentMethod("binance")
												}
												className='flex-1'>
												Binance Pay
											</Button>
											<Button
												variant={
													paymentMethod === "qr"
														? "default"
														: "outline"
												}
												size='sm'
												onClick={() =>
													setPaymentMethod("qr")
												}
												className='flex-1'>
												UPI Payment
											</Button>
										</div>

										{paymentMethod === "binance" ? (
											<div className='flex items-center justify-between p-3 bg-white rounded border border-slate-200'>
												<span className='font-mono text-sm'>
													ID:{" "}
													{paymentDetails.binanceId}
												</span>
												<Button
													variant='ghost'
													size='icon'
													className='h-6 w-6'
													onClick={() =>
														copyToClipboard(
															paymentDetails.binanceId
														)
													}>
													<Copy size={14} />
												</Button>
											</div>
										) : (
											<div className='space-y-3'>
												<div className='flex justify-center p-4 bg-white rounded border border-slate-200'>
													{/* eslint-disable-next-line @next/next/no-img-element */}
													<img
														src={
															paymentDetails.qrCodeUrl
														}
														alt='Payment QR'
														className='w-32 h-32'
													/>
												</div>
												<div className='flex items-center justify-between p-3 bg-white rounded border border-slate-200'>
													<span className='font-mono text-xs truncate mr-2'>
														{
															paymentDetails.walletAddress
														}
													</span>
													<Button
														variant='ghost'
														size='icon'
														className='h-6 w-6 shrink-0'
														onClick={() =>
															copyToClipboard(
																paymentDetails.walletAddress
															)
														}>
														<Copy size={14} />
													</Button>
												</div>
											</div>
										)}
									</div>

									<form
										onSubmit={handleSubmitPayment}
										className='space-y-4'>
										<div className='space-y-2'>
											<Label htmlFor='txId'>
												Transaction ID
											</Label>
											<Input
												id='txId'
												placeholder='Enter transaction ID/Hash'
												value={transactionId}
												onChange={(e) =>
													setTransactionId(
														e.target.value
													)
												}
												required
											/>
										</div>
										<div className='flex gap-3 pt-2'>
											<Button
												type='button'
												variant='outline'
												className='flex-1'
												onClick={() =>
													setSelectedPlan(null)
												}>
												Cancel
											</Button>
											<Button
												type='submit'
												className='flex-1'
												disabled={submitting}>
												{submitting ? (
													<Loader2 className='mr-2 h-4 w-4 animate-spin' />
												) : (
													"Submit Payment"
												)}
											</Button>
										</div>
									</form>
								</div>
							</CardContent>
						</Card>
					</div>
				)}
			</div>
		</div>
	);
}
