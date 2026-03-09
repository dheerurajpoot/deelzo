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
} from "lucide-react";
import AdminSidebar from "@/components/admin-sidebar";
import axios from "axios";
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
	metrics?: {
		monthlyRevenue?: number;
		monthlyTraffic?: number;
		followers?: number;
		age?: number;
	};
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
	});

	const fetchData = async () => {
		try {
			if (!user) {
				return;
			}
			// Fetch listings, users, and blogs in parallel
			const [listingsResponse, usersResponse, blogsResponse] = await Promise.all([
				axios.get(`/api/admin/all-listings?adminId=${user?._id}`),
				axios.get(`/api/admin/users?adminId=${user?._id}`),
				axios.get(`/api/blogs`),
			]);

			const allListings: Listing[] = listingsResponse.data || [];
			const allUsers = usersResponse.data || [];
			const allBlogs: Blog[] = blogsResponse.data?.blogs || [];

			setListings(allListings);
			setBlogs(allBlogs);

			// Calculate stats
			const totalRevenue = allListings.reduce((sum: number, l: Listing) => sum + (l.price || 0), 0);
			setStats({
				totalListings: allListings.length,
				totalUsers: allUsers.length,
				pendingListings: allListings.filter((l) => l.status === "pending").length,
				activeListings: allListings.filter((l) => l.status === "active").length,
				rejectedListings: allListings.filter((l) => l.status === "rejected").length,
				totalRevenue: totalRevenue,
				totalBlogs: allBlogs.length,
				pendingBlogs: allBlogs.filter((b) => b.status === "pending" || b.status === "draft").length,
			});
		} catch (error) {
			console.error("Failed to fetch data:", error);
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
			const response = await axios.put("/api/admin/all-listings", {
				listingId,
				action: status,
				adminId: user?._id,
			});

			if (response.data.success) {
				await fetchData();
				toast.success("Listing status updated successfully");
			} else {
				toast.error("Failed to update listing status");
			}
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

	// Get recent and pending items
	const recentListing = listings
		.filter((l) => l.status === "active")
		.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
	
	const pendingListing = listings
		.filter((l) => l.status === "pending")
		.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
	
	const recentBlog = blogs
		.filter((b) => b.status === "published")
		.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
	
	const pendingBlog = blogs
		.filter((b) => b.status === "draft" || b.status === "pending")
		.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

	return (
		<div className='flex min-h-[calc(100vh-85px)] bg-linear-to-br from-slate-50 via-white to-slate-100'>
			<AdminSidebar />

			{/* Main Content */}
			<main className='flex-1 md:ml-64 p-4 md:p-6 lg:p-8'>
				{/* Header */}
				<div className='mb-8 mt-5 md:mt-0'>
					<div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
						<div className='flex items-center gap-3'>
							<div className='w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/25'>
								<Sparkles size={24} className='text-white' />
							</div>
							<div>
								<h1 className='text-2xl md:text-3xl font-bold text-slate-900'>
									Admin Dashboard
								</h1>
								<p className='text-slate-500 text-sm'>
									Welcome back! Here's what's happening today.
								</p>
							</div>
						</div>


					</div>
				</div>

				{/* Stats Grid */}
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8'>
					{[
						{
							title: "Total Listings",
							value: stats.totalListings,
							change: "+12%",
							changeType: "up",
							icon: FileText,
							gradient: "from-blue-500 to-blue-600",
							bgGradient: "from-blue-50 to-indigo-50",
							borderColor: "border-blue-200",
						},
						{
							title: "Pending Review",
							value: stats.pendingListings,
							change: "+5",
							changeType: "up",
							icon: Clock,
							gradient: "from-amber-500 to-orange-500",
							bgGradient: "from-amber-50 to-orange-50",
							borderColor: "border-amber-200",
						},
						{
							title: "Active Listings",
							value: stats.activeListings,
							change: "+8%",
							changeType: "up",
							icon: CheckCircle,
							gradient: "from-emerald-500 to-teal-500",
							bgGradient: "from-emerald-50 to-teal-50",
							borderColor: "border-emerald-200",
						},
						{
							title: "Total Users",
							value: stats.totalUsers,
							change: "+15%",
							changeType: "up",
							icon: Users,
							gradient: "from-violet-500 to-purple-500",
							bgGradient: "from-violet-50 to-purple-50",
							borderColor: "border-violet-200",
						},
					].map((stat, index) => {
						const Icon = stat.icon;
						return (
							<Card 
								key={index} 
								className={`relative overflow-hidden bg-gradient-to-br ${stat.bgGradient} ${stat.borderColor} border shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group`}>
								<CardContent className='p-6'>
									<div className='flex items-start justify-between'>
										<div>
											<p className='text-slate-600 text-sm font-medium mb-1'>
												{stat.title}
											</p>
											<p className='text-3xl font-bold text-slate-900 mb-2'>
												{stat.value}
											</p>
											<div className='flex items-center gap-1'>
												{stat.changeType === "up" ? (
													<ArrowUpRight size={14} className='text-emerald-500' />
												) : (
													<ArrowDownRight size={14} className='text-rose-500' />
												)}
												<span className={`text-xs font-semibold ${stat.changeType === "up" ? "text-emerald-600" : "text-rose-600"}`}>
													{stat.change}
												</span>
												<span className='text-xs text-slate-400 ml-1'>vs last month</span>
											</div>
										</div>
										<div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
											<Icon size={22} className='text-white' />
										</div>
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>
				{/* Recent Activity Section */}
				<div className='mb-8'>
					<div className='flex items-center justify-between mb-6'>
						<h2 className='text-xl font-bold text-slate-900 flex items-center gap-2'>
							<Activity size={20} className='text-orange-500' />
							Recent Activity
						</h2>
						<Link href='/admin/listings'>
							<Button variant='ghost' className='text-orange-600 hover:text-orange-700 hover:bg-orange-50 gap-1'>
								View All <ArrowUpRight size={16} />
							</Button>
						</Link>
					</div>

					{loading ? (
						<div className='flex items-center justify-center py-12'>
							<Loader2 className='animate-spin text-orange-500' size={32} />
						</div>
					) : (
						<div className='grid lg:grid-cols-2 gap-6'>
							{/* Recent Listing Card */}
							{recentListing ? (
								<Card className='bg-white border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden'>
									<div className='h-1 bg-gradient-to-r from-orange-500 to-rose-500' />
									<CardContent className='p-6'>
										<div className='flex items-start justify-between mb-4'>
											<div className='flex items-center gap-3'>
												<div className='w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center'>
													<Package size={20} className='text-white' />
												</div>
												<div>
													<p className='text-xs text-slate-500 font-medium'>RECENT LISTING</p>
													<h3 className='font-semibold text-slate-900 line-clamp-1'>{recentListing.title}</h3>
												</div>
											</div>
											{(() => {
												const statusConfig = getListingStatusBadge(recentListing.status);
												const StatusIcon = statusConfig.icon;
												return (
													<div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${statusConfig.bg}`}>
														<StatusIcon size={12} className={statusConfig.iconColor} />
														<span className='text-xs font-semibold capitalize'>{recentListing.status}</span>
													</div>
												);
											})()}
										</div>
										<p className='text-sm text-slate-600 line-clamp-2 mb-4'>{recentListing.description}</p>
										<div className='flex items-center justify-between'>
											<div className='flex items-center gap-4 text-sm'>
												<span className='text-slate-500'>{recentListing.category}</span>
												<span className='font-semibold text-emerald-600'>${recentListing.price?.toLocaleString()}</span>
											</div>
											<Link href={`/marketplace/${recentListing.slug || recentListing._id}`} target='_blank'>
												<Button size='sm' variant='ghost' className='text-orange-600 hover:text-orange-700 hover:bg-orange-50 gap-1'>
													View <ExternalLink size={14} />
												</Button>
											</Link>
										</div>
									</CardContent>
								</Card>
							) : (
								<Card className='bg-slate-50 border-slate-200 border-dashed'>
									<CardContent className='p-8 text-center'>
										<Package size={40} className='mx-auto mb-3 text-slate-300' />
										<p className='text-slate-500 font-medium'>No recent listings</p>
									</CardContent>
								</Card>
							)}

							{/* Recent Blog Card */}
							{recentBlog ? (
								<Card className='bg-white border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden'>
									<div className='h-1 bg-gradient-to-r from-violet-500 to-purple-500' />
									<CardContent className='p-6'>
										<div className='flex items-start justify-between mb-4'>
											<div className='flex items-center gap-3'>
												<div className='w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center'>
													<Newspaper size={20} className='text-white' />
												</div>
												<div>
													<p className='text-xs text-slate-500 font-medium'>RECENT BLOG</p>
													<h3 className='font-semibold text-slate-900 line-clamp-1'>{recentBlog.title}</h3>
												</div>
											</div>
											{(() => {
												const statusConfig = getBlogStatusBadge(recentBlog.status);
												const StatusIcon = statusConfig.icon;
												return (
													<div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${statusConfig.bg}`}>
														<StatusIcon size={12} className={statusConfig.iconColor} />
														<span className='text-xs font-semibold capitalize'>{recentBlog.status}</span>
													</div>
												);
											})()}
										</div>
										<p className='text-sm text-slate-600 line-clamp-2 mb-4'>{recentBlog.excerpt}</p>
										<div className='flex items-center justify-between'>
											<span className='text-sm text-slate-500'>
												By {recentBlog.author?.name || 'Unknown'}
											</span>
											<Link href={`/blogs/${recentBlog.slug || recentBlog._id}`} target='_blank'>
												<Button size='sm' variant='ghost' className='text-violet-600 hover:text-violet-700 hover:bg-violet-50 gap-1'>
													Read <ExternalLink size={14} />
												</Button>
											</Link>
										</div>
									</CardContent>
								</Card>
							) : (
								<Card className='bg-slate-50 border-slate-200 border-dashed'>
									<CardContent className='p-8 text-center'>
										<Newspaper size={40} className='mx-auto mb-3 text-slate-300' />
										<p className='text-slate-500 font-medium'>No recent blogs</p>
									</CardContent>
								</Card>
							)}
						</div>
					)}
				</div>

				{/* Pending Review Section */}
				{(pendingListing || pendingBlog) && (
					<div className='mb-8'>
						<div className='flex items-center justify-between mb-6'>
							<h2 className='text-xl font-bold text-slate-900 flex items-center gap-2'>
								<Clock size={20} className='text-amber-500' />
								Pending Review
								<span className='px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold'>
									{stats.pendingListings + stats.pendingBlogs}
								</span>
							</h2>
						</div>

						<div className='grid lg:grid-cols-2 gap-6'>
							{/* Pending Listing */}
							{pendingListing && (
								<Card className='bg-white border-amber-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden'>
									<div className='h-1 bg-gradient-to-r from-amber-500 to-orange-500' />
									<CardContent className='p-6'>
										<div className='flex items-start justify-between mb-4'>
											<div className='flex items-center gap-3'>
												<div className='w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center'>
													<Package size={20} className='text-white' />
												</div>
												<div>
													<p className='text-xs text-amber-600 font-medium'>PENDING LISTING</p>
													<h3 className='font-semibold text-slate-900 line-clamp-1'>{pendingListing.title}</h3>
												</div>
											</div>
											<div className='flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-amber-100 text-amber-700 border-amber-200'>
												<Clock size={12} className='text-amber-600' />
												<span className='text-xs font-semibold'>Pending</span>
											</div>
										</div>
										<p className='text-sm text-slate-600 line-clamp-2 mb-4'>{pendingListing.description}</p>
										<div className='flex items-center justify-between mb-4'>
											<div className='flex items-center gap-4 text-sm'>
												<span className='text-slate-500'>{pendingListing.category}</span>
												<span className='font-semibold text-emerald-600'>${pendingListing.price?.toLocaleString()}</span>
											</div>
											<span className='text-xs text-slate-400'>
												{new Date(pendingListing.createdAt).toLocaleDateString()}
											</span>
										</div>
										<div className='flex gap-2'>
											<Button
												onClick={() => handleStatusUpdate(pendingListing._id, "active")}
												className='flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white gap-2 shadow-lg shadow-emerald-500/20'>
												<CheckCircle size={16} />
												Approve
											</Button>
											<Button
												onClick={() => handleStatusUpdate(pendingListing._id, "rejected")}
												variant='outline'
												className='flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 gap-2'>
												<XCircle size={16} />
												Reject
											</Button>
										</div>
									</CardContent>
								</Card>
							)}

							{/* Pending Blog */}
							{pendingBlog && (
								<Card className='bg-white border-amber-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden'>
									<div className='h-1 bg-gradient-to-r from-violet-500 to-purple-500' />
									<CardContent className='p-6'>
										<div className='flex items-start justify-between mb-4'>
											<div className='flex items-center gap-3'>
												<div className='w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center'>
													<Newspaper size={20} className='text-white' />
												</div>
												<div>
													<p className='text-xs text-violet-600 font-medium'>PENDING BLOG</p>
													<h3 className='font-semibold text-slate-900 line-clamp-1'>{pendingBlog.title}</h3>
												</div>
											</div>
											{(() => {
												const statusConfig = getBlogStatusBadge(pendingBlog.status);
												const StatusIcon = statusConfig.icon;
												return (
													<div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${statusConfig.bg}`}>
														<StatusIcon size={12} className={statusConfig.iconColor} />
														<span className='text-xs font-semibold capitalize'>{pendingBlog.status}</span>
													</div>
												);
											})()}
										</div>
										<p className='text-sm text-slate-600 line-clamp-2 mb-4'>{pendingBlog.excerpt}</p>
										<div className='flex items-center justify-between mb-4'>
											<span className='text-sm text-slate-500'>
												By {pendingBlog.author?.name || 'Unknown'}
											</span>
											<span className='text-xs text-slate-400'>
												{new Date(pendingBlog.createdAt).toLocaleDateString()}
											</span>
										</div>
										<div className='flex gap-2'>
											<Link href={`/admin/blogs`} className='flex-1'>
												<Button className='w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white gap-2 shadow-lg shadow-violet-500/20'>
													<ExternalLink size={16} />
													Review
												</Button>
											</Link>
										</div>
									</CardContent>
								</Card>
							)}
						</div>
					</div>
				)}

				{/* Additional Stats Row */}
				<div className='grid grid-cols-2 md:grid-cols-4 mb-20 md:mb-0 gap-4'>
					<Card className='bg-white border-slate-200 shadow-sm hover:shadow-md transition-all'>
						<CardContent className='p-4'>
							<div className='flex items-center gap-3'>
								<div className='w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center'>
									<Package size={18} className='text-white' />
								</div>
								<div>
									<p className='text-xs text-slate-500'>Total Blogs</p>
									<p className='text-xl font-bold text-slate-900'>{stats.totalBlogs}</p>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card className='bg-white border-slate-200 shadow-sm hover:shadow-md transition-all'>
						<CardContent className='p-4'>
							<div className='flex items-center gap-3'>
								<div className='w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center'>
									<Newspaper size={18} className='text-white' />
								</div>
								<div>
									<p className='text-xs text-slate-500'>Pending Blogs</p>
									<p className='text-xl font-bold text-slate-900'>{stats.pendingBlogs}</p>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card className='bg-white border-slate-200 shadow-sm hover:shadow-md transition-all'>
						<CardContent className='p-4'>
							<div className='flex items-center gap-3'>
								<div className='w-10 h-10 rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center'>
									<XCircle size={18} className='text-white' />
								</div>
								<div>
									<p className='text-xs text-slate-500'>Rejected</p>
									<p className='text-xl font-bold text-slate-900'>{stats.rejectedListings}</p>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card className='bg-white border-slate-200 shadow-sm hover:shadow-md transition-all'>
						<CardContent className='p-4'>
							<div className='flex items-center gap-3'>
								<div className='w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center'>
									<Eye size={18} className='text-white' />
								</div>
								<div>
									<p className='text-xs text-slate-500'>Active Rate</p>
									<p className='text-xl font-bold text-slate-900'>
										{stats.totalListings > 0 ? Math.round((stats.activeListings / stats.totalListings) * 100) : 0}%
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</main>
		</div>
	);
}
