"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
	DialogTitle,
} from "@/components/ui/dialog";
import {
	ShoppingBag,
	Loader2,
	CheckCircle,
	Download,
	Package,
	LayoutGrid,
	ExternalLink,
	Shield,
} from "lucide-react";
import { toast } from "sonner";
import { orderService } from "@/services/orderService";
import { getDownloadUrl } from "@/app/actions/productActions";
import Link from "next/link";
import AdminSidebar from "@/components/admin-sidebar";
import InvoiceGenerator from "@/components/InvoiceGenerator";
import Image from "next/image";
import { userContext } from "@/context/userContext";

interface Order {
	_id: string;
	orderId: string;
	productSnapshot?: {
		title: string;
		price: number;
		thumbnail?: string;
		category?: string;
		currency: string;
	};
	items?: {
		product: { _id: string };
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
	createdAt: string;
	paidAt?: string;
	transactionId?: string;
	paymentMethod?: string;
	product?: string;
	user?: {
		name: string;
		email: string;
		_id: string;
	} | string;
}

export default function MyOrdersPage() {
    const { user } = userContext();
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedStatus, setSelectedStatus] = useState<string>("all");
	const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
	const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

	const fetchOrders = async () => {
		try {
			setLoading(true);
            if (!user) return;
            const allOrders = await orderService.getUserOrders(user._id);
            
            let filtered = allOrders;
            if (selectedStatus !== "all") {
                filtered = allOrders.filter(o => o.status === selectedStatus);
            }
            
			setOrders(filtered);
		} catch (error) {
			toast.error("Failed to fetch orders");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchOrders();
	}, [selectedStatus, user?._id]);

