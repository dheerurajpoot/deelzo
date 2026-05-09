"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
	ShoppingCart,
	Search,
	Eye,
	Loader2,
	CheckCircle,
	Clock,
	Package,
	DollarSign,
	CreditCard,
	Zap,
	Wallet,
	Edit3,
	Trash2,
	User,
} from "lucide-react";
import { toast } from "sonner";
import { orderService } from "@/services/orderService";
import AdminSidebar from "@/components/admin-sidebar";
import InvoiceGenerator from "@/components/InvoiceGenerator";
import Image from "next/image";

interface Order {
	_id: string;
	orderId: string;
	user: {
		name: string;
		email: string;
	};
	productSnapshot?: {
		title: string;
		price: number;
		thumbnail?: string;
		category?: string;
		currency: string;
	};
	items?: {
		product: string;
		snapshot: {
			title: string;
			price: number;
			thumbnail?: string;
			category?: string;
			currency: string;
		};
		quantity: number;
	}[];
	amount: number;
	discountApplied?: number;
	finalAmount: number;
	currency: string;
	paymentStatus: string;
	status: string;
	transactionId?: string;
	paymentMethod?: string;
	createdAt: string;
}

interface Stats {
	totalRevenue: number;
	totalOrders: number;
	completedOrders: number;
	pendingOrders: number;
	failedOrders: number;
}

