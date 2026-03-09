"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Search,
	TrendingUp,
	Eye,
	MapPin,
	DollarSign,
	Star,
	Filter,
	X,
	ChevronLeft,
	ChevronRight,
	Loader2,
	AlertCircle,
	Grid3x3,
} from "lucide-react";
import axios from "axios";

const categories = [
	"All",
	"Website",
	"YouTube Channel",
	"Facebook Page",
	"Instagram Page",
	"TikTok Account",
	"Twitter Account",
	"Play Console",
	"AdSense Dashboard",
	"Shopify Store",
	"Dropshipping Store",
	"SaaS",
	"Mobile App",
	"Other",
];

export default function Marketplace() {
	const [listings, setListings] = useState([]);
	const [loading, setLoading] = useState(true);
	const [selectedCategory, setSelectedCategory] = useState("All");
	const [searchTerm, setSearchTerm] = useState("");
	const [page, setPage] = useState(1);

	useEffect(() => {
		const fetchListings = async () => {
			setLoading(true);
			try {
				const query = new URLSearchParams();
				if (selectedCategory !== "All")
					query.append("category", selectedCategory);
				query.append("page", page.toString());

				const response = await axios.get(`/api/listings?${query}`);
				const data = await response.data;
				setListings(data.listings || []);
			} catch (error) {
				console.error("Failed to fetch listings:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchListings();
	}, [selectedCategory, page]);

	const filteredListings = listings.filter((listing: any) =>
		listing.title.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<div className='min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100'>
			<div className='max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8'>
				{/* Header */}
				<div className='mb-6 md:mb-8'>
					<div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6'>
						<div>
							<h1 className='text-2xl md:text-4xl lg:text-5xl font-bold bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent mb-2'>
								Digital Assets Marketplace
							</h1>
							<p className='text-slate-600 text-base md:text-lg'>
								Discover and purchase high-quality digital
								properties
							</p>
						</div>
						{filteredListings.length > 0 && (
							<div className='flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-slate-200 shadow-sm'>
								<Grid3x3 size={18} className='text-slate-500' />
								<span className='text-sm font-semibold text-slate-700'>
									{filteredListings.length}{" "}
									{filteredListings.length === 1
										? "listing"
										: "listings"}
								</span>
							</div>
						)}
					</div>

					{/* Search */}
					<div className='mb-6'>
						<div className='relative max-w-2xl'>
							<Search
								className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400'
								size={20}
							/>
							<Input
								placeholder='Search listings by title, category, or description...'
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className='pl-10 pr-10 h-12 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-sky-500/20 text-base'
							/>
							{searchTerm && (
								<button
									onClick={() => setSearchTerm("")}
									className='absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors'>
									<X size={18} />
								</button>
							)}
						</div>
					</div>

					{/* Categories */}
					<div className='mb-6 md:mb-8'>
						<div className='flex items-center gap-2 mb-3'>
							<Filter size={18} className='text-slate-600' />
							<span className='text-sm font-semibold text-slate-700'>
								Filter by Category:
							</span>
						</div>
						<div className='overflow-x-auto pb-2 -mx-2 px-2'>
							<div className='flex gap-2 min-w-max'>
								{categories.map((cat) => (
									<Button
										key={cat}
										onClick={() => {
											setSelectedCategory(cat);
											setPage(1);
										}}
										variant='ghost'
										size='sm'
										className={`relative whitespace-nowrap cursor-pointer transition-all duration-200 gap-2 h-9 px-4 ${
											selectedCategory === cat
												? "bg-linear-to-r from-sky-500 to-blue-500 text-white shadow-lg shadow-sky-500/30 hover:from-sky-600 hover:to-blue-600"
												: "border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300"
										}`}>
										{cat}
										{selectedCategory === cat && (
											<span className='ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs font-semibold'>
												{filteredListings.length}
											</span>
										)}
									</Button>
								))}
							</div>
						</div>
					</div>

					{/* Listings Grid */}
					{loading ? (
						<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6'>
							{[...Array(12)].map((_, i) => (
								<Card
									key={i}
									className='bg-white border border-slate-200 overflow-hidden shadow-lg'>
									<CardContent className='p-0'>
										<div className='w-full h-48 bg-slate-200 animate-pulse' />
										<div className='p-4 space-y-3'>
											<div className='h-4 w-3/4 bg-slate-200 rounded animate-pulse' />
											<div className='h-3 w-1/2 bg-slate-200 rounded animate-pulse' />
											<div className='h-6 w-1/3 bg-slate-200 rounded animate-pulse' />
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					) : filteredListings.length > 0 ? (
						<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6'>
							{filteredListings.map((listing: any) => (
								<Link
									key={listing._id}
									href={`/marketplace/${
										listing.slug || listing._id
									}`}
									className='group'>
									<Card className='bg-white p-0 border border-slate-200 hover:border-sky-500 transition-all duration-300 hover:shadow-xl hover:shadow-sky-500/10 overflow-hidden h-full flex flex-col gap-1 cursor-pointer hover:-translate-y-1'>
										{/* Image */}
										<div className='relative w-full h-48 overflow-hidden bg-linear-to-br from-slate-100 to-slate-200'>
											{listing.thumbnail ||
											(listing.images &&
												listing.images[0]) ? (
												<img
													src={
														listing.thumbnail ||
														listing.images[0]
													}
													alt={listing.title}
													className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
												/>
											) : (
												<div className='w-full h-full flex items-center justify-center'>
													<TrendingUp
														size={40}
														className='text-sky-500'
													/>
												</div>
											)}
											{/* Status Badge */}
											<div className='absolute top-2 right-2'>
												<span
													className={`${
														listing.status ===
														"sold"
															? "bg-rose-500/90 text-white"
															: listing.status ===
															  "active"
															? "bg-emerald-500/90 text-white"
															: "bg-amber-500/90 text-white"
													} text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm shadow-lg capitalize`}>
													{listing.status}
												</span>
											</div>
											{/* Featured Badge */}
											{listing.featured && (
												<div className='absolute top-2 left-2'>
													<span className='bg-linear-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm shadow-lg flex items-center gap-1'>
														<Star
															size={12}
															fill='currentColor'
														/>
														Featured
													</span>
												</div>
											)}
										</div>

										{/* Content */}
										<CardContent className='p-4 md:p-5 flex-1 flex flex-col'>
											{/* Title & Category */}
											<div className='mb-3'>
												<h3 className='text-slate-900 font-bold text-base md:text-lg mb-2 line-clamp-2 group-hover:text-sky-600 transition-colors'>
													{listing.title}
												</h3>
												<div className='flex items-center gap-2'>
													<span className='px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold border border-slate-200'>
														{listing.category}
													</span>
												</div>
											</div>

											{/* Price */}
											<div className='mb-3'>
												<div className='flex items-baseline gap-1'>
													<DollarSign
														size={18}
														className='text-emerald-600'
													/>
													<span className='text-2xl md:text-3xl font-bold text-emerald-600'>
														{Number(
															listing.price || 0
														).toLocaleString()}
													</span>
												</div>
											</div>

											{/* Metrics Grid */}
											<div className='grid grid-cols-2 gap-2 mb-3 flex-1'>
												{listing.metrics
													?.monthlyRevenue >= 0 && (
													<div className='bg-linear-to-br from-emerald-50 to-emerald-100/50 rounded-lg p-2 border border-emerald-100'>
														<p className='text-[10px] text-slate-600 mb-0.5 font-medium'>
															Revenue/Month
														</p>
														<p className='text-xs font-bold text-emerald-700'>
															$
															{Number(
																listing.metrics
																	.monthlyRevenue
															).toLocaleString()}
														</p>
													</div>
												)}
												{listing.metrics
													?.monthlyTraffic && (
													<div className='bg-slate-50 rounded-lg p-2 border border-slate-100'>
														<p className='text-[10px] text-slate-600 mb-0.5 font-medium'>
															Traffic/Month
														</p>
														<p className='text-xs font-bold text-slate-900'>
															{Number(
																listing.metrics
																	.monthlyTraffic
															).toLocaleString()}
														</p>
													</div>
												)}
												{listing.metrics?.followers && (
													<div className='bg-slate-50 rounded-lg p-2 border border-slate-100'>
														<p className='text-[10px] text-slate-600 mb-0.5 font-medium'>
															Followers
														</p>
														<p className='text-xs font-bold text-slate-900'>
															{Number(
																listing.metrics
																	.followers
															).toLocaleString()}
														</p>
													</div>
												)}
												{listing.metrics?.age && (
													<div className='bg-slate-50 rounded-lg p-2 border border-slate-100'>
														<p className='text-[10px] text-slate-600 mb-0.5 font-medium'>
															Age
														</p>
														<p className='text-xs font-bold text-slate-900'>
															{Number(
																listing.metrics
																	.age
															)}{" "}
															mo
														</p>
													</div>
												)}
												{listing.details
													?.monetization && (
													<div className='bg-slate-50 rounded-lg p-2 border border-slate-100 col-span-2'>
														<p className='text-[10px] text-slate-600 mb-0.5 font-medium'>
															Monetization
														</p>
														<p className='text-xs font-bold text-slate-900'>
															{
																listing.details
																	.monetization
															}
														</p>
													</div>
												)}
											</div>

											{/* Bottom Info */}
											<div className='flex items-center justify-between pt-3 border-t border-slate-200'>
												{listing.metrics?.country && (
													<div className='flex items-center gap-1 text-xs text-slate-600'>
														<MapPin
															size={12}
															className='text-slate-400'
														/>
														<span className='truncate max-w-[100px]'>
															{
																listing.metrics
																	.country
															}
														</span>
													</div>
												)}
												<div className='flex items-center gap-1 text-xs text-slate-500'>
													<Eye
														size={12}
														className='text-slate-400'
													/>
													<span>
														{listing.views || 0}
													</span>
												</div>
											</div>
										</CardContent>
									</Card>
								</Link>
							))}
						</div>
					) : (
						<Card className='bg-white border border-slate-200 shadow-lg'>
							<CardContent className='p-12 md:p-16 text-center'>
								<AlertCircle
									size={64}
									className='mx-auto text-slate-400 mb-4'
								/>
								<h3 className='text-xl md:text-2xl font-bold text-slate-900 mb-2'>
									No Listings Found
								</h3>
								<p className='text-slate-600 mb-4'>
									{searchTerm
										? "Try adjusting your search terms or clear filters to see more results."
										: selectedCategory !== "All"
										? `No listings found in "${selectedCategory}" category. Try selecting a different category.`
										: "No listings are available at the moment."}
								</p>
								{(searchTerm || selectedCategory !== "All") && (
									<Button
										onClick={() => {
											setSearchTerm("");
											setSelectedCategory("All");
										}}
										variant='outline'
										className='border-slate-200 text-slate-700 hover:bg-slate-50 gap-2'>
										<X size={16} />
										Clear Filters
									</Button>
								)}
							</CardContent>
						</Card>
					)}

					{/* Pagination */}
					{filteredListings.length > 0 && (
						<div className='flex flex-col sm:flex-row justify-center items-center gap-4 mt-8 md:mt-12'>
							<Button
								onClick={() => setPage(Math.max(1, page - 1))}
								disabled={page === 1}
								variant='outline'
								className='border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed gap-2 min-w-[120px]'>
								<ChevronLeft size={18} />
								Previous
							</Button>
							<div className='flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-slate-200 shadow-sm'>
								<span className='text-sm font-semibold text-slate-700'>
									Page {page}
								</span>
								{filteredListings.length > 0 && (
									<span className='text-xs text-slate-500'>
										({filteredListings.length}{" "}
										{filteredListings.length === 1
											? "item"
											: "items"}
										)
									</span>
								)}
							</div>
							<Button
								onClick={() => setPage(page + 1)}
								disabled={filteredListings.length < 12}
								className='bg-linear-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white shadow-lg shadow-sky-500/20 disabled:opacity-50 disabled:cursor-not-allowed gap-2 min-w-[120px]'>
								Next
								<ChevronRight size={18} />
							</Button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