	const getStatusBadge = (status: string) => {
		const colors = {
			completed: "text-emerald-500",
			pending: "text-amber-500",
			failed: "text-rose-500",
			processing: "text-blue-500",
			cancelled: "text-slate-400",
		};
		const color = colors[status as keyof typeof colors] || colors.pending;
		return (
			<div className={`flex items-center gap-1.5 ${color}`}>
				<div className={`w-1.5 h-1.5 rounded-full bg-current mr-1`} />
				<span className="text-[10px] font-black uppercase tracking-widest">{status}</span>
			</div>
		);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			day: "numeric",
			month: "short",
			year: "numeric"
		}).toUpperCase();
	};

	const handleDownload = async (order: Order, productId: string) => {
		try {
            if (!user) return;
			const result = await getDownloadUrl(productId, user._id);
			if (result.success) {
				window.open(result.downloadUrl, "_blank");
				toast.success("Download started!");
			} else {
				toast.error(result.message || "Download not available");
			}
		} catch (error: any) {
			toast.error("Download failed");
		}
	};

	const getOrderItems = (order: Order) => {
		if (order.items && order.items.length > 0) return order.items;
		if (order.productSnapshot && order.product) return [{ snapshot: order.productSnapshot, quantity: 1, product: { _id: order.product } }];
		return [];
	};

	return (
		<div className='min-h-screen bg-white'>
			<AdminSidebar role='user' />
			<div className='md:ml-64 p-4 sm:p-10 lg:p-16'>
				
				{/* Integrated Header */}
				<div className='max-w-6xl mx-auto mb-4'>
					<div className='flex flex-col sm:flex-row sm:items-end justify-between gap-8 pb-8 border-b border-slate-100'>
						<div>
							<h1 className='text-4xl font-black text-slate-900 tracking-tighter mb-2'>Orders</h1>
							<p className='text-slate-400 font-bold text-xs uppercase tracking-[0.2em]'>Manage purchases and access items</p>
						</div>
						<div className="flex items-center gap-4">
							<Select value={selectedStatus} onValueChange={setSelectedStatus}>
								<SelectTrigger className='w-[180px] h-11 rounded-xl border border-slate-100 bg-slate-50/50 font-black text-[9px] tracking-[0.2em] px-4'>
									<SelectValue placeholder='FILTER STATUS' />
								</SelectTrigger>
								<SelectContent className="rounded-xl border-slate-100 shadow-2xl">
									<SelectItem value='all'>ALL TRANSACTIONS</SelectItem>
									<SelectItem value='completed'>COMPLETED</SelectItem>
									<SelectItem value='pending'>PENDING</SelectItem>
									<SelectItem value='processing'>PROCESSING</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</div>

				<div className="max-w-6xl mb-24 mx-auto">
					{loading ? (
						<div className='flex flex-col items-center justify-center py-32 gap-6'>
							<Loader2 className='animate-spin text-slate-900/10' size={48} />
							<p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Synching with registry...</p>
						</div>
					) : orders.length === 0 ? (
						<div className='py-32 text-center flex flex-col items-center border-2 border-dashed border-slate-50 rounded-[3rem]'>
							<div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 mb-6">
								<ShoppingBag size={32} />
							</div>
							<h3 className='text-xl font-black text-slate-900 tracking-tight mb-2'>No Orders Found</h3>
							<p className='text-slate-400 font-bold text-xs mb-8 uppercase tracking-widest'>Your purchase history is empty</p>
							<Link href='/shop'>
								<Button className='h-12 px-8 rounded-xl bg-slate-900 border-0 text-white font-black uppercase text-[10px] tracking-widest hover:scale-105 active:scale-95 transition-all'>Explore Shop</Button>
							</Link>
						</div>
					) : (
						<div className='space-y-4'>
							{/* Table Header Labels - Desktop only */}
							<div className="hidden lg:grid grid-cols-12 gap-6 px-10 py-3 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] border-b border-slate-50">
								<div className="col-span-1">Ref</div>
								<div className="col-span-5">Product Details</div>
								<div className="col-span-2 text-center">Date</div>
								<div className="col-span-2 text-center">Status</div>
								<div className="col-span-2 text-right">Total</div>
							</div>

							<div className="divide-y divide-slate-50">
								{orders.map((order) => {
									const items = getOrderItems(order);
									const isCompleted = order.paymentStatus === "completed";
									return (
										<div 
											key={order._id} 
											onClick={() => { setViewingOrder(order); setIsViewDialogOpen(true); }}
											className='group flex flex-col lg:grid lg:grid-cols-12 lg:items-center gap-6 px-4 py-8 lg:px-10 lg:py-6 bg-white hover:bg-slate-50/50 transition-all cursor-pointer border lg:border-0 rounded-3xl lg:rounded-none mb-4 lg:mb-0'
										>
											{/* Reference */}
											<div className="col-span-1">
												<span className="font-mono text-[10px] font-black text-slate-400 group-hover:text-slate-900 transition-colors uppercase">#{order.orderId.slice(-4)}</span>
											</div>

											{/* Product info */}
											<div className="col-span-5 flex items-center gap-5">
												<div className='relative w-12 h-12 flex-shrink-0 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 flex items-center justify-center'>
													{items[0]?.snapshot?.thumbnail ? (
														<Image src={items[0].snapshot.thumbnail} alt="" fill className='object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all' />
													) : <Package size={20} className="text-slate-200" />}
													{items.length > 1 && (
														<div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center text-[10px] font-black text-white">+{items.length-1}</div>
													)}
												</div>
												<div className="min-w-0">
													<p className='text-[13px] font-black text-slate-900 truncate leading-none mb-1'>{items.length > 1 ? `${items[0].snapshot.title} & Bundle` : items[0]?.snapshot?.title}</p>
													<p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>{items[0]?.snapshot?.category || "DIGITAL ASSET"}</p>
												</div>
											</div>

											{/* Date */}
											<div className="col-span-2 lg:text-center">
												<p className='text-[10px] font-black text-slate-900 uppercase tracking-widest'>{formatDate(order.createdAt)}</p>
											</div>

											{/* Status */}
											<div className="col-span-2 flex lg:justify-center">
												{getStatusBadge(order.paymentStatus)}
											</div>

											{/* Total */}
											<div className="col-span-2 text-right">
												<div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-4">
													<p className='text-base font-black text-slate-900'>{order.currency} {order.finalAmount.toLocaleString()}</p>
													<div className="lg:hidden">
														<LayoutGrid size={16} className="text-slate-300 transform group-hover:rotate-90 transition-transform" />
													</div>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					)}
				</div>

				{/* Refined Modular Detail Modal */}
				<Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
					<DialogContent className='max-w-2xl rounded-[2rem] p-0 border-0 shadow-2xl overflow-hidden bg-white'>
						{viewingOrder && (
							<div className="flex flex-col h-full max-h-[90vh]">
								{/* Sticky Modal Header */}
								<div className="p-4 md:p-8 pb-2 border-b border-slate-50 flex items-center justify-between">
									<div className="flex items-center gap-4">
										<div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
											<CheckCircle size={20} />
										</div>
										<div>
											<DialogTitle className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">Receipt Details</DialogTitle>
											<p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Verify and access purchases</p>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<InvoiceGenerator order={viewingOrder as any} variant="icon" />
									</div>
								</div>

								{/* Scrollable Content */}
								<div className="p-4 md:p-8 space-y-10 overflow-y-auto no-scrollbar pb-12">
									{/* Info Strip */}
									<div className="grid grid-cols-2 sm:grid-cols-4 gap-6 p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
										<div className="space-y-1">
											<p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">REF ID</p>
											<p className="font-mono text-[10px] font-black text-slate-900 uppercase">#{viewingOrder.orderId}</p>
										</div>
										<div className="space-y-1">
											<p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">DATE</p>
											<p className="text-[10px] font-black text-slate-900 uppercase">{new Date(viewingOrder.createdAt).toLocaleDateString()}</p>
										</div>
										<div className="space-y-1">
											<p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">GATEWAY</p>
											<p className="text-[10px] font-black text-slate-900 uppercase">{viewingOrder.paymentMethod || "SECURE"}</p>
										</div>
										<div className="space-y-1">
											<p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">STATUS</p>
											<div className="flex">{getStatusBadge(viewingOrder.paymentStatus)}</div>
										</div>
									</div>

									{/* Item Breakdown */}
									<div className="space-y-2">
										<div className="flex items-center justify-between px-2">
											<p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Digital Licenses</p>
											<p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{getOrderItems(viewingOrder).length} POSITIONS</p>
										</div>
										<div className="space-y-2">
											{getOrderItems(viewingOrder).map((item, idx) => (
												<div key={idx} className="group bg-white p-5 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-center gap-6 transition-all hover:bg-slate-50/30">
													<div className="w-14 h-14 rounded-xl bg-slate-50 flex-shrink-0 relative overflow-hidden">
														{item.snapshot.thumbnail ? (
															<Image fill src={item.snapshot.thumbnail} alt="" className="object-cover group-hover:scale-110 transition-transform duration-500" />
														) : <Package size={20} className="text-slate-200" />}
													</div>
													<div className="flex-1 text-center sm:text-left">
														<p className="text-[9px] font-black text-slate-300 tracking-widest uppercase mb-0.5">{item.snapshot.category || "ASSET"}</p>
														<h4 className="text-[15px] font-black text-slate-900 leading-tight mb-1">{item.snapshot.title}</h4>
														<p className="text-[10px] font-bold text-slate-400 italic">Universal Digital Rights Verified</p>
													</div>
													{viewingOrder.paymentStatus === "completed" && viewingOrder.status === "completed" ? (
														<Button 
															size="sm" 
															className="h-10 px-6 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-[10px] tracking-widest gap-2 shadow-sm"
															onClick={() => handleDownload(viewingOrder, item.product._id)}
														>
															<Download size={12} /> Download
														</Button>
													) : (
														<div className="px-4 py-2 rounded-lg bg-slate-50 border border-slate-100 text-[9px] font-black text-slate-300 uppercase tracking-widest">
															Locked until verified
														</div>
													)}
												</div>
											))}
										</div>
									</div>

									{/* Total Financial Block */}
									<div className="bg-slate-900 rounded-[2rem] m-0 p-4 md:p-10 text-white relative overflow-hidden shadow-2xl">
										<div className="absolute top-0 right-0 p-8 opacity-5 scale-150 rotate-12"><Shield size={100} /></div>
										<div className="flex flex-col sm:flex-row justify-between items-end gap-6 relative z-10">
											<div>
												<p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-2">Funds Remitted</p>
												<p className="text-5xl font-black tracking-tighter">
													<span className="text-base font-medium text-white/30 mr-2">{viewingOrder.currency}</span>
													{viewingOrder.finalAmount.toLocaleString()}
												</p>
											</div>
											<div className="flex flex-col items-center sm:items-end gap-3 w-full sm:w-auto">
												<div className="bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">SETTLED</div>
												<p className="text-[9px] font-mono text-white/20 uppercase tracking-tighter break-all">TXID: {viewingOrder.transactionId || "INTERNAL_LEDGER"}</p>
											</div>
										</div>
									</div>

									{/* Support Link */}
									<div className="text-center pt-4">
										<Link href="https://wa.me/919999999999" target="_blank" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors uppercase font-black text-[10px] tracking-widest">
											Dispute or Support Issue? <ExternalLink size={12} />
										</Link>
									</div>
								</div>
							</div>
						)}
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}