export default function AdminOrdersPage() {
	const [orders, setOrders] = useState<Order[]>([]);
	const [stats, setStats] = useState<Stats>({
		totalRevenue: 0,
		totalOrders: 0,
		completedOrders: 0,
		pendingOrders: 0,
		failedOrders: 0,
	});
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedStatus, setSelectedStatus] = useState<string>("all");
	const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>("all");
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
            const allOrders = await orderService.getAllOrders();
            
            // 1. Filter
            let filtered = allOrders;
            if (selectedStatus !== "all") {
                filtered = filtered.filter(o => o.status === selectedStatus);
            }
            if (selectedPaymentStatus !== "all") {
                filtered = filtered.filter(o => o.paymentStatus === selectedPaymentStatus);
            }
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                filtered = filtered.filter(o => 
                    o.orderId?.toLowerCase().includes(q) || 
                    o.user?.name?.toLowerCase().includes(q) || 
                    o.user?.email?.toLowerCase().includes(q)
                );
            }

            // 2. Stats
            const stats: Stats = {
                totalRevenue: allOrders.reduce((acc, o) => acc + (o.paymentStatus === 'completed' ? o.finalAmount : 0), 0),
                totalOrders: allOrders.length,
                completedOrders: allOrders.filter(o => o.status === 'completed').length,
                pendingOrders: allOrders.filter(o => o.status === 'pending').length,
                failedOrders: allOrders.filter(o => o.status === 'failed').length,
            };

			setOrders(filtered);
			setStats(stats);
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
		const timer = setTimeout(() => fetchOrders(), 500);
		return () => clearTimeout(timer);
	}, [searchQuery]);

	const getPaymentMethodIcon = (method?: string) => {
		switch (method?.toLowerCase()) {
			case "binance": return <Wallet size={14} className='text-amber-500' />;
			case "payu": return <Zap size={14} className='text-emerald-500' />;
			default: return <CreditCard size={14} className='text-slate-400' />;
		}
	};

	const getStatusBadge = (status: string, type: "payment" | "order") => {
		const styles = {
			completed: "bg-emerald-50 text-emerald-700 border-emerald-100",
			pending: "bg-amber-50 text-amber-700 border-amber-100",
			failed: "bg-rose-50 text-rose-700 border-rose-100",
			processing: "bg-blue-50 text-blue-700 border-blue-100",
			cancelled: "bg-slate-50 text-slate-700 border-slate-100",
		};
		const style = styles[status as keyof typeof styles] || styles.pending;
		return (
			<span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${style}`}>
				{status}
			</span>
		);
	};

	const handleDeleteOrder = async () => {
		if (!deletingOrder) return;
		try {
			setDeleteLoading(true);
            const { ref, remove } = await import("firebase/database");
            const { db } = await import("@/lib/firebase");
            await remove(ref(db, `orders/${deletingOrder._id}`));
			toast.success("Order purged successfully");
			setIsDeleteDialogOpen(false);
			fetchOrders();
		} catch (error) {
			toast.error("Purge failed");
		} finally {
			setDeleteLoading(false);
		}
	};

	const handleUpdateStatus = async () => {
		if (!updatingOrder || !newStatus) return;
		try {
			setUpdateLoading(true);
            await orderService.updateOrder(updatingOrder._id, { status: newStatus });
			toast.success("Status updated");
			setIsUpdateDialogOpen(false);
			fetchOrders();
		} catch (error) {
			toast.error("Update failed");
		} finally {
			setUpdateLoading(false);
		}
	};

	// Helper to get item list for display
	const getOrderItems = (order: Order) => {
		if (order.items && order.items.length > 0) return order.items;
		if (order.productSnapshot) return [{ snapshot: order.productSnapshot, quantity: 1, product: "" }];
		return [];
	};

	return (
		<div className='flex min-h-screen bg-[#F8FAFC]'>
			<AdminSidebar />
			<main className='flex-1 md:ml-64 p-4 md:p-8 lg:p-12'>
				<div className='mb-12'>
					<div className='flex items-center gap-4 mb-2'>
						<div className='w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xl shadow-slate-900/20'>
							<ShoppingCart size={24} />
						</div>
						<div>
							<h1 className='text-3xl font-black text-slate-900 tracking-tight'>Sales Registry</h1>
							<p className='text-slate-400 font-bold text-xs uppercase tracking-[0.2em]'>Administrative Oversight</p>
						</div>
					</div>
				</div>

				{/* Global Metrics */}
				<div className='grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10'>
					{[
						{ label: "Gross Revenue", val: `₹${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "bg-emerald-500" },
						{ label: "Volume", val: stats.totalOrders, icon: Package, color: "bg-slate-900" },
						{ label: "Fulfilled", val: stats.completedOrders, icon: CheckCircle, color: "bg-blue-500" },
						{ label: "Pending", val: stats.pendingOrders, icon: Clock, color: "bg-amber-500" },
					].map((m, i) => (
						<Card key={i} className="border-0 shadow-sm rounded-3xl overflow-hidden">
							<CardContent className="p-6">
								<div className="flex items-center gap-4">
									<div className={`w-10 h-10 rounded-xl ${m.color} text-white flex items-center justify-center shadow-lg shadow-black/5`}>
										<m.icon size={20} />
									</div>
									<div>
										<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{m.label}</p>
										<p className="text-xl font-black text-slate-900">{m.val}</p>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				{/* Filters */}
				<div className='flex flex-col md:flex-row gap-4 mb-8 bg-white p-4 rounded-3xl border border-slate-200/60 shadow-sm'>
					<div className='relative flex-1'>
						<Search className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400' size={18} />
						<Input
							placeholder='SEARCH ORDER IDENTITY OR CUSTOMER...'
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className='pl-12 h-14 rounded-2xl bg-slate-50 border-0 focus-visible:ring-slate-900 font-bold text-xs tracking-widest'
						/>
					</div>
					<Select value={selectedStatus} onValueChange={setSelectedStatus}>
						<SelectTrigger className='w-full md:w-[200px] h-14 rounded-2xl border-0 bg-slate-50 font-bold text-xs tracking-widest'>
							<SelectValue placeholder='ORDER STATUS' />
						</SelectTrigger>
						<SelectContent className="rounded-2xl border-0 shadow-2xl">
							<SelectItem value='all'>ALL STATUS</SelectItem>
							<SelectItem value='completed'>COMPLETED</SelectItem>
							<SelectItem value='pending'>PENDING</SelectItem>
							<SelectItem value='processing'>PROCESSING</SelectItem>
							<SelectItem value='cancelled'>CANCELLED</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{/* Orders Table */}
				<Card className='border-0 shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white'>
					<CardContent className='p-0'>
						{loading ? (
							<div className='flex flex-col items-center justify-center py-32 gap-4'>
								<Loader2 className='animate-spin text-slate-900' size={40} />
								<p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Hydrating Sales Data...</p>
							</div>
						) : (
							<div className='overflow-x-auto'>
								<table className='w-full'>
									<thead className='bg-slate-50/50 border-b border-slate-100'>
										<tr>
											<th className='text-left px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest'>Reference</th>
											<th className='text-left px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest'>Merchant Item(s)</th>
											<th className='text-left px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest'>Client Access</th>
											<th className='text-left px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest'>Financials</th>
											<th className='text-right px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest'>Actions</th>
										</tr>
									</thead>
									<tbody className='divide-y divide-slate-50'>
										{orders.map((order) => {
											const items = getOrderItems(order);
											return (
												<tr key={order._id} className='group hover:bg-slate-50/50 transition-colors'>
													<td className='px-8 py-6'>
														<div className="space-y-1">
															<p className='font-mono text-xs font-black text-slate-900'>#{order.orderId}</p>
															<div className="flex gap-2">{getStatusBadge(order.status, "order")}</div>
														</div>
													</td>
													<td className='px-8 py-6'>
														<div className='flex items-center gap-4'>
															<div className='w-12 h-12 rounded-md bg-slate-50 border border-slate-100 flex-shrink-0 overflow-hidden relative'>
																{items[0]?.snapshot?.thumbnail ? (
																	<Image fill src={items[0].snapshot.thumbnail} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" alt={items[0].snapshot.title} className="object-cover" />
																) : (
																	<div className="w-full h-full flex items-center justify-center text-slate-200"><Package size={20} /></div>
																)}
															</div>
															<div className="min-w-0">
																<p className='text-xs font-black text-slate-900 truncate max-w-[150px]'>{items[0]?.snapshot?.title || "N/A"}</p>
																<p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
																	{items.length > 1 ? `+ ${items.length - 1} MORE ITEMS` : "SINGLE TRANSACTION"}
																</p>
															</div>
														</div>
													</td>
													<td className='px-8 py-6'>
														<div className="space-y-0.5">
															<p className='text-xs font-black text-slate-900 uppercase tracking-tight'>{order.user?.name || "Anonymous"}</p>
															<p className='text-[10px] font-bold text-slate-400'>{order.user?.email || "No Email"}</p>
														</div>
													</td>
													<td className='px-8 py-6'>
														<div className='space-y-1'>
															<p className='text-sm font-black text-slate-900'>
																{order.currency === 'USD' ? '$' : '₹'}{order.finalAmount.toLocaleString()}
															</p>
															<div className="flex items-center gap-2">
																{getPaymentMethodIcon(order.paymentMethod)}
																<p className='text-[10px] font-bold text-slate-400 uppercase'>{order.paymentStatus}</p>
															</div>
														</div>
													</td>
													<td className='px-8 py-6 text-right'>
														<div className='flex items-center justify-end gap-2'>
															<InvoiceGenerator order={order as any} variant="icon" />
															<Button size='icon' variant='ghost' onClick={() => { setViewingOrder(order); setIsViewDialogOpen(true); }} className="hover:bg-slate-100 rounded-xl">
																<Eye size={18} className="text-slate-400" />
															</Button>
															<Button size='icon' variant='ghost' onClick={() => { setUpdatingOrder(order); setNewStatus(order.status); setIsUpdateDialogOpen(true); }} className="hover:bg-blue-50 hover:text-blue-600 rounded-xl">
																<Edit3 size={18} />
															</Button>
															<Button size='icon' variant='ghost' onClick={() => { setDeletingOrder(order); setIsDeleteDialogOpen(true); }} className="hover:bg-rose-50 hover:text-rose-600 rounded-xl">
																<Trash2 size={18} />
															</Button>
														</div>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Viewing Dialog */}
				<Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
					<DialogContent className='max-w-2xl rounded-[2rem] p-0 border-0 shadow-2xl overflow-hidden bg-white'>
						<DialogHeader className="p-10 pb-4 flex flex-row items-center justify-between border-b border-slate-50">
							<div className="flex items-center gap-4">
								<div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
									<Package size={24} />
								</div>
								<div>
									<DialogTitle className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">Order Particulars</DialogTitle>
									<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Official Transaction Record</p>
								</div>
							</div>
							{viewingOrder && <InvoiceGenerator order={viewingOrder as any} />}
						</DialogHeader>

						{viewingOrder && (
							<div className='p-10 space-y-8'>
								<div className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100">
									<div>
										<p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Order Reference</p>
										<p className="font-mono text-xs font-black text-slate-900">#{viewingOrder.orderId}</p>
									</div>
									<div>
										<p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
										<div className="flex">{getStatusBadge(viewingOrder.status, "order")}</div>
									</div>
									<div>
										<p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Payment</p>
										<div className="flex">{getStatusBadge(viewingOrder.paymentStatus, "payment")}</div>
									</div>
									<div>
										<p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Placement Date</p>
										<p className="text-xs font-black text-slate-900 uppercase">{new Date(viewingOrder.createdAt).toLocaleDateString()}</p>
									</div>
								</div>

								<div className="space-y-4">
									<p className="text-[10px] font-black text-slate-900 uppercase tracking-widest px-2">Itemized Breakdown</p>
									<div className="bg-white border border-slate-200/60 rounded-[2rem] overflow-hidden">
										<div className="divide-y divide-slate-50">
											{getOrderItems(viewingOrder).map((item, idx) => (
												<div key={idx} className="flex items-center gap-6 p-6 group transition-colors hover:bg-slate-50/50">
													<div className="w-16 h-16 rounded-md bg-slate-50 flex-shrink-0 overflow-hidden border border-slate-100 relative">
														{item.snapshot.thumbnail ? (
															<Image fill src={item.snapshot.thumbnail} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" alt={item.snapshot.title} className="object-cover group-hover:scale-110 transition-transform duration-500" />
														) : <div className="w-full h-full flex items-center justify-center text-slate-200"><ShoppingCart size={24} /></div>}
													</div>
													<div className="flex-1">
														<p className="text-[9px] font-black text-sky-500 tracking-widest uppercase mb-0.5">{item.snapshot.category || "General"}</p>
														<p className="text-base font-black text-slate-900 leading-tight">{item.snapshot.title}</p>
														<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Quantity: {item.quantity}</p>
													</div>
													<div className="text-right">
														<p className="text-lg font-black text-slate-900">{item.snapshot.currency} {item.snapshot.price.toLocaleString()}</p>
													</div>
												</div>
											))}
										</div>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-8 border-t border-slate-100 pt-8">
									<div>
										<p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4">Customer Intelligence</p>
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
												<User size={20} />
											</div>
											<div>
												<p className="text-sm font-black text-slate-900 leading-none mb-1">{viewingOrder.user?.name || "Anonymous Client"}</p>
												<p className="text-[11px] font-bold text-slate-400">{viewingOrder.user?.email}</p>
											</div>
										</div>
									</div>
									<div className="text-right flex flex-col items-end">
										<p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4">Transaction Hub</p>
										<p className="text-xs font-black text-slate-900 uppercase">{viewingOrder.paymentMethod || "Internal Wallet"}</p>
										<p className="text-[10px] font-mono font-bold text-slate-400 mt-1 break-all uppercase tracking-tighter">TxID: {viewingOrder.transactionId || "INTERNAL_CREDIT"}</p>
									</div>
								</div>

								<div className="border-t border-slate-100 pt-8">
									<div className="flex justify-between items-end bg-slate-900 rounded-[2rem] p-8 text-white">
										<div>
											<p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Total Funds Transferred</p>
											<p className="text-4xl font-black tracking-tighter">
												<span className="text-base font-medium text-white/30 mr-2">{viewingOrder.currency}</span>
												{viewingOrder.finalAmount.toLocaleString()}
											</p>
										</div>
										<div className="bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/30">
											SETTLED
										</div>
									</div>
								</div>
							</div>
						)}
					</DialogContent>
				</Dialog>

				{/* Update Status Dialog */}
				<Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
					<DialogContent className="max-w-sm rounded-[2rem] p-8">
						<DialogHeader>
							<DialogTitle className="text-xl font-black text-slate-900 tracking-tight">Modify Entitlement</DialogTitle>
						</DialogHeader>
						<div className="space-y-6 pt-4">
							<Select value={newStatus} onValueChange={setNewStatus}>
								<SelectTrigger className="h-14 rounded-2xl border-0 bg-slate-50 font-black text-xs tracking-widest">
									<SelectValue placeholder="SET NEW STATUS" />
								</SelectTrigger>
								<SelectContent className="rounded-2xl border-0 shadow-2xl">
									<SelectItem value='pending'>PENDING</SelectItem>
									<SelectItem value='processing'>PROCESSING</SelectItem>
									<SelectItem value='completed'>COMPLETED</SelectItem>
									<SelectItem value='cancelled'>CANCELLED</SelectItem>
									<SelectItem value='refunded'>REFUNDED</SelectItem>
								</SelectContent>
							</Select>
							<Button onClick={handleUpdateStatus} disabled={updateLoading || !newStatus} className="w-full py-8 rounded-[1.5rem] bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest">
								{updateLoading ? <Loader2 className="animate-spin" /> : "Commit Changes"}
							</Button>
						</div>
					</DialogContent>
				</Dialog>

				{/* Delete Confirmation Dialog */}
				<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
					<DialogContent className="max-w-sm rounded-[2rem] p-8">
						<DialogHeader>
							<DialogTitle className="text-xl font-black text-slate-900 tracking-tight">Purge Record?</DialogTitle>
							<p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-relaxed pt-2">Warning: This action will permanently delete the transaction identity. This process is irreversible.</p>
						</DialogHeader>
						<div className="flex gap-4 pt-6">
							<Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)} className="flex-1 py-6 rounded-2xl font-black uppercase text-[10px] tracking-widest">Cancel</Button>
							<Button variant="destructive" onClick={handleDeleteOrder} disabled={deleteLoading} className="flex-1 py-6 rounded-2xl bg-rose-600 hover:bg-rose-700 font-black uppercase text-[10px] tracking-widest text-white">
								{deleteLoading ? <Loader2 className="animate-spin" /> : "PROCEED"}
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			</main>
		</div>
	);
}
