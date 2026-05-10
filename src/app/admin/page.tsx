"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	CheckCircle,
	XCircle,
	Clock,
	Users,
	TrendingUp,
	AlertCircle,
	DollarSign,
	BarChart3,
	ArrowUpRight,
	Shield,
	Zap,
	Activity,
	Package,
	Newspaper,
	ExternalLink,
	RefreshCw,
	ArrowRight,
	Edit3,
} from "lucide-react";
import AdminSidebar from "@/components/admin-sidebar";
import { listingService } from "@/services/listingService";
import { userService } from "@/services/userService";
import { blogService } from "@/services/blogService";
import { orderService } from "@/services/orderService";
import { productService } from "@/services/productService";
import { userContext } from "@/context/userContext";
import { convertPrice } from "@/lib/currencyUtils";
import { toast } from "sonner";
import Link from "next/link";

interface Listing {
	_id: string;
	title: string;
	description: string;
	price: number;
	status: "pending" | "active" | "rejected";
	category: string;
	seller?: { name: string };
	createdAt: string;
	slug?: string;
	thumbnail?: string;
	metrics?: {
		monthlyRevenue?: number;
		monthlyTraffic?: number;
		followers?: number;
		age?: number;
	};
}

interface Order {
	_id: string;
	orderId: string;
	finalAmount: number;
	currency: string;
	paymentStatus: string;
	status: string;
	createdAt: string;
	user?: { name: string; email: string };
	productSnapshot?: { title: string };
}

interface Blog {
	_id: string;
	title: string;
	excerpt: string;
	status: "draft" | "published" | "pending";
	author?: { name: string };
	createdAt: string;
	slug?: string;
}

