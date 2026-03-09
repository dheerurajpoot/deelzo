"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	ShoppingCart,
	ArrowLeft,
	Tag,
	Percent,
	CreditCard,
	Banknote,
	Lock,
	CheckCircle,
	Loader2,
	Shield,
	Zap,
	Download,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { userContext } from "@/context/userContext";

interface Product {
	_id: string;
	title: string;
	price: number;
	comparePrice?: number;
	currency: string;
	thumbnail?: string;
	category: string;
}

interface CouponData {
	code: string;
	discountType: string;
	discountValue: number;
	discountAmount: number;
	finalAmount: number;
	minimumAmount: number;
	maximumDiscount: number | null;
}

export default function CheckoutComponent() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const { user } = userContext();

	const [product, setProduct] = useState<Product | null>(null);
	const [loading, setLoading] = useState(true);
	const [isProcessing, setIsProcessing] = useState(false);
	const [couponCode, setCouponCode] = useState("");
	const [couponData, setCouponData] = useState<CouponData | null>(null);
	const [isVerifyingCoupon, setIsVerifyingCoupon] = useState(false);
	const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
		"upi" | "binance" | "card" | ""
	>("");
	const [transactionId, setTransactionId] = useState("");
	const [isVerifying, setIsVerifying] = useState(false);
	const [showTransactionDialog, setShowTransactionDialog] = useState(false);

	const [paymentDetails] = useState({
		upiId: "adsenseservices90@axl",
		binanceWallet: "TEiKjQHn5sRpW69prMSsV2s38PQtndofhb",
		upiQrUrl: "/upiscanner.jpeg",
		binanceQrUrl: "/usdtscanner.jpeg",
	});

	// Get product ID from URL params
	const productId = searchParams.get("product");

	useEffect(() => {
		if (!productId) {
			toast.error("No product selected");
			router.push("/shop");
			return;
		}

		fetchProduct();
	}, [productId, user, router]);

	const fetchProduct = async () => {
		try {
			setLoading(true);
			const response = await axios.get(`/api/products/${productId}`);
			if (response.data.success) {
				setProduct(response.data.product);
			} else {
				toast.error("Product not found");
				router.push("/shop");
			}
		} catch (error) {
			console.error("Error fetching product:", error);
			toast.error("Failed to load product");
			router.push("/shop");
		} finally {
			setLoading(false);
		}
	};

	const verifyCoupon = async () => {
		if (!couponCode.trim()) {
			toast.error("Please enter a coupon code");
			return;
		}

		if (!product) return;

		try {
			setIsVerifyingCoupon(true);

			const response = await axios.post("/api/coupons/validate", {
				code: couponCode,
				cartTotal: product.price,
				productCategory: product.category,
				productId: product._id,
			});

			if (response.data.success) {
				setCouponData(response.data.coupon);
				toast.success("Coupon applied successfully!");
			} else {
				toast.error(response.data.message);
				setCouponData(null);
			}
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Invalid coupon code");
			setCouponData(null);
		} finally {
			setIsVerifyingCoupon(false);
		}
	};

	const removeCoupon = () => {
		setCouponCode("");
		setCouponData(null);
		toast.success("Coupon removed");
	};

	const handleBuy = async () => {
		if (!user) {
			toast.error("Please login to purchase");
			router.push("/login");
			return;
		}

		if (!product) return;

		if (!selectedPaymentMethod) {
			toast.error("Please select a payment method");
			return;
		}

		// Show payment details based on selected method
		if (
			selectedPaymentMethod === "upi" ||
			selectedPaymentMethod === "binance"
		) {
			setShowTransactionDialog(true);
		}
	};

	const submitTransactionId = async () => {
		if (!user) {
			toast.error("Please login to complete payment");
			router.push("/login");
			return;
		}

		if (!transactionId.trim()) {
			toast.error("Transaction ID is required");
			return;
		}

		try {
			setIsVerifying(true);

			// Create order with transaction ID
			const orderAmount = couponData
				? couponData.finalAmount
				: product?.price || 0;

			const response = await axios.post("/api/orders", {
				productId: product?._id,
				productSnapshot: {
					title: product?.title,
					price: product?.price,
					comparePrice: product?.comparePrice,
					thumbnail: product?.thumbnail,
					category: product?.category,
				},
				amount: product?.price,
				finalAmount: orderAmount,
				currency: product?.currency || "USD",
				paymentMethod: selectedPaymentMethod,
				couponCode: couponData?.code || null,
				discountAmount: couponData?.discountAmount || 0,
				transactionId: transactionId,
			});

			if (response.data.success) {
				toast.success("Payment submitted successfully! ");
				setShowTransactionDialog(false);
				setTransactionId("");
				// Redirect to orders dashboard after short delay
				setTimeout(() => {
					router.push("/dashboard/orders");
				}, 2000);
			} else {
				toast.error(
					response.data.message || "Failed to submit payment",
				);
			}
		} catch (error: any) {
			toast.error(
				error.response?.data?.message || "Failed to submit payment",
			);
		} finally {
			setIsVerifying(false);
		}
	};

	const finalAmount = couponData
		? couponData.finalAmount
		: product?.price || 0;
	const discountAmount = couponData ? couponData.discountAmount : 0;

	if (loading) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center'>
				<Loader2 className='animate-spin text-orange-500' size={48} />
			</div>
		);
	}

	if (!product) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center'>
				<div className='text-center'>
					<ShoppingCart
						size={64}
						className='mx-auto mb-4 text-slate-300'
					/>
					<h1 className='text-2xl font-bold text-slate-900 mb-2'>
						Product Not Found
					</h1>
					<p className='text-slate-500 mb-6'>
						The product you're trying to purchase doesn't exist.
					</p>
					<Link href='/shop'>
						<Button className='bg-gradient-to-r from-orange-500 to-rose-500'>
							<ArrowLeft size={18} className='mr-2' />
							Back to Shop
						</Button>
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100'>
			{/* Header */}
			<div className='border-b border-slate-200 bg-white/80 backdrop-blur-sm'>
				<div className='max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4'>
					<div className='flex items-center justify-between'>
						<div className='flex items-center gap-2 text-sm'>
							<Link
								href='/'
								className='text-slate-500 hover:text-orange-600 transition-colors'>
								Home
							</Link>
							<span className='text-slate-300'>/</span>
							<Link
								href='/shop'
								className='text-slate-500 hover:text-orange-600 transition-colors'>
								Shop
							</Link>
							<span className='text-slate-300'>/</span>
							<span className='text-slate-900 font-medium'>
								Checkout
							</span>
						</div>
						<Link href='/shop'>
							<Button variant='outline' size='sm'>
								<ArrowLeft size={16} className='mr-2' />
								Continue Shopping
							</Button>
						</Link>
					</div>
				</div>
			</div>

			<div className='max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8'>
				<div className='grid lg:grid-cols-3 gap-8'>
					{/* Left Column - Order Summary */}
					<div className='lg:col-span-2 space-y-6'>
						{/* Product Card */}
						<Card className='overflow-hidden border-slate-200 shadow-xs p-0'>
							<CardHeader className='bg-gradient-to-r from-orange-50 to-rose-50 border-b-[1px] py-3 border-slate-200'>
								<CardTitle className='flex items-center gap-2 text-slate-900'>
									<ShoppingCart
										size={20}
										className='text-orange-500'
									/>
									Order Summary
								</CardTitle>
							</CardHeader>
							<CardContent className='p-6'>
								<div className='flex gap-4'>
									<div className='flex-shrink-0'>
										{product.thumbnail ? (
											<img
												src={product.thumbnail}
												alt={product.title}
												className='w-20 h-20 rounded-lg object-cover border border-slate-200'
											/>
										) : (
											<div className='w-20 h-20 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center'>
												<ShoppingCart
													size={24}
													className='text-slate-400'
												/>
											</div>
										)}
									</div>
									<div className='flex-1'>
										<h3 className='font-semibold text-slate-900 text-lg'>
											{product.title}
										</h3>
										<p className='text-slate-600 text-sm capitalize mt-1'>
											{product.category}
										</p>
										<div className='mt-3'>
											<span className='text-2xl font-bold text-slate-900'>
												{product?.currency}{" "}
												{product?.price.toFixed(2)}
											</span>
											{product.comparePrice &&
												product.comparePrice >
													product.price && (
													<span className='text-lg text-slate-400 line-through ml-2'>
														{product?.currency}{" "}
														{product?.comparePrice?.toFixed(
															2,
														)}
													</span>
												)}
										</div>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Coupon Section */}
						<Card className='border-slate-200 shadow-xs'>
							<CardHeader className='pb-4'>
								<CardTitle className='flex items-center gap-2 text-slate-900'>
									<Tag
										size={20}
										className='text-emerald-500'
									/>
									Apply Coupon Code
								</CardTitle>
							</CardHeader>
							<CardContent>
								{couponData ? (
									<div className='bg-emerald-50 border border-emerald-200 rounded-xl p-4'>
										<div className='flex items-center justify-between'>
											<div className='flex items-center gap-2'>
												<CheckCircle
													size={20}
													className='text-emerald-600'
												/>
												<span className='font-semibold text-emerald-800'>
													Coupon Applied!
												</span>
												<Badge className='bg-emerald-100 text-emerald-800 border-0'>
													{couponData.code}
												</Badge>
											</div>
											<Button
												variant='outline'
												size='sm'
												onClick={removeCoupon}
												className='border-emerald-300 text-emerald-700 hover:bg-emerald-100'>
												Remove
											</Button>
										</div>
										<div className='mt-3 text-sm text-emerald-700'>
											<p>
												{couponData.discountType ===
												"percentage"
													? `${couponData.discountValue}% discount`
													: `${product?.currency} ${couponData.discountValue} discount`}
											</p>
											<p className='font-medium'>
												You save: {product?.currency}{" "}
												{couponData.discountAmount.toFixed(
													2,
												)}
											</p>
										</div>
									</div>
								) : (
									<div className='flex gap-3'>
										<div className='flex-1'>
											<Input
												value={couponCode}
												onChange={(e) =>
													setCouponCode(
														e.target.value,
													)
												}
												placeholder='Enter coupon code'
												className='h-12'
												onKeyPress={(e) =>
													e.key === "Enter" &&
													verifyCoupon()
												}
											/>
										</div>
										<Button
											onClick={verifyCoupon}
											disabled={
												isVerifyingCoupon ||
												!couponCode.trim()
											}
											className='bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 h-12 px-6'>
											{isVerifyingCoupon ? (
												<Loader2
													className='animate-spin'
													size={18}
												/>
											) : (
												<>
													<Percent
														size={18}
														className='mr-2'
													/>
													Apply
												</>
											)}
										</Button>
									</div>
								)}
							</CardContent>
						</Card>
					</div>

					{/* Right Column - Payment Summary */}
					<div className='space-y-6'>
						{/* Order Total */}
						<Card className='border-slate-200 shadow-xs sticky top-8 p-0'>
							<CardHeader className='bg-gradient-to-r from-slate-50 rounded-t-xl py-3 to-slate-100 border-b-[1px] border-slate-200'>
								<CardTitle className='text-slate-900 flex items-center'>
									<CreditCard
										size={20}
										className='text-slate-900'
									/>
									<span className='ml-2'>Order Total</span>
								</CardTitle>
							</CardHeader>
							<CardContent className='p-6 space-y-6'>
								{/* Payment Method Selection */}
								<div>
									<h3 className='font-semibold text-slate-900 mb-3'>
										Select Payment Method
									</h3>
									<div className='space-y-3'>
										<div
											className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
												selectedPaymentMethod === "upi"
													? "border-blue-500 bg-blue-50"
													: "border-slate-200 hover:border-slate-300"
											}`}
											onClick={() =>
												setSelectedPaymentMethod("upi")
											}>
											<div className='flex items-center gap-3'>
												<div
													className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
														selectedPaymentMethod ===
														"upi"
															? "border-blue-500 bg-blue-500"
															: "border-slate-300"
													}`}>
													{selectedPaymentMethod ===
														"upi" && (
														<div className='w-2 h-2 rounded-full bg-white'></div>
													)}
												</div>
												<div className='flex items-center gap-3'>
													<div className='w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center'>
														<Banknote
															size={16}
															className='text-white'
														/>
													</div>
													<div>
														<h4 className='font-semibold text-slate-900'>
															UPI Payment{" "}
															<Badge className='bg-blue-200 text-blue-800 border-0 ml-2'>
																India Only
															</Badge>
														</h4>
														<p className='text-sm text-slate-600'>
															Instant payment via
															UPI apps
														</p>
													</div>
												</div>
											</div>
										</div>

										<div
											className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
												selectedPaymentMethod ===
												"binance"
													? "border-yellow-500 bg-yellow-50"
													: "border-slate-200 hover:border-slate-300"
											}`}
											onClick={() =>
												setSelectedPaymentMethod(
													"binance",
												)
											}>
											<div className='flex items-center gap-3'>
												<div
													className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
														selectedPaymentMethod ===
														"binance"
															? "border-yellow-500 bg-yellow-500"
															: "border-slate-300"
													}`}>
													{selectedPaymentMethod ===
														"binance" && (
														<div className='w-2 h-2 rounded-full bg-white'></div>
													)}
												</div>
												<div className='flex items-center gap-3'>
													<div className='w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center'>
														<CreditCard
															size={16}
															className='text-white'
														/>
													</div>
													<div>
														<h4 className='font-semibold text-slate-900'>
															Binance Payment
														</h4>
														<p className='text-sm text-slate-600'>
															Pay with USDT via
															Binance
														</p>
													</div>
												</div>
											</div>
										</div>

										<div className='p-4 rounded-xl border-2 border-slate-200 opacity-50'>
											<div className='flex items-center gap-3'>
												<div className='w-5 h-5 rounded-full border-2 border-slate-300'></div>
												<div className='flex items-center gap-3'>
													<div className='w-8 h-8 rounded-full bg-slate-400 flex items-center justify-center'>
														<Lock
															size={16}
															className='text-white'
														/>
													</div>
													<div>
														<h4 className='font-semibold text-slate-900'>
															Card Payment
														</h4>
														<p className='text-sm text-slate-600'>
															Credit/Debit cards
															(Coming soon)
														</p>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>

								{/* Order Summary */}
								<div className='space-y-3'>
									<div className='flex justify-between text-slate-600'>
										<span>Subtotal</span>
										{selectedPaymentMethod === "upi" ? (
											<span>
												₹
												{(product?.price * 90)?.toFixed(
													2,
												) || 0}
											</span>
										) : (
											<span>
												{product?.currency}{" "}
												{product?.price?.toFixed(2) ||
													0}
											</span>
										)}
									</div>

									{discountAmount > 0 && (
										<div className='flex justify-between text-emerald-600'>
											<span>Discount</span>
											{selectedPaymentMethod === "upi" ? (
												<span>
													₹
													{(
														discountAmount * 90
													)?.toFixed(2) || 0}
												</span>
											) : (
												<span>
													- {product?.currency}{" "}
													{discountAmount.toFixed(2)}
												</span>
											)}
										</div>
									)}

									<div className='border-t border-slate-200 pt-3'>
										<div className='flex justify-between text-lg font-bold text-slate-900'>
											<span>Total</span>
											{selectedPaymentMethod === "upi" ? (
												<span>
													₹
													{(
														finalAmount * 90
													)?.toFixed(2) || 0}
												</span>
											) : (
												<span>
													{product?.currency}{" "}
													{finalAmount?.toFixed(2) ||
														0}
												</span>
											)}
										</div>
									</div>
								</div>

								<Button
									onClick={handleBuy}
									disabled={
										isProcessing || !selectedPaymentMethod
									}
									className='w-full bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white py-6 text-lg font-semibold shadow-lg shadow-orange-500/25'>
									{isProcessing ? (
										<Loader2
											className='animate-spin mr-2'
											size={20}
										/>
									) : (
										<CreditCard
											className='mr-2'
											size={20}
										/>
									)}
									{selectedPaymentMethod
										? `Proceed with ${selectedPaymentMethod === "upi" ? "UPI" : "Binance"}`
										: "Select Payment Method"}
								</Button>

								{/* Trust Badges */}
								<div className='grid grid-cols-3 gap-2 pt-4 border-t border-slate-200'>
									<div className='flex flex-col items-center gap-1 text-xs text-slate-600'>
										<Shield
											size={16}
											className='text-emerald-500'
										/>
										<span>Secure</span>
									</div>
									<div className='flex flex-col items-center gap-1 text-xs text-slate-600'>
										<Download
											size={16}
											className='text-blue-500'
										/>
										<span>Instant</span>
									</div>
									<div className='flex flex-col items-center gap-1 text-xs text-slate-600'>
										<Zap
											size={16}
											className='text-amber-500'
										/>
										<span>Lifetime</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>

			{/* Payment Details Dialog */}
			<Dialog
				open={showTransactionDialog}
				onOpenChange={(open) => {
					if (!open) {
						setTransactionId("");
					}
					setShowTransactionDialog(open);
				}}>
				<DialogContent className='max-w-md'>
					<DialogHeader>
						<DialogTitle>Complete Your Payment</DialogTitle>
						<p className='text-sm text-slate-600'>
							Pay using{" "}
							{selectedPaymentMethod === "upi"
								? "UPI"
								: "Binance"}
						</p>
					</DialogHeader>
					<div className='space-y-6 py-4'>
						{/* Payment Instructions */}
						<div className='bg-slate-50 rounded-xl p-4'>
							<h3 className='font-semibold text-slate-900 mb-3'>
								Payment Instructions
							</h3>

							{selectedPaymentMethod === "upi" && (
								<div className='space-y-4'>
									<div className='flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200'>
										<div>
											<p className='text-sm text-slate-500'>
												UPI ID
											</p>
											<p className='font-mono font-medium text-slate-900'>
												{paymentDetails.upiId}
											</p>
										</div>
										<Button
											variant='outline'
											size='sm'
											onClick={() =>
												navigator.clipboard.writeText(
													paymentDetails.upiId,
												)
											}
											className='border-blue-300 text-blue-700 hover:bg-blue-50'>
											Copy
										</Button>
									</div>

									<div className='text-center'>
										<p className='text-sm text-slate-600 mb-3'>
											Scan QR Code to Pay
										</p>
										<div className='bg-white p-4 rounded-lg inline-block border border-slate-200'>
											<img
												src={paymentDetails.upiQrUrl}
												alt='UPI QR Code'
												className='w-40 h-40 rounded-lg'
											/>
										</div>
										<p className='text-lg font-bold text-slate-500 mt-2'>
											Amount: ₹{" "}
											{(finalAmount * 90)?.toFixed(2) ||
												0}{" "}
											INR
										</p>
									</div>
								</div>
							)}

							{selectedPaymentMethod === "binance" && (
								<div className='space-y-4'>
									<div className='flex items-center justify-between p-3 bg-white rounded-lg border border-yellow-200'>
										<div>
											<p className='text-sm text-slate-500'>
												Binance Wallet Address
											</p>
											<p className='font-mono text-xs text-slate-900 break-all'>
												{paymentDetails.binanceWallet}
											</p>
										</div>
										<Button
											variant='outline'
											size='sm'
											onClick={() =>
												navigator.clipboard.writeText(
													paymentDetails.binanceWallet,
												)
											}
											className='border-yellow-300 text-yellow-700 hover:bg-yellow-50'>
											Copy
										</Button>
									</div>

									<div className='text-center'>
										<p className='text-sm text-slate-600 mb-3'>
											Scan QR Code to Pay
										</p>
										<div className='bg-white p-4 rounded-lg inline-block border border-slate-200'>
											<img
												src={
													paymentDetails.binanceQrUrl
												}
												alt='Binance QR Code'
												className='w-40 h-40 rounded-lg'
											/>
										</div>
										<p className='text-lg font-bold text-slate-500 mt-2'>
											Amount: {product?.currency}{" "}
											{finalAmount?.toFixed(2) || 0}
										</p>
									</div>
								</div>
							)}
						</div>

						{/* Mandatory Transaction ID Input */}
						<div>
							<label className='block text-sm font-medium text-slate-700 mb-2 required'>
								Transaction ID/Reference{" "}
								<span className='text-rose-500'>*</span>
							</label>
							<Input
								value={transactionId}
								onChange={(e) =>
									setTransactionId(e.target.value)
								}
								placeholder='Enter transaction ID or reference number'
								className='w-full'
								required
							/>
							<p className='text-xs text-slate-500 mt-1'>
								Enter the transaction ID from your payment app
								(required)
							</p>
						</div>

						<div className='flex justify-end gap-3 pt-4'>
							<Button
								variant='outline'
								onClick={() => {
									setShowTransactionDialog(false);
									setTransactionId("");
								}}>
								Cancel
							</Button>
							<Button
								onClick={async () => {
									if (!transactionId.trim()) {
										toast.error(
											"Transaction ID is required",
										);
										return;
									}
									await submitTransactionId();
								}}
								disabled={isVerifying || !transactionId.trim()}
								className='bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white'>
								{isVerifying ? (
									<>
										<Loader2
											className='animate-spin mr-2'
											size={16}
										/>
										Processing...
									</>
								) : (
									"Complete Payment"
								)}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
