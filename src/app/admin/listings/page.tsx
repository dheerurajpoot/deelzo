"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Trash2,
	Edit2,
	ChevronDown,
	Eye,
	FileText,
	CheckCircle,
	XCircle,
	Clock,
	ShoppingBag,
	Search,
	Filter,
	Loader2,
	AlertCircle,
	Calendar,
	DollarSign,
	TrendingUp,
	Eye as EyeIcon,
	Globe,
	Users,
	MapPin,
	Link as LinkIcon,
	Image as ImageIcon,
} from "lucide-react";
import AdminSidebar from "@/components/admin-sidebar";
import { toast } from "sonner";
import { userContext } from "@/context/userContext";
import axios from "axios";
import Link from "next/link";

export default function AdminListingsPage() {
	const { user } = userContext();
	const [listings, setListings] = useState([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState("all");
	const [searchTerm, setSearchTerm] = useState("");
	const [deleting, setDeleting] = useState<any>(null);
	const [updating, setUpdating] = useState<any>(null);

	const fetchListings = async () => {
		try {
			if (!user) {
				return;
			}
			const response = await axios.get(
				`/api/admin/all-listings?adminId=${user?._id}`
			);
			setListings(response.data);
		} catch (error) {
			console.error("Failed to fetch listings:", error);
		} finally {
			setLoading(false);
		}
	};
	useEffect(() => {
		fetchListings();
	}, [user]);

	const handleDeleteListing = async (listingId: string) => {
		if (!window.confirm("Are you sure you want to delete this listing?"))
			return;

		setDeleting(listingId);
		try {
			if (!user) {
				return;
			}
			const response = await axios.delete(`/api/listings/${listingId}`, {
				data: { userId: user?._id },
			});

			if (response.data.success) {
				toast.success("Listing deleted successfully");
				await fetchListings();
			} else {
				toast.error("Failed to delete listing");
			}
		} catch (error) {
			console.error("Delete error:", error);
			toast.error("Error deleting listing");
		} finally {
			setDeleting(null);
		}
	};

	const handleUpdateStatus = async (listingId: string, newStatus: string) => {
		setUpdating(listingId);
		try {
			const response = await axios.put(`/api/admin/all-listings`, {
				listingId,
				action: newStatus,
				adminId: user?._id,
			});

			if (response.data.success) {
				toast.success("Status updated successfully");
				await fetchListings();
			} else {
				toast.error("Failed to update status");
			}
		} catch (error) {
			console.error("Update error:", error);
			toast.error("Error updating status");
		} finally {
			setUpdating(null);
		}
	};

	const getStatusConfig = (status: string) => {
		const configs: any = {
			active: {
				bg: "bg-emerald-100 text-emerald-700 border-emerald-200",
				icon: CheckCircle,
				iconColor: "text-emerald-600",
			},
			sold: {
				bg: "bg-blue-100 text-blue-700 border-blue-200",
				icon: ShoppingBag,
				iconColor: "text-blue-600",
			},
			pending: {
				bg: "bg-amber-100 text-amber-700 border-amber-200",
				icon: Clock,
				iconColor: "text-amber-600",
			},
			rejected: {
				bg: "bg-rose-100 text-rose-700 border-rose-200",
				icon: XCircle,
				iconColor: "text-rose-600",
			},
			draft: {
				bg: "bg-slate-100 text-slate-700 border-slate-200",
				icon: FileText,
				iconColor: "text-slate-600",
			},
		};
		return configs[status] || configs.draft;
	};

	const filteredListings = listings.filter((listing: any) => {
		const matchesStatus = filter === "all" || listing.status === filter;
		const matchesSearch =
			searchTerm === "" ||
			listing.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			listing.category
				?.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			listing.description
				?.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			listing.seller?.name
				?.toLowerCase()
				.includes(searchTerm.toLowerCase());
		return matchesStatus && matchesSearch;
	});

	const totalListings = listings.length;
	const activeListings = listings.filter(
		(l: any) => l.status === "active"
	).length;
	const pendingListings = listings.filter(
		(l: any) => l.status === "pending"
	).length;
	const rejectedListings = listings.filter(
		(l: any) => l.status === "rejected"
	).length;
	const soldListings = listings.filter(
		(l: any) => l.status === "sold"
	).length;

	return (
		<div className='flex min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100'>
			<AdminSidebar />

			{/* Main Content */}
			<main className='flex-1 md:ml-64 p-4 md:p-6 lg:p-8'>
				{/* Header */}
				<div className='mb-8 mt-5 md:mt-0'>
					<div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6'>
						<div>
							<h1 className='text-3xl md:text-4xl font-bold bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent mb-2'>
								Manage Listings
							</h1>
							<p className='text-slate-600 text-sm md:text-base'>
								View and manage all marketplace listings
							</p>
						</div>

						{/* Search Bar */}
						<div className='relative w-full md:w-80'>
							<Search
								className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400'
								size={20}
							/>
							<Input
								type='text'
								placeholder='Search listings...'
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className='pl-10 pr-4 h-11 bg-white border-slate-200 focus:border-sky-500 focus:ring-sky-500/20 shadow-sm'
							/>
						</div>
					</div>
				</div>

				{/* Stats */}
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-8'>
					<Card className='bg-linear-to-br from-white to-blue-50/30 border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1'>
						<CardContent className='p-6'>
							<div className='flex items-center justify-between'>
								<div className='flex-1'>
									<p className='text-slate-600 text-sm font-medium mb-1'>
										Total Listings
									</p>
									<p className='text-3xl font-bold text-slate-900 mb-1'>
										{totalListings}
									</p>
									<div className='flex items-center gap-1 text-xs text-slate-500'>
										<FileText size={12} />
										<span>All listings</span>
									</div>
								</div>
								<div className='w-14 h-14 rounded-xl bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20'>
									<FileText
										size={24}
										className='text-white'
									/>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className='bg-linear-to-br from-white to-emerald-50/30 border border-emerald-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1'>
						<CardContent className='p-6'>
							<div className='flex items-center justify-between'>
								<div className='flex-1'>
									<p className='text-slate-600 text-sm font-medium mb-1'>
										Active Listings
									</p>
									<p className='text-3xl font-bold text-emerald-600 mb-1'>
										{activeListings}
									</p>
									<div className='flex items-center gap-1 text-xs text-slate-500'>
										<CheckCircle size={12} />
										<span>Published</span>
									</div>
								</div>
								<div className='w-14 h-14 rounded-xl bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20'>
									<CheckCircle
										size={24}
										className='text-white'
									/>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className='bg-linear-to-br from-white to-amber-50/30 border border-amber-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1'>
						<CardContent className='p-6'>
							<div className='flex items-center justify-between'>
								<div className='flex-1'>
									<p className='text-slate-600 text-sm font-medium mb-1'>
										Pending Review
									</p>
									<p className='text-3xl font-bold text-amber-600 mb-1'>
										{pendingListings}
									</p>
									<div className='flex items-center gap-1 text-xs text-slate-500'>
										<Clock size={12} />
										<span>Awaiting</span>
									</div>
								</div>
								<div className='w-14 h-14 rounded-xl bg-linear-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20'>
									<Clock size={24} className='text-white' />
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className='bg-linear-to-br from-white to-rose-50/30 border border-rose-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1'>
						<CardContent className='p-6'>
							<div className='flex items-center justify-between'>
								<div className='flex-1'>
									<p className='text-slate-600 text-sm font-medium mb-1'>
										Rejected
									</p>
									<p className='text-3xl font-bold text-rose-600 mb-1'>
										{rejectedListings}
									</p>
									<div className='flex items-center gap-1 text-xs text-slate-500'>
										<XCircle size={12} />
										<span>Rejected</span>
									</div>
								</div>
								<div className='w-14 h-14 rounded-xl bg-linear-to-br from-rose-400 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/20'>
									<XCircle size={24} className='text-white' />
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className='bg-linear-to-br from-white to-cyan-50/30 border border-cyan-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1'>
						<CardContent className='p-6'>
							<div className='flex items-center justify-between'>
								<div className='flex-1'>
									<p className='text-slate-600 text-sm font-medium mb-1'>
										Sold Listings
									</p>
									<p className='text-3xl font-bold text-cyan-600 mb-1'>
										{soldListings}
									</p>
									<div className='flex items-center gap-1 text-xs text-slate-500'>
										<ShoppingBag size={12} />
										<span>Sold</span>
									</div>
								</div>
								<div className='w-14 h-14 rounded-xl bg-linear-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/20'>
									<ShoppingBag
										size={24}
										className='text-white'
									/>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Filter Tabs */}
				<div className='flex w-[360px] md:w-full items-center gap-3 mb-6 overflow-x-auto pb-2'>
					<div className='flex items-center gap-2 text-slate-600 text-sm font-medium'>
						<Filter size={18} />
						<span>Filter:</span>
					</div>
					{["all", "active", "pending", "rejected", "sold"].map(
						(status) => {
							const count =
								status === "all"
									? listings.length
									: listings.filter(
											(l: any) => l.status === status
									  ).length;
							return (
								<Button
									key={status}
									onClick={() => setFilter(status)}
									variant='ghost'
									className={`relative cursor-pointer transition-all duration-200 gap-2 h-10 px-4 ${
										filter === status
											? "bg-linear-to-r from-sky-500 to-blue-500 text-white shadow-lg shadow-sky-500/30 hover:from-sky-600 hover:to-blue-600"
											: "border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300"
									}`}>
									<span className='font-medium'>
										{status.charAt(0).toUpperCase() +
											status.slice(1)}
									</span>
									{filter === status && (
										<span className='ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs font-semibold'>
											{count}
										</span>
									)}
								</Button>
							);
						}
					)}
				</div>

				{/* Listings Grid */}
				<div className='grid grid-cols-1 gap-4 md:gap-6'>
					{loading ? (
						<Card className='bg-white border border-slate-200 shadow-lg'>
							<CardContent className='p-16 text-center'>
								<Loader2
									className='animate-spin mx-auto mb-4 text-sky-500'
									size={32}
								/>
								<p className='text-slate-600 font-medium'>
									Loading listings...
								</p>
							</CardContent>
						</Card>
					) : filteredListings.length > 0 ? (
						filteredListings.map((listing: any) => {
							const statusConfig = getStatusConfig(
								listing.status
							);
							const StatusIcon = statusConfig.icon;
							return (
								<Card
									key={listing._id}
									className='bg-white w-[360px] md:w-full border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 '>
									<CardContent className='p-6'>
										<div className='flex flex-col lg:flex-row gap-6'>
											{/* Thumbnail Section */}

											<div className='md:w-60'>
												<div className='relative w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100'>
													<img
														src={
															listing.thumbnail ||
															"/deelzobanner.png"
														}
														alt={listing.title}
														className='w-full h-full max-h-[430px] object-cover group-hover:scale-105 transition-transform duration-300'
													/>
													<div className='absolute top-3 right-3'>
														<div
															className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${statusConfig.bg} shadow-sm`}>
															<StatusIcon
																size={14}
																className={
																	statusConfig.iconColor
																}
															/>
															<span className='text-xs font-semibold capitalize'>
																{listing.status}
															</span>
														</div>
													</div>
												</div>
											</div>

											{/* Content Section */}
											<div className='flex-1 min-w-0'>
												{/* Header */}
												<div className='mb-4'>
													<h3 className='text-xl md:text-2xl font-bold text-slate-900 mb-2 group-hover:text-sky-600 transition-colors'>
														{listing.title}
													</h3>
													<p className='text-slate-600 mb-3 line-clamp-2'>
														{listing.description}
													</p>
													<div className='flex items-center gap-3 flex-wrap'>
														<span className='px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold border border-slate-200'>
															{listing.category}
														</span>
														{listing.seller && (
															<div className='flex items-center gap-2 text-sm text-slate-600'>
																<Users
																	size={14}
																/>
																<span>
																	{
																		listing
																			.seller
																			.name
																	}
																</span>
															</div>
														)}
													</div>
												</div>

												{/* Key Info Grid */}
												<div className='grid grid-cols-2 md:grid-cols-4 gap-3 mb-4'>
													<div className='bg-linear-to-br from-emerald-50 to-emerald-100/50 rounded-lg p-3 border border-emerald-100'>
														<p className='text-xs text-slate-600 mb-1 font-medium flex items-center gap-1'>
															<DollarSign
																size={12}
																className='text-emerald-600'
															/>
															Price
														</p>
														<p className='text-sm font-bold text-emerald-700'>
															$
															{listing.price?.toLocaleString() ||
																"0"}
														</p>
													</div>
													<div className='bg-slate-50 rounded-lg p-3 border border-slate-100'>
														<p className='text-xs text-slate-500 mb-1 font-medium flex items-center gap-1'>
															<EyeIcon
																size={12}
															/>
															Views
														</p>
														<p className='text-sm font-bold text-slate-900'>
															{listing.views || 0}
														</p>
													</div>
													<div className='bg-slate-50 rounded-lg p-3 border border-slate-100'>
														<p className='text-xs text-slate-500 mb-1 font-medium flex items-center gap-1'>
															<TrendingUp
																size={12}
															/>
															Bids
														</p>
														<p className='text-sm font-bold text-slate-900'>
															{listing.bids
																?.length || 0}
														</p>
													</div>
													<div className='bg-slate-50 rounded-lg p-3 border border-slate-100'>
														<p className='text-xs text-slate-500 mb-1 font-medium flex items-center gap-1'>
															<Calendar
																size={12}
															/>
															Created
														</p>
														<p className='text-sm font-bold text-slate-900'>
															{listing.createdAt
																? new Date(
																		listing.createdAt
																  ).toLocaleDateString()
																: "N/A"}
														</p>
													</div>
												</div>

												{/* Metrics Section */}
												{listing.metrics && (
													<div className='grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-linear-to-br from-slate-50 to-blue-50/30 rounded-xl border border-slate-200 shadow-sm mb-4'>
														{listing.metrics
															.monthlyRevenue && (
															<div className='bg-white/60 rounded-lg p-3 border border-white/80'>
																<p className='text-xs text-slate-600 mb-1 font-medium flex items-center gap-1'>
																	<DollarSign
																		size={
																			12
																		}
																		className='text-emerald-600'
																	/>
																	Monthly
																	Revenue
																</p>
																<p className='text-sm font-bold text-slate-900'>
																	$
																	{listing.metrics.monthlyRevenue.toLocaleString()}
																</p>
															</div>
														)}
														{listing.metrics
															.monthlyTraffic && (
															<div className='bg-white/60 rounded-lg p-3 border border-white/80'>
																<p className='text-xs text-slate-600 mb-1 font-medium flex items-center gap-1'>
																	<EyeIcon
																		size={
																			12
																		}
																		className='text-blue-600'
																	/>
																	Monthly
																	Traffic
																</p>
																<p className='text-sm font-bold text-slate-900'>
																	{listing.metrics.monthlyTraffic.toLocaleString()}
																</p>
															</div>
														)}
														{listing.metrics
															.followers && (
															<div className='bg-white/60 rounded-lg p-3 border border-white/80'>
																<p className='text-xs text-slate-600 mb-1 font-medium flex items-center gap-1'>
																	<Users
																		size={
																			12
																		}
																		className='text-purple-600'
																	/>
																	Followers
																</p>
																<p className='text-sm font-bold text-slate-900'>
																	{listing.metrics.followers.toLocaleString()}
																</p>
															</div>
														)}
														{listing.metrics
															.country && (
															<div className='bg-white/60 rounded-lg p-3 border border-white/80'>
																<p className='text-xs text-slate-600 mb-1 font-medium flex items-center gap-1'>
																	<MapPin
																		size={
																			12
																		}
																		className='text-rose-600'
																	/>
																	Country
																</p>
																<p className='text-sm font-bold text-slate-900'>
																	{
																		listing
																			.metrics
																			.country
																	}
																</p>
															</div>
														)}
														{listing.metrics
															.assetLink && (
															<div className='bg-white/60 rounded-lg p-3 border border-white/80 col-span-2 md:col-span-4'>
																<p className='text-xs text-slate-600 mb-1 font-medium flex items-center gap-1'>
																	<LinkIcon
																		size={
																			12
																		}
																		className='text-sky-600'
																	/>
																	Asset Link
																</p>
																<a
																	href={
																		listing
																			.metrics
																			.assetLink
																	}
																	target='_blank'
																	rel='noopener noreferrer'
																	className='text-sm font-semibold text-sky-600 hover:text-sky-700 truncate block'>
																	{
																		listing
																			.metrics
																			.assetLink
																	}
																</a>
															</div>
														)}
													</div>
												)}

												{/* Action Buttons */}
												<div className='flex flex-wrap gap-2 pt-4 border-t border-slate-200'>
													<Link
														target='_blank'
														href={`/marketplace/${
															listing?.slug ||
															listing?._id
														}`}>
														<Button
															variant='outline'
															size='sm'
															className='border-slate-200 text-slate-700 hover:bg-slate-50 gap-1.5'>
															<Eye size={16} />
															Preview
														</Button>
													</Link>

													<div className='relative group'>
														<Button
															variant='outline'
															size='sm'
															className='border-blue-200 text-blue-700 hover:bg-blue-50 gap-1.5'>
															Status
															<ChevronDown
																size={16}
															/>
														</Button>
														<div className='absolute left-0 mt-1 w-40 bg-white rounded-lg shadow-xl border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all'>
															{[
																"active",
																"pending",
																"sold",
																"draft",
																"rejected",
															].map((status) => {
																const config =
																	getStatusConfig(
																		status
																	);
																const Icon =
																	config.icon;
																return (
																	<button
																		key={
																			status
																		}
																		onClick={() =>
																			handleUpdateStatus(
																				listing._id,
																				status
																			)
																		}
																		disabled={
																			updating ===
																			listing._id
																		}
																		className='w-full text-left cursor-pointer px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 first:rounded-t-lg last:rounded-b-lg transition-colors disabled:opacity-50 flex items-center gap-2'>
																		<Icon
																			size={
																				14
																			}
																			className={
																				config.iconColor
																			}
																		/>
																		{status
																			.charAt(
																				0
																			)
																			.toUpperCase() +
																			status.slice(
																				1
																			)}
																	</button>
																);
															})}
														</div>
													</div>

													<Link
														href={`/dashboard/edit-listing/${listing._id}`}>
														<Button
															variant='outline'
															size='sm'
															className='border-sky-200 text-sky-700 hover:bg-sky-50 gap-1.5'>
															<Edit2 size={16} />
															Edit
														</Button>
													</Link>

													<Button
														variant='destructive'
														size='sm'
														onClick={() =>
															handleDeleteListing(
																listing._id
															)
														}
														disabled={
															deleting ===
															listing._id
														}
														className='bg-linear-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white gap-1.5 shadow-lg shadow-rose-500/20'>
														{deleting ===
														listing._id ? (
															<Loader2
																size={16}
																className='animate-spin'
															/>
														) : (
															<Trash2 size={16} />
														)}
														Delete
													</Button>
												</div>
											</div>
										</div>
									</CardContent>
								</Card>
							);
						})
					) : (
						<Card className='bg-white border border-slate-200 shadow-lg'>
							<CardContent className='p-16 text-center'>
								<AlertCircle
									className='mx-auto mb-4 text-slate-400'
									size={48}
								/>
								<p className='text-slate-600 font-medium text-lg mb-2'>
									{searchTerm
										? "No listings found"
										: "No listings available"}
								</p>
								{searchTerm && (
									<p className='text-slate-500 text-sm'>
										Try adjusting your search or filter
										criteria
									</p>
								)}
							</CardContent>
						</Card>
					)}
				</div>
			</main>
		</div>
	);
}
