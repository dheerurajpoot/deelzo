"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	ShoppingBag,
	Loader2,
	CheckCircle,
	XCircle,
	Clock,
	Download,
	Package,
	IndianRupee,
	HelpCircle,
	CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import Link from "next/link";
import AdminSidebar from "@/components/admin-sidebar";
import { useRouter } from "next/navigation";

interface Order {
	_id: string;
	orderId: string;
	product: {
		_id: string;
		title: string;
		thumbnail?: string;
		slug: string;
	};
	productSnapshot: {
		title: string;
		price: number;
		thumbnail?: string;
		category?: string;
	};
	finalAmount: number;
	currency: string;
	paymentMethod?: string;
	transactionId?: string;
	paymentStatus:
		| "pending"
		| "completed"
		| "failed"
		| "refunded"
		| "cancelled";
	status: "pending" | "processing" | "completed" | "cancelled" | "refunded";
	deliveryStatus: "pending" | "delivered" | "failed";
	createdAt: string;
	paidAt?: string;
	downloadExpiry?: string;
	downloadCount?: number;
	razorpay?: {
		orderId?: string;
		paymentId?: string;
	};
}

export default function MyOrdersPage() {
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedStatus, setSelectedStatus] = useState<string>("all");
	const router = useRouter();

	const fetchOrders = async () => {
		try {
			setLoading(true);
			const params = new URLSearchParams();
			if (selectedStatus !== "all")
				params.append("status", selectedStatus);

			const response = await axios.get(
				`/api/orders?${params.toString()}`,
			);
			setOrders(response.data.orders || []);
		} catch (error) {
			toast.error("Failed to fetch orders");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchOrders();
	}, [selectedStatus]);

	const getPaymentStatusBadge = (status: string) => {
		switch (status) {
			case "completed":
				return (
					<span className='flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium'>
						<CheckCircle size={12} /> Paid
					</span>
				);
			case "processing":
				return (
					<span className='flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium'>
						<Clock size={12} /> Processing
					</span>
				);
			case "failed":
				return (
					<span className='flex items-center gap-1 px-2 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-medium'>
						<XCircle size={12} /> Failed
					</span>
				);
			case "refunded":
				return (
					<span className='flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium'>
						<IndianRupee size={12} /> Refunded
					</span>
				);
			default:
				return null;
		}
	};

	const getOrderStatusBadge = (status: string) => {
		switch (status) {
			case "completed":
				return <Badge className='bg-emerald-500'>Completed</Badge>;
			case "pending":
				return <Badge className='bg-amber-500'>Pending</Badge>;
			case "processing":
				return <Badge className='bg-blue-500'>Processing</Badge>;
			case "cancelled":
				return <Badge className='bg-rose-500'>Cancelled</Badge>;
			case "refunded":
				return <Badge className='bg-slate-500'>Refunded</Badge>;
			default:
				return null;
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-IN", {
			day: "numeric",
			month: "short",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const isDownloadAvailable = (order: Order) => {
		return (
			order.paymentStatus === "completed" &&
			order.deliveryStatus === "delivered"
		);
	};

	const handleDownload = async (order: Order) => {
		try {
			// Get the product ID from the order
			const productId = order.product._id || (order as any).product;

			// Get download URL from the new API
			const response = await axios.get(
				`/api/products/${productId}/download`,
			);

			if (response.data.success) {
				const { downloadUrl, type } = response.data;

				if (type === "upload") {
					// For uploaded files, open in new tab
					window.open(downloadUrl, "_blank");
				} else if (type === "link") {
					// For external links, open in new tab
					window.open(downloadUrl, "_blank");
				}

				toast.success("Download started!");
			} else {
				toast.error(response.data.message || "Download not available");
			}
		} catch (error: any) {
			console.error("Download error:", error);
			toast.error(
				error.response?.data?.message || "Failed to initiate download",
			);
		}
	};

	return (
		<div className='min-h-[calc(100vh-84px)] bg-gradient-to-br from-slate-50 via-white to-slate-100 py-8'>
			<AdminSidebar role='user' />
			<div className=' md:ml-64 mx-auto px-4 md:px-6 lg:px-8'>
				{/* Header */}
				<div className='mb-8'>
					<div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
						<div className='flex items-center gap-3'>
							<div className='w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/25'>
								<ShoppingBag size={24} className='text-white' />
							</div>
							<div>
								<h1 className='text-2xl md:text-3xl font-bold text-slate-900'>
									My Orders
								</h1>
								<p className='text-slate-500 text-sm'>
									Track your purchases and downloads
								</p>
							</div>
						</div>
						<Select
							value={selectedStatus}
							onValueChange={setSelectedStatus}>
							<SelectTrigger className='w-[160px]'>
								<SelectValue placeholder='Filter by status' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>All Orders</SelectItem>
								<SelectItem value='completed'>
									Completed
								</SelectItem>
								<SelectItem value='pending'>Pending</SelectItem>
								<SelectItem value='processing'>
									Processing
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				{/* Orders List */}
				{loading ? (
					<div className='flex items-center justify-center py-20'>
						<Loader2
							className='animate-spin text-orange-500'
							size={40}
						/>
					</div>
				) : orders.length === 0 ? (
					<Card className='bg-white border-slate-200'>
						<CardContent className='p-12 text-center'>
							<ShoppingBag
								size={64}
								className='mx-auto mb-4 text-slate-300'
							/>
							<h3 className='text-xl font-semibold text-slate-900 mb-2'>
								No orders yet
							</h3>
							<p className='text-slate-500 mb-6'>
								Start shopping to see your orders here
							</p>
							<Link href='/shop'>
								<Button className='bg-gradient-to-r from-orange-500 to-rose-500'>
									Browse Products
								</Button>
							</Link>
						</CardContent>
					</Card>
				) : (
					<div className='space-y-4'>
						{orders.map((order) => (
							<Card
								key={order._id}
								className='bg-white border-slate-200 hover:shadow-lg transition-shadow p-0'>
								<CardContent className='p-6'>
									<div className='flex flex-col md:flex-row gap-6'>
										{/* Product Image */}
										<div className='flex-shrink-0'>
											{order.productSnapshot
												?.thumbnail ? (
												<img
													src={
														order.productSnapshot
															.thumbnail
													}
													alt=''
													className='w-24 h-24 md:w-32 md:h-32 rounded-xl object-cover'
												/>
											) : (
												<div className='w-24 h-24 md:w-32 md:h-32 rounded-xl bg-slate-200 flex items-center justify-center'>
													<Package
														size={32}
														className='text-slate-400'
													/>
												</div>
											)}
										</div>

										{/* Order Details */}
										<div className='flex-1 min-w-0'>
											<div className='flex flex-col md:flex-row md:items-start md:justify-between gap-4'>
												<div className='flex-1 md:pr-4'>
													<div className='flex items-center gap-3 mb-2'>
														<span className='font-mono text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-md'>
															#{order.orderId}
														</span>
														<span className='text-sm text-slate-500 flex items-center gap-1.5'>
															<Clock size={14} />
															{formatDate(
																order.createdAt,
															)}
														</span>
													</div>
													<h3 className='text-lg font-semibold text-slate-900 mb-1'>
														{order.productSnapshot
															?.title ||
															"Product"}
													</h3>
													
													<div className='flex items-center gap-2 mb-2'>
														<span className='text-xl font-bold text-slate-900'>
															{order.currency === 'INR' ? '₹' : order.currency}{" "}
															{order.finalAmount.toFixed(
																2,
															)}
														</span>
													</div>

													<div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-3 mt-4 border-t border-slate-100 bg-slate-50/50 rounded-lg p-3">
														<div>
															<p className="text-xs text-slate-500 mb-1 font-medium">Payment Method</p>
															<p className="text-sm font-medium text-slate-900 capitalize flex items-center gap-1.5">
																<CreditCard size={14} className="text-slate-400" />
																{order.paymentMethod ? order.paymentMethod.replace(/_/g, ' ') : 'Online'}
															</p>
														</div>
														<div>
															<p className="text-xs text-slate-500 mb-1 font-medium">Transaction ID</p>
															<p className="text-xs font-mono text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200 inline-block max-w-[120px] md:max-w-[140px] truncate" title={order.transactionId || order.razorpay?.paymentId || 'N/A'}>
																{order.transactionId || order.razorpay?.paymentId || 'N/A'}
															</p>
														</div>
														<div>
															<p className="text-xs text-slate-500 mb-1 font-medium">Payment Status</p>
															<div className="inline-flex mt-0.5">{getPaymentStatusBadge(order.paymentStatus)}</div>
														</div>
														<div>
															<p className="text-xs text-slate-500 mb-1 font-medium">Order Status</p>
															<div className="inline-flex mt-0.5">{getOrderStatusBadge(order.status)}</div>
														</div>
													</div>
												</div>

												<div className='flex flex-col gap-2'>
													{isDownloadAvailable(
														order,
													) ? (
														<Button
															className='bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600'
															onClick={() =>
																handleDownload(
																	order,
																)
															}>
															<Download
																size={16}
																className='mr-2'
															/>
															Download
														</Button>
													) : order.paymentStatus ===
													  "pending" ? (
														<Button
															variant='outline'
															disabled>
															<Clock
																size={16}
																className='mr-2'
															/>
															Pending Payment
														</Button>
													) : (
														<Button
															variant='outline'
															disabled>
															<Package
																size={16}
																className='mr-2'
															/>
															Processing
														</Button>
													)}
													<Button
														variant='ghost'
														size='sm'
														onClick={() => {
															router.push("/contact");
														}}>
														<HelpCircle
															size={16}
															className='mr-2'
														/>
														Contact Support
													</Button>
												</div>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
