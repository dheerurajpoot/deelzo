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
	ChevronLeft,
	ChevronRight,
	Tag,
	Activity,
	Layers,
	ShieldCheck,
	History,
	HardDrive,
} from "lucide-react";
import AdminSidebar from "@/components/admin-sidebar";
import { toast } from "sonner";
import { userContext } from "@/context/userContext";
import axios from "axios";
import { listingService } from "@/services/listingService";
import Link from "next/link";
import Image from "next/image";

export default function AdminListingsPage() {
	const { user } = userContext();
	const [listings, setListings] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState("all");
	const [searchTerm, setSearchTerm] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [paginationData, setPaginationData] = useState<any>(null);
	const [statsData, setStatsData] = useState<any>(null);
	const [deleting, setDeleting] = useState<any>(null);
	const [updating, setUpdating] = useState<any>(null);

	const fetchListings = async () => {
		try {
			if (!user) return;
			setLoading(true);
            
            // Use listingService with filters
            const filters: any = {
                page: currentPage,
                limit: 15,
                search: searchTerm,
            };
            if (filter !== "all") filters.status = filter;

            const result = await listingService.getListings(filters);
			setListings(result.listings || []);
			setPaginationData(result.pagination);
            
            // Calculate Stats manually
            const all = await listingService.getListings({ limit: 1000 });
            setStatsData({
                totalListings: all.total,
                activeListings: all.listings.filter(l => l.status === 'active').length,
                pendingListings: all.listings.filter(l => l.status === 'pending').length,
                rejectedListings: all.listings.filter(l => l.status === 'rejected').length,
                soldListings: all.listings.filter(l => l.status === 'sold').length,
                totalMarketplaceValue: all.listings.reduce((acc, l) => acc + (l.price || 0), 0)
            });
		} catch (error) {
			console.error("Failed to fetch listings:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchListings();
	}, [user, currentPage, searchTerm, filter]);

	useEffect(() => {
		currentPage !== 1 && setCurrentPage(1);
	}, [searchTerm, filter]);

	const handleDeleteListing = async (listingId: string) => {
		if (!window.confirm("Are you sure you want to delete this listing?"))
			return;

		setDeleting(listingId);
		try {
            await listingService.deleteListing(listingId);
            toast.success("Listing deleted successfully");
            await fetchListings();
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
            await listingService.updateListing(listingId, { status: newStatus as any });
            toast.success("Status updated successfully");
            await fetchListings();
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

	const filteredListings = listings;

	const totalListingsCount = statsData?.totalListings || 0;
	const activeListingsCount = statsData?.activeListings || 0;
	const pendingListingsCount = statsData?.pendingListings || 0;
	const rejectedListingsCount = statsData?.rejectedListings || 0;
	const soldListingsCount = statsData?.soldListings || 0;
	const totalMarketplaceValue = statsData?.totalMarketplaceValue || 0;

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
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 mb-8'>
					<Card className='bg-linear-to-br from-slate-900 to-slate-800 border-none shadow-xl relative overflow-hidden group'>
						<div className='absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors' />
						<CardContent className='p-6'>
							<div className='flex items-center justify-between relative z-10'>
								<div className='flex-1'>
									<p className='text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1'>
										Market Value
									</p>
									<p className='text-2xl font-black text-white mb-1'>
										${totalMarketplaceValue.toLocaleString()}
									</p>
									<div className='flex items-center gap-1 text-xs text-emerald-400 uppercase font-black'>
										<TrendingUp size={12} />
										<span>Live Value</span>
									</div>
								</div>
								<div className='w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10'>
									<DollarSign size={20} className='text-emerald-400' />
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className='bg-white border-slate-200 shadow-xl shadow-slate-200/20 hover:shadow-slate-300/30 transition-all duration-300 relative overflow-hidden group'>
						<CardContent className='p-6 cursor-default transition-colors'>
							<div className='flex items-center justify-between'>
								<div className='flex-1'>
									<p className='text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1'>
										Active Inventory
									</p>
									<p className='text-3xl font-black text-slate-900 mb-1'>
										{activeListingsCount}
									</p>
									<div className='flex items-center gap-1.5 text-xs text-sky-600 font-bold'>
										<Globe size={12} />
										<span>Public Views</span>
									</div>
								</div>
								<div className='w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center group-hover:bg-sky-500 transition-all duration-300'>
									<Globe size={20} className='text-sky-500 group-hover:text-white transition-colors' />
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className='bg-white border-slate-200 shadow-xl shadow-slate-200/20 hover:shadow-slate-300/30 transition-all duration-300 relative overflow-hidden group'>
						<CardContent className='p-6'>
							<div className='flex items-center justify-between'>
								<div className='flex-1'>
									<p className='text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1'>
										Pending Review
									</p>
									<p className='text-3xl font-black text-amber-600 mb-1'>
										{pendingListingsCount}
									</p>
									<div className='flex items-center gap-1.5 text-xs text-amber-600 font-bold'>
										<Clock size={12} />
										<span>Needs Approval</span>
									</div>
								</div>
								<div className='w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center group-hover:bg-amber-500 transition-all duration-300'>
									<Clock size={20} className='text-amber-500 group-hover:text-white transition-colors' />
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className='bg-white border-slate-200 shadow-xl shadow-slate-200/20 hover:shadow-slate-300/30 transition-all duration-300 relative overflow-hidden group'>
						<CardContent className='p-6'>
							<div className='flex items-center justify-between'>
								<div className='flex-1'>
									<p className='text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1'>
										Successful Sales
									</p>
									<p className='text-3xl font-black text-blue-600 mb-1'>
										{soldListingsCount}
									</p>
									<div className='flex items-center gap-1.5 text-xs text-blue-600 font-bold'>
										<ShoppingBag size={12} />
										<span>Transferred</span>
									</div>
								</div>
								<div className='w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-500 transition-all duration-300'>
									<ShoppingBag size={20} className='text-blue-500 group-hover:text-white transition-colors' />
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className='bg-white border-slate-200 shadow-xl shadow-slate-200/20 hover:shadow-slate-300/30 transition-all duration-300 relative overflow-hidden group'>
						<CardContent className='p-6'>
							<div className='flex items-center justify-between'>
								<div className='flex-1'>
									<p className='text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1'>
										Total Impact
									</p>
									<p className='text-3xl font-black text-slate-900 mb-1'>
										{totalListingsCount}
									</p>
									<div className='flex items-center gap-1.5 text-xs text-slate-500 font-bold'>
										<FileText size={12} />
										<span>Total Requests</span>
									</div>
								</div>
								<div className='w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-slate-900 transition-all duration-300'>
									<FileText size={20} className='text-slate-600 group-hover:text-white transition-colors' />
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Filter Tabs */}
				<div className='flex w-full items-center gap-2 mb-8 overflow-x-auto pb-4'>
					{["all", "active", "pending", "rejected", "sold"].map(
						(status) => {
							const counts: any = {
								all: totalListingsCount,
								active: activeListingsCount,
								pending: pendingListingsCount,
								rejected: rejectedListingsCount,
								sold: soldListingsCount,
							};
							const active = filter === status;
							return (
								<button
									key={status}
									onClick={() => setFilter(status)}
									className={`flex items-center gap-3 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border whitespace-nowrap ${
										active
											? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/20"
											: "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
									}`}>
									<span className='capitalize'>
										{status}
									</span>
									<span className={`px-2 py-0.5 rounded-lg text-[10px] ${active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
										{counts[status]}
									</span>
								</button>
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
									className='bg-white overflow-hidden border border-slate-200 shadow-lg hover:shadow-2xl transition-all duration-500 group'>
									<CardContent className='p-0'>
										<div className='flex flex-col lg:flex-row'>
											{/* Thumbnail Section - More Compact */}
											<div className='lg:w-60 relative overflow-hidden bg-slate-100 border-r border-slate-100 shrink-0'>
												<Image
													width={200}
													height={100}
													src={
														listing.thumbnail ||
														"/deelzobanner.png"
													}
													alt={listing.title}
													className='h-65 w-60 object-cover transition-transform duration-700 group-hover:scale-110'
												/>
												<div className='absolute top-3 left-3'>
													<span className='px-2 py-0.5 bg-white/95 backdrop-blur-md text-slate-900 rounded-md text-[9px] font-black uppercase tracking-widest shadow-sm border border-white'>
														{listing.category}
													</span>
												</div>
												<div className='absolute bottom-3 left-3'>
													<div
														className={`flex items-center gap-1 px-2 py-1 rounded-full backdrop-blur-md border shadow-lg ${statusConfig.bg.replace("bg-", "bg-opacity-90 bg-")}`}>
														<StatusIcon
															size={10}
															className={
																statusConfig.iconColor
															}
														/>
														<span className='text-[9px] font-bold uppercase'>
															{listing.status}
														</span>
													</div>
												</div>
											</div>

											{/* Content Section */}
											<div className='flex-1 p-5 md:p-6 lg:p-7 flex flex-col'>
												<div className='flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4'>
													<div className='flex-1 min-w-0'>
														<h3 className='text-lg md:text-xl font-black text-slate-900 mb-1 leading-tight group-hover:text-blue-600 transition-colors truncate'>
															{listing.title}
														</h3>
														<div className='flex items-center gap-3'>
															<div className='flex items-center gap-1.5 text-[10px] font-bold text-slate-500'>
																<Users size={12} className='text-slate-400' />
																{listing.seller?.name || "Anonymous"}
															</div>
															<span className='text-slate-200'>|</span>
															<div className='flex items-center gap-1.5 text-[10px] font-bold text-slate-500'>
																<Calendar size={12} className='text-slate-400' />
																{new Date(listing.createdAt).toLocaleDateString()}
															</div>
														</div>
													</div>
													<div className='md:text-right shrink-0'>
														<p className='text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5'>Market Price</p>
														<p className='text-2xl font-black text-slate-900'>${listing.price?.toLocaleString()}</p>
													</div>
												</div>

												{/* All Details Display Grid */}
												<div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6'>
													{/* Metrics */}
													<div className='bg-slate-50/50 rounded-xl p-2.5 border border-slate-100'>
														<p className='text-[8px] font-black text-slate-400 uppercase mb-1.5 flex items-center gap-1'>
															<Activity size={10} className='text-blue-500' />
															Traffic
														</p>
														<p className='text-xs font-black text-slate-800'>{listing.metrics?.monthlyTraffic?.toLocaleString() || "N/A"}</p>
													</div>
													<div className='bg-slate-50/50 rounded-xl p-2.5 border border-slate-100'>
														<p className='text-[8px] font-black text-slate-400 uppercase mb-1.5 flex items-center gap-1'>
															<TrendingUp size={10} className='text-indigo-500' />
															Offers
														</p>
														<p className='text-xs font-black text-slate-800'>{listing.bids?.length || 0}</p>
													</div>
													<div className='bg-slate-50/50 rounded-xl p-2.5 border border-slate-100'>
														<p className='text-[8px] font-black text-slate-400 uppercase mb-1.5 flex items-center gap-1'>
															<DollarSign size={10} className='text-emerald-500' />
															Revenue
														</p>
														<p className='text-xs font-black text-slate-800'>${listing.metrics?.monthlyRevenue?.toLocaleString() || "0"}</p>
													</div>
													
													{/* Technical Details */}
													<div className='bg-slate-50/50 rounded-xl p-2.5 border border-slate-100'>
														<p className='text-[8px] font-black text-slate-400 uppercase mb-1.5 flex items-center gap-1'>
															<Tag size={10} className='text-sky-500' />
															Niche
														</p>
														<p className='text-xs font-black text-slate-800 truncate' title={listing.details?.niche}>{listing.details?.niche || "N/A"}</p>
													</div>
													<div className='bg-slate-50/50 rounded-xl p-2.5 border border-slate-100'>
														<p className='text-[8px] font-black text-slate-400 uppercase mb-1.5 flex items-center gap-1'>
															<HardDrive size={10} className='text-rose-500' />
															Source
														</p>
														<p className='text-xs font-black text-slate-800 truncate'>{listing.details?.trafficSource || "Organic"}</p>
													</div>
													<div className='bg-slate-50/50 rounded-xl p-2.5 border border-slate-100'>
														<p className='text-[8px] font-black text-slate-400 uppercase mb-1.5 flex items-center gap-1'>
															<Layers size={10} className='text-purple-500' />
															Platform
														</p>
														<p className='text-xs font-black text-slate-800 truncate'>{listing.details?.platform || "Web"}</p>
													</div>
												</div>

												<div className='flex flex-wrap items-center justify-between gap-4 pt-5 mt-auto border-t border-slate-100'>
													<div className='flex flex-wrap gap-2'>
														<Link target='_blank' href={`/marketplace/${listing.slug || listing._id}`}>
															<Button variant='outline' size='sm' className='h-9 px-3 rounded-lg border-slate-200 text-slate-600 font-bold hover:bg-slate-50 text-[10px] gap-1.5'>
																<Eye size={14} /> View
															</Button>
														</Link>
														<Link href={`/dashboard/edit-listing/${listing._id}`}>
															<Button variant='outline' size='sm' className='h-9 px-3 rounded-lg border-slate-200 text-slate-600 font-bold hover:bg-slate-50 text-[10px] gap-1.5'>
																<Edit2 size={14} /> Edit
															</Button>
														</Link>
													</div>

													<div className='flex flex-wrap gap-2'>
														<div className='relative group/status'>
															<Button variant='outline' size='sm' className='h-9 px-3 rounded-lg border-blue-200 text-blue-700 font-bold hover:bg-blue-50 text-[10px] gap-1.5'>
																Change Status <ChevronDown size={14} />
															</Button>
															<div className='absolute right-0 bottom-full mb-2 w-44 bg-white rounded-xl shadow-2xl border border-slate-100 opacity-0 invisible group-hover/status:opacity-100 group-hover/status:visible transition-all duration-300 z-10 p-1.5'>
																{["active", "pending", "sold", "draft", "rejected"].map((status) => {
																	const config = getStatusConfig(status);
																	const Icon = config.icon;
																	return (
																		<button
																			key={status}
																			onClick={() => handleUpdateStatus(listing._id, status)}
																			className='w-full text-left cursor-pointer px-3 py-2 text-[10px] font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors flex items-center justify-between'>
																			<div className='flex items-center gap-2'>
																				<Icon size={12} className={config.iconColor} />
																				<span className='capitalize'>{status}</span>
																			</div>
																			{listing.status === status && <CheckCircle size={10} className='text-emerald-500' />}
																		</button>
																	);
																})}
															</div>
														</div>
														<Button
															variant='destructive'
															size='sm'
															onClick={() => handleDeleteListing(listing._id)}
															className='h-9 px-4 rounded-lg bg-linear-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-[10px] gap-1.5 shadow-md shadow-rose-500/10'>
															<Trash2 size={14} /> Delete
														</Button>
													</div>
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

					{/* Pagination Footer */}
					{paginationData && paginationData.totalPages > 1 && (
						<div className='mt-8 px-6 py-6 bg-white border border-slate-200 rounded-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6'>
							<div className='text-xs font-bold text-slate-500 uppercase tracking-widest'>
								Showing <span className='text-slate-900'>{(currentPage - 1) * 15 + 1}</span> to <span className='text-slate-900'>{Math.min(currentPage * 15, paginationData.totalListings)}</span> of <span className='text-slate-900'>{paginationData.totalListings}</span> Marketplace Assets
							</div>
							<div className='flex items-center gap-2'>
								<Button
									variant='outline'
									size='sm'
									onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
									disabled={currentPage === 1}
									className='h-12 w-12 p-0 rounded-xl border-slate-200 text-slate-600 disabled:opacity-50 transition-all hover:bg-slate-50 hover:shadow-md'
								>
									<ChevronLeft size={20} />
								</Button>
								
								<div className='flex items-center gap-1.5'>
									{Array.from({ length: Math.min(5, paginationData.totalPages) }, (_, i) => {
										let pageNum;
										if (paginationData.totalPages <= 5) {
											pageNum = i + 1;
										} else {
											if (currentPage <= 3) pageNum = i + 1;
											else if (currentPage >= paginationData.totalPages - 2) pageNum = paginationData.totalPages - 4 + i;
											else pageNum = currentPage - 2 + i;
										}
										
										const active = currentPage === pageNum;
										return (
											<button
												key={pageNum}
												onClick={() => setCurrentPage(pageNum)}
												className={`h-12 w-12 rounded-xl text-sm font-black transition-all ${
													active
														? "bg-slate-900 text-white shadow-2xl shadow-slate-900/40"
														: "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
												}`}
											>
												{pageNum}
											</button>
										);
									})}
								</div>

								<Button
									variant='outline'
									size='sm'
									onClick={() => setCurrentPage(prev => Math.min(paginationData.totalPages, prev + 1))}
									disabled={currentPage === paginationData.totalPages}
									className='h-12 w-12 p-0 rounded-xl border-slate-200 text-slate-600 disabled:opacity-50 transition-all hover:bg-slate-50 hover:shadow-md'
								>
									<ChevronRight size={20} />
								</Button>
							</div>
						</div>
					)}
				</div>
			</main>
		</div>
	);
}
