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
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	ShoppingBag,
	Loader2,
	CheckCircle,
	XCircle,
	Clock,
	Download,
	Package,
	IndianRupee,
	Eye,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import Link from "next/link";
import AdminSidebar from "@/components/admin-sidebar";

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
	const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
	const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

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
			case "pending":
				return (
					<span className='flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium'>
						<Clock size={12} /> Pending
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
			// order.downloadExpiry &&
			// new Date(order.downloadExpiry) > new Date()
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
								className='bg-white border-slate-200 hover:shadow-lg transition-shadow'>
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
												<div>
													<div className='flex items-center gap-3 mb-2'>
														<span className='font-mono text-sm text-slate-500'>
															{order.orderId}
														</span>
														{getPaymentStatusBadge(
															order.paymentStatus,
														)}
													</div>
													<h3 className='text-lg font-semibold text-slate-900 mb-1'>
														{order.productSnapshot
															?.title ||
															"Product"}
													</h3>
													<p className='text-sm text-slate-500 mb-3'>
														Ordered on{" "}
														{formatDate(
															order.createdAt,
														)}
													</p>
													<div className='flex items-center gap-4'>
														<span className='text-xl font-bold text-slate-900'>
															{order.currency}{" "}
															{order.finalAmount.toFixed(
																2,
															)}
														</span>
														{getOrderStatusBadge(
															order.status,
														)}
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
															setViewingOrder(
																order,
															);
															setIsViewDialogOpen(
																true,
															);
														}}>
														<Eye
															size={16}
															className='mr-2'
														/>
														View Details
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

				{/* View Order Dialog */}
				<Dialog
					open={isViewDialogOpen}
					onOpenChange={setIsViewDialogOpen}>
					<DialogContent className='max-w-2xl'>
						<DialogHeader>
							<DialogTitle>Order Details</DialogTitle>
						</DialogHeader>
						{viewingOrder && (
							<div className='space-y-6'>
								{/* Order Header */}
								<div className='flex items-center justify-between p-4 bg-slate-50 rounded-xl'>
									<div>
										<p className='text-sm text-slate-500'>
											Order ID
										</p>
										<p className='font-mono font-medium text-slate-900'>
											{viewingOrder.orderId}
										</p>
									</div>
									<div className='text-right'>
										<p className='text-sm text-slate-500'>
											Status
										</p>
										{getOrderStatusBadge(
											viewingOrder.status,
										)}
									</div>
								</div>

								{/* Product Details */}
								<div className='flex gap-4'>
									{viewingOrder.productSnapshot?.thumbnail ? (
										<img
											src={
												viewingOrder.productSnapshot
													.thumbnail
											}
											alt=''
											className='w-24 h-24 rounded-xl object-cover'
										/>
									) : (
										<div className='w-24 h-24 rounded-xl bg-slate-200 flex items-center justify-center'>
											<Package
												size={32}
												className='text-slate-400'
											/>
										</div>
									)}
									<div className='flex-1'>
										<h3 className='font-semibold text-slate-900 mb-1'>
											{viewingOrder.productSnapshot
												?.title || "N/A"}
										</h3>
										<div className='flex items-center gap-4'>
											<span className='text-lg font-bold text-slate-900'>
												{viewingOrder.currency}{" "}
												{viewingOrder.finalAmount.toFixed(
													2,
												)}
											</span>
										</div>
									</div>
								</div>

								{/* Payment Details */}
								<div className='border-t border-slate-200 pt-4'>
									<h4 className='font-medium text-slate-900 mb-3'>
										Payment Details
									</h4>
									<div className='space-y-2 text-sm'>
										<div className='flex justify-between'>
											<span className='text-slate-500'>
												Payment Status
											</span>
											{getPaymentStatusBadge(
												viewingOrder.paymentStatus,
											)}
										</div>
										{viewingOrder.paidAt && (
											<div className='flex justify-between'>
												<span className='text-slate-500'>
													Paid On
												</span>
												<span className='text-slate-900'>
													{formatDate(
														viewingOrder.paidAt,
													)}
												</span>
											</div>
										)}
									</div>
								</div>

								{/* Download Section */}
								{isDownloadAvailable(viewingOrder) && (
									<div className='border-t border-slate-200 pt-4'>
										<h4 className='font-medium text-slate-900 mb-3'>
											Download Product
										</h4>
										<div className='p-4 bg-emerald-50 rounded-xl'>
											<div className='flex items-center justify-between'>
												<div>
													<p className='text-sm text-emerald-700 mb-1'>
														Your product is ready
														for download
													</p>
													<p className='text-xs text-emerald-600'>
														Download expires on{" "}
														{formatDate(
															viewingOrder.downloadExpiry!,
														)}
													</p>
												</div>
												<Button
													className='bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600'
													onClick={() => {
														toast.success(
															"Download started!",
														);
													}}>
													<Download
														size={16}
														className='mr-2'
													/>
													Download
												</Button>
											</div>
										</div>
									</div>
								)}

								{/* Support */}
								<div className='border-t border-slate-200 pt-4'>
									<p className='text-sm text-slate-500'>
										Need help?{" "}
										<Link
											href='/contact'
											className='text-orange-600 hover:underline'>
											Contact Support
										</Link>
									</p>
								</div>
							</div>
						)}
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}
