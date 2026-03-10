"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
	DialogDescription,
} from "@/components/ui/dialog";
import {
	ShoppingCart,
	Search,
	Eye,
	Loader2,
	CheckCircle,
	XCircle,
	Clock,
	Package,
	Trash2,
	Edit3,
	RefreshCw,
	DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import AdminSidebar from "@/components/admin-sidebar";

interface Order {
	_id: string;
	orderId: string;
	user: {
		name: string;
		email: string;
	};
	product: {
		title: string;
		thumbnail?: string;
		slug: string;
	};
	productSnapshot: {
		title: string;
		price: number;
		comparePrice?: number;
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
		| "cancelled"
		| "processing";
	status: "pending" | "processing" | "completed" | "cancelled" | "refunded";
	deliveryStatus: "pending" | "delivered" | "failed";
	transactionId?: string;
	paymentMethod?: "upi" | "binance" | "card";
	createdAt: string;
	paidAt?: string;
	deliveredAt?: string;
	razorpay?: {
		orderId?: string;
		paymentId?: string;
	};
}

interface Stats {
	totalRevenue: number;
	totalOrders: number;
	completedOrders: number;
	processingOrders: number;
	failedOrders: number;
}

export default function AdminOrdersPage() {
	const [orders, setOrders] = useState<Order[]>([]);
	const [stats, setStats] = useState<Stats>({
		totalRevenue: 0,
		totalOrders: 0,
		completedOrders: 0,
		processingOrders: 0,
		failedOrders: 0,
	});
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedStatus, setSelectedStatus] = useState<string>("all");
	const [selectedPaymentStatus, setSelectedPaymentStatus] =
		useState<string>("all");
	const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
	const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
	const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [deleteLoading, setDeleteLoading] = useState(false);
	const [updatingOrder, setUpdatingOrder] = useState<Order | null>(null);
	const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
	const [newStatus, setNewStatus] = useState<string>("");
	const [updateLoading, setUpdateLoading] = useState(false);

	const fetchOrders = async () => {
		try {
			setLoading(true);
			const params = new URLSearchParams();
			if (selectedStatus !== "all")
				params.append("status", selectedStatus);
			if (selectedPaymentStatus !== "all")
				params.append("paymentStatus", selectedPaymentStatus);
			if (searchQuery) params.append("search", searchQuery);

			const response = await axios.get(
				`/api/admin/orders?${params.toString()}`,
			);
			const fetchedOrders = response.data.orders || [];

			// Calculate display prices for each order
			const ordersWithConvertedPrices = fetchedOrders.map(
				(order: Order) => ({
					...order,
					finalAmount: order.finalAmount,
					currency: order.currency,
				}),
			);
			setOrders(ordersWithConvertedPrices);

			// Calculate stats in user's currency
			const fetchedStats = response.data.stats || {
				totalRevenue: 0,
				totalOrders: 0,
				completedOrders: 0,
				processingOrders: 0,
				failedOrders: 0,
			};

			// Convert total revenue to user's currency
			const convertedStats = {
				...fetchedStats,
				totalRevenue: fetchedStats.totalRevenue, // Assuming original revenue is in INR
			};

			setStats(convertedStats);
		} catch (error) {
			toast.error("Failed to fetch orders");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchOrders();
	}, [selectedStatus, selectedPaymentStatus]);

	// Debounce search
	useEffect(() => {
		const timer = setTimeout(() => {
			fetchOrders();
		}, 500);
		return () => clearTimeout(timer);
	}, [searchQuery]);

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
			case "processing":
				return (
					<span className='flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium'>
						<DollarSign size={12} /> Processing
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

	const handleDeleteOrder = async () => {
		if (!deletingOrder) return;

		try {
			setDeleteLoading(true);
			await axios.delete(`/api/admin/orders/${deletingOrder._id}`);
			toast.success("Order deleted successfully");
			setIsDeleteDialogOpen(false);
			setDeletingOrder(null);
			fetchOrders();
		} catch (error) {
			toast.error("Failed to delete order");
		} finally {
			setDeleteLoading(false);
		}
	};

	const handleUpdateOrderStatus = async () => {
		if (!updatingOrder || !newStatus) return;

		try {
			setUpdateLoading(true);
			const response = await axios.patch(
				`/api/admin/orders/${updatingOrder._id}/status`,
				{
					status: newStatus,
				},
			);

			if (response.data.success) {
				toast.success("Order status updated successfully");
				setIsUpdateDialogOpen(false);
				setUpdatingOrder(null);
				setNewStatus("");
				fetchOrders();
			} else {
				toast.error(
					response.data.message || "Failed to update order status",
				);
			}
		} catch (error: any) {
			toast.error(
				error.response?.data?.message ||
					"Failed to update order status",
			);
		} finally {
			setUpdateLoading(false);
		}
	};

	return (
		<div className='flex min-h-[calc(100vh-85px)] bg-gradient-to-br from-slate-50 via-white to-slate-100'>
			<AdminSidebar />

			<main className='flex-1 md:ml-64 p-4 md:p-6 lg:p-8'>
				{/* Header */}
				<div className='mb-8 mt-5 md:mt-0'>
					<div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
						<div className='flex items-center gap-3'>
							<div className='w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/25'>
								<ShoppingCart
									size={24}
									className='text-white'
								/>
							</div>
							<div>
								<h1 className='text-2xl md:text-3xl font-bold text-slate-900'>
									Orders
								</h1>
								<p className='text-slate-500 text-sm'>
									Track and manage all customer orders
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Stats Cards */}
				<div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'>
					<Card className='bg-white border-slate-200 shadow-sm'>
						<CardContent className='p-4'>
							<div className='flex items-center gap-3'>
								<div className='w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center'>
									<DollarSign
										size={20}
										className='text-white'
									/>
								</div>
								<div>
									<p className='text-xs text-slate-500'>
										Total Revenue
									</p>
									<p className='text-xl font-bold text-slate-900'>
										${stats.totalRevenue.toFixed(2)}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className='bg-white border-slate-200 shadow-sm'>
						<CardContent className='p-4'>
							<div className='flex items-center gap-3'>
								<div className='w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center'>
									<Package size={20} className='text-white' />
								</div>
								<div>
									<p className='text-xs text-slate-500'>
										Total Orders
									</p>
									<p className='text-xl font-bold text-slate-900'>
										{stats.totalOrders}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className='bg-white border-slate-200 shadow-sm'>
						<CardContent className='p-4'>
							<div className='flex items-center gap-3'>
								<div className='w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center'>
									<CheckCircle
										size={20}
										className='text-white'
									/>
								</div>
								<div>
									<p className='text-xs text-slate-500'>
										Completed
									</p>
									<p className='text-xl font-bold text-slate-900'>
										{stats.completedOrders}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className='bg-white border-slate-200 shadow-sm'>
						<CardContent className='p-4'>
							<div className='flex items-center gap-3'>
								<div className='w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center'>
									<Clock size={20} className='text-white' />
								</div>
								<div>
									<p className='text-xs text-slate-500'>
										Processing
									</p>
									<p className='text-xl font-bold text-slate-900'>
										{stats.processingOrders}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Filters */}
				<div className='flex flex-col md:flex-row gap-4 mb-6'>
					<div className='relative flex-1'>
						<Search
							className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
							size={18}
						/>
						<Input
							placeholder='Search by order ID or product...'
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className='pl-10'
						/>
					</div>
					<Select
						value={selectedPaymentStatus}
						onValueChange={setSelectedPaymentStatus}>
						<SelectTrigger className='w-[180px]'>
							<SelectValue placeholder='Payment Status' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='all'>All Payments</SelectItem>
							<SelectItem value='completed'>Paid</SelectItem>
							<SelectItem value='pending'>Pending</SelectItem>
							<SelectItem value='failed'>Failed</SelectItem>
							<SelectItem value='refunded'>Refunded</SelectItem>
						</SelectContent>
					</Select>
					<Select
						value={selectedStatus}
						onValueChange={setSelectedStatus}>
						<SelectTrigger className='w-[150px]'>
							<SelectValue placeholder='Order Status' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='all'>All Status</SelectItem>
							<SelectItem value='completed'>Completed</SelectItem>
							<SelectItem value='pending'>Pending</SelectItem>
							<SelectItem value='processing'>
								Processing
							</SelectItem>
							<SelectItem value='cancelled'>Cancelled</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{/* Orders Table */}
				<Card className='bg-white border-slate-200 shadow-sm'>
					<CardHeader>
						<CardTitle className='text-lg'>Recent Orders</CardTitle>
					</CardHeader>
					<CardContent className='p-0'>
						{loading ? (
							<div className='flex items-center justify-center py-12'>
								<Loader2
									className='animate-spin text-orange-500'
									size={32}
								/>
							</div>
						) : orders.length === 0 ? (
							<div className='text-center py-12'>
								<ShoppingCart
									size={48}
									className='mx-auto mb-4 text-slate-300'
								/>
								<h3 className='text-lg font-semibold text-slate-900 mb-2'>
									No orders found
								</h3>
								<p className='text-slate-500'>
									Orders will appear here when customers make
									purchases
								</p>
							</div>
						) : (
							<div className='overflow-x-auto'>
								<table className='w-full'>
									<thead className='bg-slate-50 border-b border-slate-200'>
										<tr>
											<th className='text-left px-6 py-4 text-sm font-medium text-slate-600'>
												Order ID
											</th>
											<th className='text-left px-6 py-4 text-sm font-medium text-slate-600'>
												Customer
											</th>
											<th className='text-left px-6 py-4 text-sm font-medium text-slate-600'>
												Product
											</th>
											<th className='text-left px-6 py-4 text-sm font-medium text-slate-600'>
												Amount
											</th>
											<th className='text-left px-6 py-4 text-sm font-medium text-slate-600'>
												Payment
											</th>
											<th className='text-left px-6 py-4 text-sm font-medium text-slate-600'>
												Date
											</th>
											<th className='text-left px-6 py-4 text-sm font-medium text-slate-600'>
												Actions
											</th>
										</tr>
									</thead>
									<tbody className='divide-y divide-slate-100'>
										{orders.map((order) => (
											<tr
												key={order._id}
												className='hover:bg-slate-50'>
												<td className='px-6 py-4'>
													<span className='font-mono text-sm text-slate-900'>
														{order.orderId}
													</span>
												</td>
												<td className='px-6 py-4'>
													<div>
														<p className='font-medium text-slate-900'>
															{order.user?.name ||
																"N/A"}
														</p>
														<p className='text-sm text-slate-500'>
															{order.user
																?.email ||
																"N/A"}
														</p>
													</div>
												</td>
												<td className='px-6 py-4'>
													<div className='flex items-center gap-3'>
														{order.productSnapshot
															?.thumbnail ? (
															<img
																src={
																	order
																		.productSnapshot
																		.thumbnail
																}
																alt=''
																className='w-10 h-10 rounded-lg object-cover'
															/>
														) : (
															<div className='w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center'>
																<Package
																	size={16}
																	className='text-slate-400'
																/>
															</div>
														)}
														<span className='text-sm text-slate-900 line-clamp-1 max-w-[150px]'>
															{order
																.productSnapshot
																?.title ||
																"N/A"}
														</span>
													</div>
												</td>
												<td className='px-6 py-4'>
													<span className='font-medium text-slate-900'>
														{order.currency}{" "}
														{order.finalAmount.toFixed(
															2,
														)}
													</span>
												</td>
												<td className='px-6 py-4'>
													{getPaymentStatusBadge(
														order.paymentStatus,
													)}
												</td>
												<td className='px-6 py-4 text-sm text-slate-600'>
													{formatDate(
														order.createdAt,
													)}
												</td>
												<td className='px-6 py-4 flex items-center gap-2'>
													<Button
														size='sm'
														variant='ghost'
														onClick={() => {
															setViewingOrder(
																order,
															);
															setIsViewDialogOpen(
																true,
															);
														}}
														title='View Order'>
														<Eye
															size={16}
															className='text-slate-500'
														/>
													</Button>
													<Button
														size='sm'
														variant='ghost'
														onClick={() => {
															setUpdatingOrder(
																order,
															);
															setNewStatus(
																order.status,
															);
															setIsUpdateDialogOpen(
																true,
															);
														}}
														title='Update Status'>
														<Edit3
															size={16}
															className='text-blue-500'
														/>
													</Button>
													<Button
														size='sm'
														variant='ghost'
														onClick={() => {
															setDeletingOrder(
																order,
															);
															setIsDeleteDialogOpen(
																true,
															);
														}}
														title='Delete Order'>
														<Trash2
															size={16}
															className='text-red-500'
														/>
													</Button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</CardContent>
				</Card>

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
										{(viewingOrder.productSnapshot as any)
											?.category && (
											<p className='text-sm text-slate-500 mb-2'>
												Category:{" "}
												{
													(
														viewingOrder.productSnapshot as any
													).category
												}
											</p>
										)}
										<div className='flex items-center gap-4'>
											<span className='text-lg font-bold text-slate-900'>
												{viewingOrder.currency}{" "}
												{viewingOrder.finalAmount.toFixed(
													2,
												)}
											</span>
											{(
												viewingOrder.productSnapshot as any
											)?.comparePrice &&
												(
													viewingOrder.productSnapshot as any
												).comparePrice >
													((
														viewingOrder.productSnapshot as any
													)?.price || 0) && (
													<span className='text-sm text-slate-400 line-through'>
														{viewingOrder.currency}{" "}
														{
															(
																viewingOrder.productSnapshot as any
															).comparePrice
														}{" "}
													</span>
												)}
										</div>
									</div>
								</div>

								{/* Customer Details */}
								<div className='border-t border-slate-200 pt-4'>
									<h4 className='font-medium text-slate-900 mb-3'>
										Customer Details
									</h4>
									<div className='grid grid-cols-2 gap-4 text-sm'>
										<div>
											<p className='text-slate-500'>
												Name
											</p>
											<p className='font-medium text-slate-900'>
												{viewingOrder.user?.name ||
													"N/A"}
											</p>
										</div>
										<div>
											<p className='text-slate-500'>
												Email
											</p>
											<p className='font-medium text-slate-900'>
												{viewingOrder.user?.email ||
													"N/A"}
											</p>
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
										<div className='flex justify-between'>
											<span className='text-slate-500'>
												Transaction ID
											</span>
											<span className='font-mono text-slate-900'>
												{viewingOrder.transactionId ||
													"N/A"}
											</span>
										</div>
										<div className='flex justify-between'>
											<span className='text-slate-500'>
												Payment Method
											</span>
											<span className='font-mono text-slate-900 capitalize'>
												{viewingOrder.paymentMethod ||
													"N/A"}
											</span>
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

								{/* Order Timeline */}
								<div className='border-t border-slate-200 pt-4'>
									<h4 className='font-medium text-slate-900 mb-3'>
										Order Timeline
									</h4>
									<div className='space-y-2 text-sm'>
										<div className='flex justify-between'>
											<span className='text-slate-500'>
												Order Placed
											</span>
											<span className='text-slate-900'>
												{formatDate(
													viewingOrder.createdAt,
												)}
											</span>
										</div>
										{viewingOrder.deliveredAt && (
											<div className='flex justify-between'>
												<span className='text-slate-500'>
													Delivered
												</span>
												<span className='text-slate-900'>
													{formatDate(
														viewingOrder.deliveredAt,
													)}
												</span>
											</div>
										)}
									</div>
								</div>
							</div>
						)}
					</DialogContent>
				</Dialog>

				{/* Delete Order Confirmation Dialog */}
				<Dialog
					open={isDeleteDialogOpen}
					onOpenChange={setIsDeleteDialogOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Confirm Delete</DialogTitle>
							<DialogDescription>
								Are you sure you want to delete order{" "}
								<strong>{deletingOrder?.orderId}</strong>? This
								action cannot be undone.
							</DialogDescription>
						</DialogHeader>
						<div className='flex justify-end gap-3 pt-4'>
							<Button
								variant='outline'
								onClick={() => setIsDeleteDialogOpen(false)}
								disabled={deleteLoading}>
								Cancel
							</Button>
							<Button
								variant='destructive'
								onClick={handleDeleteOrder}
								disabled={deleteLoading}>
								{deleteLoading ? (
									<>
										<Loader2 className='mr-2 h-4 w-4 animate-spin' />
										Deleting...
									</>
								) : (
									"Delete"
								)}
							</Button>
						</div>
					</DialogContent>
				</Dialog>

				{/* Update Order Status Dialog */}
				<Dialog
					open={isUpdateDialogOpen}
					onOpenChange={setIsUpdateDialogOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Update Order Status</DialogTitle>
							<DialogDescription>
								Update the status for order{" "}
								<strong>{updatingOrder?.orderId}</strong>
							</DialogDescription>
						</DialogHeader>
						<div className='space-y-4 py-4'>
							<div>
								<label className='block text-sm font-medium text-slate-700 mb-2'>
									Current Status
								</label>
								<div className='p-3 bg-slate-50 rounded-lg'>
									{updatingOrder &&
										getOrderStatusBadge(
											updatingOrder.status,
										)}
								</div>
							</div>

							<div>
								<label className='block text-sm font-medium text-slate-700 mb-2'>
									New Status
								</label>
								<Select
									value={newStatus}
									onValueChange={setNewStatus}>
									<SelectTrigger>
										<SelectValue placeholder='Select new status' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='pending'>
											Pending
										</SelectItem>
										<SelectItem value='processing'>
											Processing
										</SelectItem>
										<SelectItem value='completed'>
											Completed
										</SelectItem>
										<SelectItem value='cancelled'>
											Cancelled
										</SelectItem>
										<SelectItem value='refunded'>
											Refunded
										</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className='flex justify-end gap-3 pt-4'>
								<Button
									variant='outline'
									onClick={() => setIsUpdateDialogOpen(false)}
									disabled={updateLoading}>
									Cancel
								</Button>
								<Button
									className='bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600'
									onClick={handleUpdateOrderStatus}
									disabled={
										updateLoading ||
										!newStatus ||
										newStatus === updatingOrder?.status
									}>
									{updateLoading ? (
										<>
											<Loader2 className='mr-2 h-4 w-4 animate-spin' />
											Updating...
										</>
									) : (
										<>
											<RefreshCw className='mr-2 h-4 w-4' />
											Update Status
										</>
									)}
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			</main>
		</div>
	);
}