export default function AdminPanel() {
	const { user } = userContext();
	const [listings, setListings] = useState<Listing[]>([]);
	const [stats, setStats] = useState({
		totalListings: 0,
		totalUsers: 0,
		pendingListings: 0,
		activeListings: 0,
		rejectedListings: 0,
		totalRevenue: 0,
		totalBlogs: 0,
		pendingBlogs: 0,
		totalProducts: 0,
		draftProducts: 0,
		orderStats: {
			pending: 0,
			processing: 0,
			completed: 0,
			cancelled: 0
		},
		totalMarketplaceValue: 0,
		verifiedUsers: 0,
	});
	const [recentOrders, setRecentOrders] = useState<Order[]>([]);

	const fetchData = async () => {
		try {
			if (!user) return;
			// Fetch all necessary data in parallel using services
			const [allListings, allUsers, allBlogs, allOrders, allProducts] = await Promise.all([
				listingService.getListings({ limit: 500 }),
				userService.getAllUsers(),
				blogService.getBlogs(),
				orderService.getAllOrders(),
				productService.getProducts({ limit: 500 })
			]);

            // Calculate Stats manually (Clean & Simple)
            const activeListings = allListings.listings.filter(l => l.status === 'active');
            const pendingListings = allListings.listings.filter(l => l.status === 'pending');
            const rejectedListings = allListings.listings.filter(l => l.status === 'rejected');
            const verifiedUsers = allUsers.filter(u => u.verified);
            const totalRevenue = allOrders.reduce((acc, o) => {
                if (o.paymentStatus !== 'completed') return acc;
                return acc + convertPrice(o.finalAmount, o.currency || 'INR', 'INR');
            }, 0);
            const totalMarketplaceValue = allListings.listings.reduce((acc, l) => acc + (l.price || 0), 0);

			setListings(allListings.listings.slice(0, 10));
			setRecentOrders(allOrders.slice(0, 5));

			setStats({
				totalListings: allListings.listings.length,
				totalUsers: allUsers.length,
				pendingListings: pendingListings.length,
				activeListings: activeListings.length,
				rejectedListings: rejectedListings.length,
				totalRevenue: totalRevenue,
				totalBlogs: allBlogs.length,
				pendingBlogs: allBlogs.filter((b: any) => b.status === "draft" || b.status === "pending").length,
				totalProducts: allProducts.total,
				draftProducts: allProducts.products.filter((p: any) => p.status === 'draft').length,
				orderStats: {
					pending: allOrders.filter(o => o.status === 'pending').length,
					processing: allOrders.filter(o => o.status === 'processing').length,
					completed: allOrders.filter(o => o.status === 'completed').length,
					cancelled: allOrders.filter(o => o.status === 'cancelled').length
				},
				totalMarketplaceValue: totalMarketplaceValue,
				verifiedUsers: verifiedUsers.length,
			});
		} catch (error) {
			console.error("Failed to fetch dashboard data:", error);
			toast.error("Error loading dashboard metrics");
		}
	};
	useEffect(() => {
		fetchData();
	}, [user]);

	const getListingStatusBadge = (status: string) => {
		const statusConfig = {
			pending: {
				bg: "bg-amber-100 text-amber-700 border-amber-200",
				icon: Clock,
				iconColor: "text-amber-600",
			},
			active: {
				bg: "bg-emerald-100 text-emerald-700 border-emerald-200",
				icon: CheckCircle,
				iconColor: "text-emerald-600",
			},
			rejected: {
				bg: "bg-rose-100 text-rose-700 border-rose-200",
				icon: XCircle,
				iconColor: "text-rose-600",
			},
		};
		return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
	};

	// Items for UI
	const pendingItemsCount = stats.pendingListings + stats.pendingBlogs;

	return (
		<div className='flex min-h-[calc(100vh-85px)] bg-linear-to-br from-slate-50 via-white to-slate-100'>
			<AdminSidebar />

			{/* Main Content */}
			<main className='flex-1 md:ml-64 p-4 md:p-6 lg:p-8'>
				{/* Header */}
				<div className='mb-10'>
					<div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
						<div className='flex items-center gap-4'>
							<div className='w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-500/20'>
								<Shield size={28} className='text-white' />
							</div>
							<div>
								<h1 className='text-3xl font-black text-slate-900 tracking-tight'>Admin Dashboard</h1>
								<div className='flex items-center gap-2 mt-1'>
									<span className='w-2 h-2 bg-emerald-500 rounded-full animate-pulse' />
									<p className='text-slate-500 text-sm font-medium'>Platform status: Operational</p>
								</div>
							</div>
						</div>
						<div className='flex items-center gap-2 bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/50 shadow-sm'>
							<Button variant='ghost' size='sm' onClick={fetchData} className='rounded-xl gap-2 font-bold text-slate-600 hover:text-indigo-600'>
								<RefreshCw size={16} /> Sync Data
							</Button>
							<div className='h-4 w-[1px] bg-slate-200 mx-1' />
							<Link href='/'>
								<Button size='sm' className='bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-bold gap-2'>
									Live Site <ExternalLink size={14} />
								</Button>
							</Link>
						</div>
					</div>
				</div>

				{/* Stats Grid - Row 1 */}
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
					<Card className='bg-slate-900 border-slate-800 shadow-2xl overflow-hidden group relative'>
						<div className='absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-700'>
							<DollarSign size={80} className='text-white' />
						</div>
						<CardContent className='p-6 relative z-10'>
							<p className='text-indigo-300 text-[10px] font-black uppercase tracking-widest mb-2'>Total Revenue</p>
							<h3 className='text-3xl font-black text-white tracking-tight'>₹{stats.totalRevenue.toLocaleString()}</h3>
							<div className='flex items-center gap-1.5 mt-2 text-emerald-400 font-bold text-[10px]'>
								<ArrowUpRight size={12} />
								<span>+12% this month</span>
							</div>
						</CardContent>
					</Card>

					<Card className='bg-white border-slate-200 shadow-xl overflow-hidden relative group'>
						<div className='absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-700'>
							<Users size={80} className='text-slate-900' />
						</div>
						<CardContent className='p-6 relative z-10'>
							<p className='text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2'>Total Users</p>
							<h3 className='text-3xl font-black text-slate-900 tracking-tight'>{stats.totalUsers}</h3>
							<div className='flex items-center gap-1.5 mt-2 text-blue-500 font-bold text-[10px]'>
								<Activity size={12} />
								<span>Verified Members</span>
							</div>
						</CardContent>
					</Card>

					<Card className='bg-white border-slate-200 shadow-xl overflow-hidden relative group'>
						<div className='absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-700'>
							<Package size={80} className='text-slate-900' />
						</div>
						<CardContent className='p-6 relative z-10'>
							<p className='text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2'>Listings</p>
							<h3 className='text-3xl font-black text-slate-900 tracking-tight'>{stats.totalListings}</h3>
							<div className='flex items-center gap-1.5 mt-2 text-amber-500 font-bold text-[10px]'>
								<Clock size={12} />
								<span>{stats.pendingListings} Pending</span>
							</div>
						</CardContent>
					</Card>

					<Card className='bg-white border-slate-200 shadow-xl overflow-hidden relative group'>
						<div className='absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-700'>
							<Zap size={80} className='text-slate-900' />
						</div>
						<CardContent className='p-6 relative z-10'>
							<p className='text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2'>Shop Products</p>
							<h3 className='text-3xl font-black text-slate-900 tracking-tight'>{stats.totalProducts}</h3>
							<div className='flex items-center gap-1.5 mt-2 text-rose-500 font-bold text-[10px]'>
								<Edit3 size={12} />
								<span>{stats.draftProducts} Drafts</span>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Order Status Breakdown */}
				<div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-10'>
					{[
						{ label: "Pending", count: stats.orderStats.pending, color: "bg-amber-500" },
						{ label: "Processing", count: stats.orderStats.processing, color: "bg-blue-500" },
						{ label: "Completed", count: stats.orderStats.completed, color: "bg-emerald-500" },
						{ label: "Cancelled", count: stats.orderStats.cancelled, color: "bg-rose-500" },
					].map((item, i) => (
						<div key={i} className='bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4'>
							<div className={`w-2 h-2 rounded-full ${item.color}`} />
							<div>
								<p className='text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1'>{item.label}</p>
								<p className='text-lg font-black text-slate-900'>{item.count}</p>
							</div>
						</div>
					))}
				</div>

				<div className='grid lg:grid-cols-3 gap-8'>
					{/* Activity Hub */}
					<div className='lg:col-span-2 space-y-8'>
						<div>
							<div className='flex items-center justify-between mb-6'>
								<h2 className='text-xl font-black text-slate-900 flex items-center gap-2'>
									<Activity size={22} className='text-indigo-600' />
									Recent Marketplace Activity
								</h2>
							</div>
							
							<div className='grid gap-4'>
								{listings.slice(0, 3).map((listing) => {
									const statusCfg = getListingStatusBadge(listing.status);
									const SIcon = statusCfg.icon;
									return (
										<Card key={listing._id} className='bg-white border-slate-200 shadow-sm hover:shadow-md transition-all group p-4'>
											<div className='flex items-center gap-4'>
												<div className='w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-100 shadow-sm'>
													<img src={listing.thumbnail || "/deelzobanner.png"} alt='' className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500' />
												</div>
												<div className='flex-1 min-w-0'>
													<div className='flex items-center justify-between mb-1'>
														<h4 className='font-bold text-slate-900 truncate pr-4'>{listing.title}</h4>
														<span className='text-sm font-black text-slate-900'>${listing.price.toLocaleString()}</span>
													</div>
													<div className='flex items-center gap-3'>
														<div className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${statusCfg.bg}`}>
															<SIcon size={10} className={statusCfg.iconColor} /> {listing.status}
														</div>
														<span className='text-xs text-slate-400 font-medium'>By {listing.seller?.name || "Anonymous"}</span>
														<span className='text-[10px] text-slate-300'>•</span>
														<span className='text-xs text-slate-400 font-medium'>{new Date(listing.createdAt).toLocaleDateString()}</span>
													</div>
												</div>
											</div>
										</Card>
									);
								})}
								{listings.length === 0 && (
									<div className='text-center py-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200'>
										<Package size={40} className='mx-auto text-slate-300 mb-3' />
										<p className='text-slate-500 font-bold'>No recent listings found</p>
									</div>
								)}
								<Link href='/admin/listings'>
									<Button variant='outline' className='w-full border-slate-200 text-slate-500 font-bold rounded-2xl hover:bg-slate-50 py-6'>
										Access Full Marketplace Registry <ArrowRight size={16} className='ml-2' />
									</Button>
								</Link>
							</div>
						</div>

						{/* Recent Transactions (Orders) */}
						<div>
							<h2 className='text-xl font-black text-slate-900 flex items-center gap-2 mb-6'>
								<BarChart3 size={22} className='text-emerald-600' />
								Latest Platform Transactions
							</h2>
							<div className='bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/20 overflow-hidden'>
								<table className='w-full text-left'>
									<thead className='bg-slate-50 border-b border-slate-100'>
										<tr>
											<th className='px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest'>Identity</th>
											<th className='px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest'>Amount</th>
											<th className='px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest'>Status</th>
										</tr>
									</thead>
									<tbody className='divide-y divide-slate-50'>
										{recentOrders.map((order) => (
											<tr key={order._id} className='hover:bg-slate-50/50 transition-colors'>
												<td className='px-6 py-4'>
													<div className='flex flex-col'>
														<span className='text-xs font-black text-slate-900'>#{order.orderId}</span>
														<span className='text-[10px] text-slate-500 font-medium'>{order.user?.name || "Member"}</span>
													</div>
												</td>
												<td className='px-6 py-4'>
													<span className='text-xs font-black text-slate-900'>{order.currency === 'USD' ? '$' : '₹'}{order.finalAmount.toLocaleString()}</span>
												</td>
												<td className='px-6 py-4'>
													<span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${
														order.paymentStatus === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
													}`}>
														{order.paymentStatus}
													</span>
												</td>
											</tr>
										))}
									</tbody>
								</table>
								{recentOrders.length === 0 && (
									<div className='text-center py-10 text-slate-400 text-sm font-medium'>No transactions logged</div>
								)}
							</div>
						</div>
					</div>

					{/* Action Center (Sidebar of Main) */}
					<div className='space-y-8'>
						<div className='bg-linear-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden'>
							<div className='absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl' />
							<div className='relative z-10'>
								<h3 className='text-xl font-black mb-2 flex items-center gap-2'>
									<AlertCircle size={22} /> Critical Tasks
								</h3>
								<p className='text-indigo-100 text-sm font-medium mb-6 opacity-80'>You have {pendingItemsCount} items awaiting your final approval.</p>
								
								<div className='space-y-4'>
									<div className='flex items-center justify-between p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10'>
										<div className='flex items-center gap-3'>
											<Package size={18} className='text-indigo-200' />
											<span className='text-sm font-bold'>Pending Listings</span>
										</div>
										<span className='text-lg font-black'>{stats.pendingListings}</span>
									</div>
									<div className='flex items-center justify-between p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10'>
										<div className='flex items-center gap-3'>
											<Newspaper size={18} className='text-indigo-200' />
											<span className='text-sm font-bold'>Blog Reviews</span>
										</div>
										<span className='text-lg font-black'>{stats.pendingBlogs}</span>
									</div>
								</div>

								<Link href='/admin/listings?filter=pending'>
									<Button className='w-full mt-8 bg-white text-indigo-600 hover:bg-slate-50 font-black rounded-2xl py-6 shadow-xl'>
										START REVIEW <Zap size={16} className='ml-2' />
									</Button>
								</Link>
							</div>
						</div>

						{/* Platform Efficiency */}
						<Card className='bg-white border-slate-200 shadow-xl rounded-[2.5rem] p-8 overflow-hidden'>
							<h3 className='text-lg font-black text-slate-900 mb-6 flex items-center gap-2'>
								<TrendingUp size={20} className='text-rose-500' />
								Activity Pulse
							</h3>
							
							<div className='space-y-6'>
								<div>
									<div className='flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2'>
										<span>Marketplace Liquidity</span>
										<span className='text-emerald-600'>84% Optimal</span>
									</div>
									<div className='h-2 w-full bg-slate-100 rounded-full overflow-hidden'>
										<div className='h-full bg-emerald-500 rounded-full w-[84%]' />
									</div>
								</div>
								<div>
									<div className='flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2'>
										<span>Listing Approval Latency</span>
										<span className='text-blue-600'>Fast</span>
									</div>
									<div className='h-2 w-full bg-slate-100 rounded-full overflow-hidden'>
										<div className='h-full bg-blue-500 rounded-full w-[92%]' />
									</div>
								</div>
								<div>
									<div className='flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2'>
										<span>Member Verification</span>
										<span className='text-violet-600'>Trending Up</span>
									</div>
									<div className='h-2 w-full bg-slate-100 rounded-full overflow-hidden'>
										<div className='h-full bg-violet-500 rounded-full w-[67%]' />
									</div>
								</div>
							</div>

							<div className='mt-8 pt-8 border-t border-slate-100 grid grid-cols-2 gap-4'>
								<div className='p-4 bg-slate-50 rounded-2xl'>
									<p className='text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1'>Rejected</p>
									<p className='text-xl font-black text-slate-900'>{stats.rejectedListings}</p>
								</div>
								<div className='p-4 bg-slate-50 rounded-2xl'>
									<p className='text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1'>Active Rate</p>
									<p className='text-xl font-black text-slate-900'>
										{stats.totalListings > 0 ? Math.round((stats.activeListings / stats.totalListings) * 100) : 0}%
									</p>
								</div>
							</div>
						</Card>
					</div>
				</div>
			</main>
		</div>
	);
}
