"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	CheckCircle,
	XCircle,
	Clock,
	Users,
	FileText,
	TrendingUp,
	Loader2,
	AlertCircle,
	Calendar,
	DollarSign,
	Eye,
	BarChart3,
	ArrowUpRight,
	ArrowDownRight,
	Sparkles,
	Shield,
	Zap,
	Activity,
	Package,
	Newspaper,
	MoreHorizontal,
	ExternalLink,
	RefreshCw,
	ArrowRight,
	ShoppingBag,
} from "lucide-react";
import AdminSidebar from "@/components/admin-sidebar";
import axios from "axios";
import { listingService } from "@/services/listingService";
import { userService } from "@/services/userService";
import { blogService } from "@/services/blogService";
import { orderService } from "@/services/orderService";
import { userContext } from "@/context/userContext";
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
	const [blogs, setBlogs] = useState<Blog[]>([]);
	const [loading, setLoading] = useState(true);
	const [stats, setStats] = useState({
		totalListings: 0,
		totalUsers: 0,
		pendingListings: 0,
		activeListings: 0,
		rejectedListings: 0,
		totalRevenue: 0,
		totalBlogs: 0,
		pendingBlogs: 0,
		totalMarketplaceValue: 0,
		verifiedUsers: 0,
	});
	const [recentOrders, setRecentOrders] = useState<Order[]>([]);

	const fetchData = async () => {
		try {
			if (!user) return;
			setLoading(true);

			// Fetch all necessary data in parallel using services
			const [allListings, allUsers, allBlogs, allOrders] = await Promise.all([
				listingService.getListings({ limit: 100 }),
				userService.getAllUsers(),
				blogService.getBlogs(),
				orderService.getAllOrders()
			]);

            // Calculate Stats manually (Clean & Simple)
            const activeListings = allListings.listings.filter(l => l.status === 'active');
            const pendingListings = allListings.listings.filter(l => l.status === 'pending');
            const rejectedListings = allListings.listings.filter(l => l.status === 'rejected');
            const verifiedUsers = allUsers.filter(u => u.verified);
            const totalRevenue = allOrders.reduce((acc, o) => acc + (o.paymentStatus === 'completed' ? o.finalAmount : 0), 0);
            const totalMarketplaceValue = allListings.listings.reduce((acc, l) => acc + (l.price || 0), 0);

			setListings(allListings.listings.slice(0, 10));
			setBlogs(allBlogs.slice(0, 10));
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
				totalMarketplaceValue: totalMarketplaceValue,
				verifiedUsers: verifiedUsers.length,
			});
		} catch (error) {
			console.error("Failed to fetch dashboard data:", error);
			toast.error("Error loading dashboard metrics");
		} finally {
			setLoading(false);
		}
	};
	useEffect(() => {
		fetchData();
	}, [user]);

	const handleStatusUpdate = async (listingId: string, status: string) => {
		try {
			if (!user) {
				return;
			}
            await listingService.updateListing(listingId, { status: status as any });
			await fetchData();
			toast.success("Listing status updated successfully");
		} catch (error) {
			console.error("Failed to update listing status:", error);
			toast.error("Failed to update listing status");
		}
	};

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

	const getBlogStatusBadge = (status: string) => {
		const statusConfig = {
			draft: {
				bg: "bg-slate-100 text-slate-700 border-slate-200",
				icon: Clock,
				iconColor: "text-slate-600",
			},
			published: {
				bg: "bg-emerald-100 text-emerald-700 border-emerald-200",
				icon: CheckCircle,
				iconColor: "text-emerald-600",
			},
			pending: {
				bg: "bg-amber-100 text-amber-700 border-amber-200",
				icon: Clock,
				iconColor: "text-amber-600",
			},
		};
		return statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
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
								<h1 className='text-3xl font-black text-slate-900 tracking-tight'>Command Center</h1>
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

				{/* Primary Financial Stats */}
				<div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-10'>
					<Card className='md:col-span-2 bg-slate-900 border-slate-800 shadow-2xl overflow-hidden group'>
						<div className='absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700'>
							<DollarSign size={160} className='text-white' />
						</div>
						<CardContent className='p-8 relative z-10'>
							<div className='flex flex-col md:flex-row md:items-end justify-between gap-6'>
								<div>
									<p className='text-indigo-300 text-xs font-black uppercase tracking-[0.2em] mb-4'>Estimated Platform Revenue</p>
									<h2 className='text-5xl md:text-6xl font-black text-white mb-4 tracking-tighter'>
										₹{stats.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
									</h2>
									<div className='flex items-center gap-3'>
										<div className='flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full'>
											<ArrowUpRight size={14} className='text-emerald-400' />
											<span className='text-xs font-black text-emerald-400'>+24.8%</span>
										</div>
										<p className='text-slate-400 text-sm font-medium'>vs. previous 30 days</p>
									</div>
								</div>
								<div className='grid grid-cols-2 gap-8 border-t md:border-t-0 md:border-l border-slate-800 pt-6 md:pt-0 md:pl-10'>
									<div>
										<p className='text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1'>Market Value</p>
										<p className='text-xl font-black text-white'>₹{(stats.totalMarketplaceValue / 1000000).toFixed(1)}M</p>
									</div>
									<div>
										<p className='text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1'>Growth Rate</p>
										<p className='text-xl font-black text-white'>12.4%</p>
									</div>
								</div>
							</div>
						</CardContent>
						<div className='h-1.5 w-full bg-slate-800'>
							<div className='h-full bg-linear-to-r from-indigo-500 via-purple-500 to-rose-500 w-[78%]' />
						</div>
					</Card>

					<Card className='bg-white border-slate-200 shadow-xl overflow-hidden relative'>
						<div className='absolute -bottom-6 -right-6 text-slate-100 transform rotate-12 group-hover:rotate-0 transition-transform duration-500'>
							<Users size={120} />
						</div>
						<CardContent className='p-8 relative z-10 h-full flex flex-col justify-between'>
							<div>
								<p className='text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4'>User Ecosystem</p>
								<h3 className='text-4xl font-black text-slate-900 tracking-tight mb-2'>{stats.totalUsers}</h3>
								<div className='flex items-center gap-2 text-emerald-600 font-bold text-sm'>
									<Zap size={14} /> 
									<span>{stats.verifiedUsers} Verified Members</span>
								</div>
							</div>
							<div className='mt-8 space-y-3'>
								<div className='flex justify-between text-xs font-bold text-slate-500'>
									<span>Verification Rate</span>
									<span>{stats.totalUsers > 0 ? Math.round((stats.verifiedUsers / stats.totalUsers) * 100) : 0}%</span>
								</div>
								<div className='h-2 w-full bg-slate-100 rounded-full overflow-hidden'>
									<div className='h-full bg-indigo-600 rounded-full' style={{ width: `${stats.totalUsers > 0 ? (stats.verifiedUsers / stats.totalUsers) * 100 : 0}%` }} />
								</div>
								<Link href='/admin/users'>
									<Button variant='outline' size='sm' className='w-full mt-4 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 rounded-xl text-[10px] tracking-widest uppercase'>Manage Directory</Button>
								</Link>
							</div>
						</CardContent>
					</Card>
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
														<span className='text-sm font-black text-slate-900'>₹{listing.price.toLocaleString()}</span>
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
												<Link href={`/dashboard/edit-listing/${listing._id}`}>
													<Button variant='ghost' size='sm' className='rounded-xl text-slate-400 hover:text-indigo-600'><MoreHorizontal size={20} /></Button>
												</Link>
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
