"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Plus,
	Eye,
	DollarSign,
	TrendingUp,
	BookOpen,
	Loader2,
	FileText,
	CheckCircle,
	Clock,
	ShoppingBag,
	Star,
	ArrowUpRight,
	Package,
	BarChart3,
	Wallet,
	Award,
	Sparkles,
	Target,
	Zap,
} from "lucide-react";
import { userContext } from "@/context/userContext";
import { toast } from "sonner";
import axios from "axios";
import Image from "next/image";
import AdminSidebar from "@/components/admin-sidebar";

export default function Dashboard() {
	const { user } = userContext();
	const [profile, setProfile] = useState<any>();
	const [listings, setListings] = useState([]);
	const [blogs, setBlogs] = useState([]);
	const [loading, setLoading] = useState(true);
	const [recentActivity, setRecentActivity] = useState<any[]>([]);

	const fetchDashboardData = async () => {
		try {
			if (!user) return;

			const response = await axios.get(`/api/users/${user?._id}`);
			const userData = response.data;
			setProfile(userData);
			setListings(userData?.listings || []);
		} catch (error) {
			console.error("Failed to fetch dashboard data:", error);
		}
	};

	const fetchBlogs = async () => {
		try {
			if (!user) return;
			const response = await axios.get(`/api/blogs?userId=${user?._id}`);
			if (!response.data.success) throw new Error("Blogs not found");
			const blogsData = response.data.blogs;
			setBlogs(blogsData);
		} catch (err) {
			console.log(err);
		}
	};

	const fetchRecentActivity = async () => {
		try {
			if (!user) return;
			// Fetch recent bids/offers for user's listings
			const bidsResponse = await axios.get(`/api/bids?userId=${user?._id}`);
			if (bidsResponse.data?.bids) {
				const activities = bidsResponse.data.bids
					.slice(0, 5)
					.map((bid: any) => ({
						type: "bid",
						title: `New bid on "${bid.listing?.title || "Listing"}"`,
						amount: bid.amount,
						date: bid.createdAt,
						user: bid.user?.name || "Anonymous",
					}));
				setRecentActivity(activities);
			}
		} catch (error) {
			console.log("No recent activity");
		}
	};

	useEffect(() => {
		const loadData = async () => {
			await Promise.all([
				fetchDashboardData(),
				fetchBlogs(),
				fetchRecentActivity(),
			]);
			setLoading(false);
		};
		loadData();
	}, [user]);

	if (loading) {
		return (
			<div className="flex min-h-[calc(100vh-85px)] bg-gradient-to-br from-slate-50 via-white to-slate-100">
				<AdminSidebar role="user" />
				<main className="flex-1 md:ml-64 flex items-center justify-center">
					<Loader2 className="animate-spin w-12 h-12 text-emerald-500" />
				</main>
			</div>
		);
	}

	// Calculate statistics
	const totalListings = listings.length;
	const activeListings = listings.filter((l: any) => l.status === "active").length;
	const pendingListings = listings.filter((l: any) => l.status === "pending").length;
	const soldListings = listings.filter((l: any) => l.status === "sold").length;
	const totalViews = listings.reduce((sum: number, l: any) => sum + (l.views || 0), 0);
	const totalBids = listings.reduce((sum: number, l: any) => sum + (l.bids?.length || 0), 0);
	const totalBlogs = blogs.length;
	const publishedBlogs = blogs.filter((b: any) => b.status === "published").length;

	// Calculate total potential value
	const totalValue = listings.reduce((sum: number, l: any) => sum + (l.price || 0), 0);

	// Get recent listings (last 3)
	const recentListings = listings.slice(0, 3);

	// Get recent blogs (last 3)
	const recentBlogs = blogs.slice(0, 3);

	return (
		<div className="flex min-h-[calc(100vh-85px)] bg-gradient-to-br from-slate-50 via-white to-slate-100">
			<AdminSidebar role="user" />

			<main className="flex-1 md:ml-64 p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
				{/* Welcome Header */}
				<div className="mb-8 mt-5 md:mt-0">
					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
						<div>
							<div className="flex items-center gap-3 mb-2">
								<h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
									Welcome back, {user?.name || "User"}
								</h1>
								{user?.currentPlan && user.currentPlan !== "free" && (
									<span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs font-semibold shadow-lg shadow-amber-500/20">
										<Sparkles size={12} />
										{user.currentPlan.charAt(0).toUpperCase() + user.currentPlan.slice(1)}
									</span>
								)}
							</div>
							<p className="text-slate-600 text-sm md:text-base">
								Here&apos;s what&apos;s happening with your digital assets today
							</p>
						</div>
						<div className="flex gap-3">
							<Link href="/dashboard/create-listing">
								<Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white gap-2 shadow-lg shadow-emerald-500/20">
									<Plus size={18} />
									Create Listing
								</Button>
							</Link>
							<Link href="/dashboard/add-blog">
								<Button variant="outline" className="gap-2 border-slate-200 hover:bg-slate-50">
									<BookOpen size={18} />
									Write Blog
								</Button>
							</Link>
						</div>
					</div>
				</div>

				{/* Primary Stats Grid */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
					<Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
						<div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
						<CardContent className="p-5">
							<div className="flex items-start justify-between">
								<div>
									<p className="text-slate-500 text-xs font-medium mb-1">Total Listings</p>
									<p className="text-2xl md:text-3xl font-bold text-slate-900">{totalListings}</p>
									<p className="text-xs text-slate-400 mt-1">{activeListings} active</p>
								</div>
								<div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
									<Package className="w-6 h-6 text-blue-600" />
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
						<div className="h-1 bg-gradient-to-r from-emerald-500 to-emerald-600" />
						<CardContent className="p-5">
							<div className="flex items-start justify-between">
								<div>
									<p className="text-slate-500 text-xs font-medium mb-1">Total Views</p>
									<p className="text-2xl md:text-3xl font-bold text-slate-900">
										{totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}K` : totalViews}
									</p>
									<p className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
										<TrendingUp size={10} />
										All time
									</p>
								</div>
								<div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
									<Eye className="w-6 h-6 text-emerald-600" />
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
						<div className="h-1 bg-gradient-to-r from-purple-500 to-purple-600" />
						<CardContent className="p-5">
							<div className="flex items-start justify-between">
								<div>
									<p className="text-slate-500 text-xs font-medium mb-1">Total Bids</p>
									<p className="text-2xl md:text-3xl font-bold text-slate-900">{totalBids}</p>
									<p className="text-xs text-slate-400 mt-1">Received</p>
								</div>
								<div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
									<Target className="w-6 h-6 text-purple-600" />
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
						<div className="h-1 bg-gradient-to-r from-amber-500 to-amber-600" />
						<CardContent className="p-5">
							<div className="flex items-start justify-between">
								<div>
									<p className="text-slate-500 text-xs font-medium mb-1">Portfolio Value</p>
									<p className="text-2xl md:text-3xl font-bold text-slate-900">
										${totalValue >= 1000 ? `${(totalValue / 1000).toFixed(1)}K` : totalValue}
									</p>
									<p className="text-xs text-slate-400 mt-1">Total listings value</p>
								</div>
								<div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
									<Wallet className="w-6 h-6 text-amber-600" />
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Secondary Stats & Quick Actions */}
				<div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
					<Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 border-0 shadow-lg">
						<CardContent className="p-4 flex items-center gap-3">
							<div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
								<CheckCircle className="w-5 h-5 text-white" />
							</div>
							<div>
								<p className="text-white/80 text-xs">Active</p>
								<p className="text-white text-xl font-bold">{activeListings}</p>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-gradient-to-br from-amber-500 to-amber-600 border-0 shadow-lg">
						<CardContent className="p-4 flex items-center gap-3">
							<div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
								<Clock className="w-5 h-5 text-white" />
							</div>
							<div>
								<p className="text-white/80 text-xs">Pending</p>
								<p className="text-white text-xl font-bold">{pendingListings}</p>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-lg">
						<CardContent className="p-4 flex items-center gap-3">
							<div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
								<ShoppingBag className="w-5 h-5 text-white" />
							</div>
							<div>
								<p className="text-white/80 text-xs">Sold</p>
								<p className="text-white text-xl font-bold">{soldListings}</p>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0 shadow-lg">
						<CardContent className="p-4 flex items-center gap-3">
							<div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
								<BookOpen className="w-5 h-5 text-white" />
							</div>
							<div>
								<p className="text-white/80 text-xs">Blogs</p>
								<p className="text-white text-xl font-bold">{totalBlogs}</p>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-gradient-to-br from-rose-500 to-rose-600 border-0 shadow-lg">
						<CardContent className="p-4 flex items-center gap-3">
							<div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
								<Star className="w-5 h-5 text-white fill-white" />
							</div>
							<div>
								<p className="text-white/80 text-xs">Rating</p>
								<p className="text-white text-xl font-bold">{(profile?.rating || 0).toFixed(1)}</p>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Main Content Grid */}
				<div className="grid lg:grid-cols-3 gap-6">
					{/* Recent Listings */}
					<div className="lg:col-span-2 w-[365px] md:w-full space-y-6">
						<Card className="bg-white border-0 shadow-lg">
							<CardHeader className="flex flex-row items-center justify-between pb-4">
								<div>
									<CardTitle className="text-lg font-bold text-slate-900">Recent Listings</CardTitle>
									<p className="text-sm text-slate-500">Your latest digital assets</p>
								</div>
								<Link href="/dashboard/listings">
									<Button variant="ghost" size="sm" className="gap-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
										View All
										<ArrowUpRight size={16} />
									</Button>
								</Link>
							</CardHeader>
							<CardContent>
								{recentListings.length > 0 ? (
									<div className="space-y-4">
										{recentListings.map((listing: any) => (
											<div
												key={listing._id}
												className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group"
											>
												<div className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-200 shrink-0">
													<Image
														src={listing.thumbnail || "/deelzobanner.png"}
														alt={listing.title}
														fill
														className="object-cover"
													/>
												</div>
												<div className="flex-1 min-w-0">
													<h4 className="font-semibold text-slate-900 truncate group-hover:text-emerald-600 transition-colors">
														{listing.title}
													</h4>
													<p className="text-sm text-slate-500">{listing.category}</p>
													<div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
														<span className="flex items-center gap-1">
															<Eye size={12} />
															{listing.views || 0} views
														</span>
														<span className="flex items-center gap-1">
															<TrendingUp size={12} />
															{listing.bids?.length || 0} bids
														</span>
													</div>
												</div>
												<div className="text-right shrink-0">
													<p className="font-bold text-emerald-600">${listing.price?.toLocaleString()}</p>
													<span
														className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
															listing.status === "active"
																? "bg-emerald-100 text-emerald-700"
																: listing.status === "pending"
																? "bg-amber-100 text-amber-700"
																: listing.status === "sold"
																? "bg-blue-100 text-blue-700"
																: "bg-slate-100 text-slate-700"
															}`}
														>
															{listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
														</span>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="text-center py-12">
										<div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
											<Package className="w-8 h-8 text-slate-400" />
										</div>
										<p className="text-slate-500 font-medium">No listings yet</p>
										<p className="text-sm text-slate-400 mb-4">Create your first listing to get started</p>
										<Link href="/dashboard/create-listing">
											<Button className="bg-emerald-600 hover:bg-emerald-700">
												<Plus size={16} className="mr-2" />
												Create Listing
											</Button>
										</Link>
									</div>
								)}
							</CardContent>
						</Card>

						{/* Recent Blogs */}
						<Card className="bg-white border-0 shadow-lg">
							<CardHeader className="flex flex-row items-center justify-between pb-4">
								<div>
									<CardTitle className="text-lg font-bold text-slate-900">Recent Blogs</CardTitle>
									<p className="text-sm text-slate-500">Your latest articles</p>
								</div>
								<Link href="/dashboard/blogs">
									<Button variant="ghost" size="sm" className="gap-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
										View All
										<ArrowUpRight size={16} />
									</Button>
								</Link>
							</CardHeader>
							<CardContent>
								{recentBlogs.length > 0 ? (
									<div className="space-y-4">
										{recentBlogs.map((blog: any) => (
											<div
												key={blog._id}
												className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group"
											>
												<div className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-200 shrink-0">
													{blog.image ? (
														<Image
															src={blog.image}
															alt={blog.title}
															fill
															className="object-cover"
														/>
													) : (
														<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-emerald-200">
															<FileText className="w-6 h-6 text-emerald-600" />
														</div>
													)}
												</div>
												<div className="flex-1 min-w-0">
													<h4 className="font-semibold text-slate-900 truncate group-hover:text-emerald-600 transition-colors">
														{blog.title}
													</h4>
													<p className="text-sm text-slate-500 line-clamp-1">
														{blog.seo?.metaDescription || blog.content?.replace(/<[^>]*>?/gm, "").slice(0, 100)}
													</p>
													<p className="text-xs text-slate-400 mt-1">
														{new Date(blog.createdAt).toLocaleDateString()}
													</p>
												</div>
												<span
													className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${
														blog.status === "published"
															? "bg-emerald-100 text-emerald-700"
															: blog.status === "rejected"
															? "bg-rose-100 text-rose-700"
															: "bg-amber-100 text-amber-700"
														}`}
													>
														{blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
													</span>
											</div>
										))}
									</div>
								) : (
									<div className="text-center py-12">
										<div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
											<BookOpen className="w-8 h-8 text-slate-400" />
										</div>
										<p className="text-slate-500 font-medium">No blogs yet</p>
										<p className="text-sm text-slate-400 mb-4">Share your knowledge with the community</p>
										<Link href="/dashboard/add-blog">
											<Button className="bg-emerald-600 hover:bg-emerald-700">
												<Plus size={16} className="mr-2" />
												Write Blog
											</Button>
										</Link>
									</div>
								)}
							</CardContent>
						</Card>
					</div>

					{/* Right Sidebar */}
					<div className="space-y-6">
						{/* Profile Summary */}
						<Card className="bg-white border-0 shadow-lg overflow-hidden p-0">
							<div className="h-24 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
							<CardContent className="p-6 -mt-12">
								<div className="flex flex-col items-center">
									<div className="relative">
										<div className="w-24 h-24 rounded-full border-4 border-white bg-slate-200 overflow-hidden shadow-lg">
											{user?.avatar ? (
												<Image
													src={user.avatar}
													alt={user.name}
													fill
													className="object-cover"
												/>
											) : (
												<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-emerald-200">
													<span className="text-3xl font-bold text-emerald-600">
														{user?.name?.charAt(0).toUpperCase()}
													</span>
												</div>
											)}
										</div>
									</div>
									<h3 className="mt-4 font-bold text-lg text-slate-900">{user?.name}</h3>
									<p className="text-sm text-slate-500">{user?.email}</p>
									<div className="flex items-center gap-2 mt-2">
										<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
											<Zap size={12} />
											{user?.currentPlan ? user.currentPlan.charAt(0).toUpperCase() + user.currentPlan.slice(1) : "Free"} Plan
										</span>
									</div>
									<Link href="/dashboard/profile" className="w-full mt-4">
										<Button variant="outline" className="w-full border-slate-200 hover:bg-slate-50">
											View Profile
										</Button>
									</Link>
								</div>
							</CardContent>
						</Card>

						{/* Performance Stats */}
						<Card className="bg-white border-0 shadow-lg">
							<CardHeader>
								<CardTitle className="text-lg font-bold text-slate-900">Performance</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
											<BarChart3 className="w-5 h-5 text-emerald-600" />
										</div>
										<div>
											<p className="text-sm font-medium text-slate-900">Conversion Rate</p>
											<p className="text-xs text-slate-500">Views to bids</p>
										</div>
									</div>
									<p className="font-bold text-slate-900">
										{totalViews > 0 ? ((totalBids / totalViews) * 100).toFixed(1) : 0}%
									</p>
								</div>
								<div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
											<DollarSign className="w-5 h-5 text-blue-600" />
										</div>
										<div>
											<p className="text-sm font-medium text-slate-900">Avg. Listing Price</p>
											<p className="text-xs text-slate-500">Per asset</p>
										</div>
									</div>
									<p className="font-bold text-slate-900">
										${totalListings > 0 ? Math.round(totalValue / totalListings) : 0}
									</p>
								</div>
								<div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
											<FileText className="w-5 h-5 text-purple-600" />
										</div>
										<div>
											<p className="text-sm font-medium text-slate-900">Blog Published</p>
											<p className="text-xs text-slate-500">Total articles</p>
										</div>
									</div>
									<p className="font-bold text-slate-900">{publishedBlogs}</p>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</main>
		</div>
	);
}
