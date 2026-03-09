"use client";

import Head from "next/head";
import { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Star,
	Share2,
	TrendingUp,
	Calendar,
	MessageCircle,
	TrendingDown,
	Verified,
	Loader2,
	Copy,
	ChevronRight,
	Eye,
	DollarSign,
	MapPin,
	Users,
	FileText,
	CheckCircle,
	XCircle,
	Clock,
	AlertCircle,
	X,
	Phone,
	Link as LinkIcon,
	ArrowUpRight,
} from "lucide-react";
import axios from "axios";
import { userContext } from "@/context/userContext";
import Link from "next/link";
import { toast } from "sonner";
import { PHONE } from "@/lib/constant";

export default function ListingDetail({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id: slugOrId } = use(params);
	const { user } = userContext();
	const router = useRouter();
	const [listing, setListing] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [bidAmount, setBidAmount] = useState("");
	const [bidMessage, setBidMessage] = useState("");
	const [bids, setBids] = useState<any[]>([]);
	const [submittingBid, setSubmittingBid] = useState(false);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);

	const fetchListing = useCallback(async () => {
		try {
			const response = await axios.get(`/api/listings/${slugOrId}`);
			const data = await response.data;
			setListing(data);
			setBidAmount(data?.price.toString());
		} catch (error) {
			console.error("Failed to fetch listing:", error);
		} finally {
			setLoading(false);
		}
	}, [slugOrId]);
	useEffect(() => {
		fetchListing();
	}, [fetchListing]);

	const handlePlaceBid = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!user) {
			router.push("/login");
			return;
		}

		if (!bidAmount || !(Number(bidAmount) < listing?.price)) {
			alert("Bid amount must be at least the asking price");
			return;
		}

		setSubmittingBid(true);
		try {
			if (!listing?._id) {
				throw new Error("Listing not loaded");
			}

			const response = await axios.post("/api/bids", {
				listingId: listing._id,
				bidderId: user?._id,
				amount: Number.parseFloat(bidAmount),
				message: bidMessage,
			});

			if (response.data.success) {
				const newBid = await response.data;
				setBids([newBid, ...bids]);
				setBidAmount("");
				setBidMessage("");
				await fetchListing();
				toast.success("Bid placed successfully!");
			}
		} catch (error) {
			console.error("Failed to place bid:", error);
			toast.error("Failed to place bid");
		} finally {
			setSubmittingBid(false);
		}
	};

	const handleContactSeller = (phone: string) => {
		console.log(phone);
		if (!phone || !listing?.title) {
			alert("WhatsApp number not available or listing not found");
			return;
		}
		const message = `Hi, I'm interested in your listing: ${listing?.title}`;
		window.open(
			`https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
			"_blank"
		);
	};

	const sanitizeUrl = (url: string | undefined): string => {
		if (!url) return "";

		// Remove any whitespace
		let sanitized = url.trim();

		// If it already has a protocol, return as is
		if (/^https?:\/\//i.test(sanitized)) {
			return sanitized;
		}

		// If it starts with www., add https://
		if (/^www\./i.test(sanitized)) {
			return `https://${sanitized}`;
		}

		// Otherwise, add https://
		return `https://${sanitized}`;
	};

	if (loading) {
		return (
			<div className='flex items-center justify-center min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100'>
				<Loader2 className='h-12 w-12 animate-spin text-sky-600' />
			</div>
		);
	}

	if (!listing) {
		return (
			<div className='min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4'>
				<Card className='bg-white border border-slate-200 shadow-lg max-w-md w-full'>
					<CardContent className='p-8 text-center'>
						<AlertCircle className='h-16 w-16 text-slate-400 mx-auto mb-4' />
						<h1 className='text-2xl font-bold text-slate-900 mb-2'>
							Listing Not Found
						</h1>
						<p className='text-slate-600 mb-6'>
							The listing you're looking for doesn't exist or has
							been removed.
						</p>
						<Link href='/marketplace'>
							<Button className='bg-linear-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white'>
								Back to Marketplace
							</Button>
						</Link>
					</CardContent>
				</Card>
			</div>
		);
	}

	const breadcrumbs = [
		{ label: "Home", href: "/" },
		{ label: "Marketplace", href: "/marketplace" },
		{
			label: listing?.title.slice(0, 25) + "..." || "Listing",
			href: `/listing/${listing?.slug || slugOrId}`,
		},
	];

	return (
		<div className='min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 pb-24 md:pb-8'>
			<Head>
				<title>
					{listing.title} | {listing.category} | Deelzo.com
				</title>
				<meta
					name='description'
					content={
						listing.description?.substring(0, 160) ||
						"Check out this listing on Deelzo.com"
					}
					key='desc'
				/>
				<meta
					name='image'
					content={listing.thumbnail || "/deelzobanner.png"}
				/>
				<meta
					name='url'
					content={`${process.env.NEXT_PUBLIC_APP_URL}/listing/${
						listing.slug || slugOrId
					}`}
				/>
				<meta name='siteName' content='Deelzo.com' />
				<meta name='locale' content='en_US' />
				<meta name='type' content='website' />
			</Head>
			<div className='max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6'>
				{/* Header */}
				<div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6'>
					<nav className='flex items-center text-sm text-slate-600 gap-1 md:gap-2 flex-wrap'>
						{breadcrumbs.map((crumb, index) => (
							<div
								key={crumb.href}
								className='flex items-center gap-1 md:gap-2'>
								<Link
									href={crumb.href}
									className='hover:text-sky-600 transition-colors'>
									{crumb.label}
								</Link>
								{index < breadcrumbs.length - 1 && (
									<ChevronRight
										size={14}
										className='text-slate-400'
									/>
								)}
							</div>
						))}
					</nav>
				</div>

				<div className='grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8'>
					{/* Main Content */}
					<div className='lg:col-span-2 space-y-6'>
						{/* Hero Image / Thumbnail */}
						<Card className='bg-white border border-slate-200 p-0 overflow-hidden shadow-lg group'>
							<div className='relative w-full h-64 md:h-80 lg:h-96 bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden'>
								{listing?.thumbnail ? (
									<img
										src={listing.thumbnail}
										onClick={(e) => {
											e.preventDefault();
											setPreviewUrl(listing.thumbnail);
										}}
										alt={
											listing?.title ||
											"Listing thumbnail"
										}
										className='w-full h-full cursor-zoom-in object-cover group-hover:scale-105 transition-transform duration-500'
									/>
								) : (
									<div className='text-center'>
										<TrendingUp
											size={64}
											className='text-sky-500 mx-auto mb-2'
										/>
										<p className='text-slate-600 font-medium'>
											Asset Preview
										</p>
									</div>
								)}
								{listing?.category && (
									<span className='absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/95 text-slate-900 border border-slate-200 backdrop-blur shadow-lg'>
										{listing.category}
									</span>
								)}
								{listing?.status && (
									<span
										className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur shadow-lg ${
											listing.status === "sold"
												? "bg-rose-500/90 text-white"
												: listing.status === "active"
												? "bg-emerald-500/90 text-white"
												: "bg-amber-500/90 text-white"
										}`}>
										{listing.status
											.charAt(0)
											.toUpperCase() +
											listing.status.slice(1)}
									</span>
								)}
								{listing?.featured && (
									<span className='absolute top-4 left-1/2 transform -translate-x-1/2 px-3 py-1.5 rounded-full text-xs font-semibold bg-linear-to-r from-amber-500 to-orange-500 text-white backdrop-blur shadow-lg flex items-center gap-1'>
										<Star size={12} fill='currentColor' />
										Featured
									</span>
								)}
							</div>
						</Card>

						{/* Price card for mobile users */}
						<div className='block lg:hidden mb-6'>
							<Card className='bg-linear-to-br from-sky-600 via-blue-600 to-cyan-600 border-0 shadow-2xl overflow-hidden'>
								<div className='absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl' />
								<CardContent className='p-6 relative z-10'>
									<p className='text-white/90 text-sm font-medium mb-2'>
										Asking Price
									</p>
									<p className='text-4xl md:text-5xl font-bold text-white mb-6'>
										$
										{listing.price?.toLocaleString() || "0"}
									</p>
									{listing.status === "sold" ? (
										<div className='text-center py-4'>
											<XCircle className='h-12 w-12 text-red-300 mx-auto mb-2' />
											<h2 className='text-red-200 text-2xl font-black'>
												Out Of Stock
											</h2>
										</div>
									) : (
										<div className='space-y-3'>
											<Button
												onClick={() =>
													handleContactSeller(
														listing.seller?.phone ||
															""
													)
												}
												className='w-full cursor-pointer bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white gap-2 shadow-lg shadow-emerald-500/20'>
												<MessageCircle size={18} />
												Contact on WhatsApp
											</Button>

											<div className='flex gap-2'>
												<Button
													variant='outline'
													onClick={() =>
														handleContactSeller(
															PHONE
														)
													}
													className='flex-1 cursor-pointer border-white/30 text-sky-600 hover:bg-white/20 gap-2'>
													<MessageCircle size={18} />
													Admin
												</Button>
												<Button
													variant='outline'
													onClick={() => {
														try {
															navigator.clipboard.writeText(
																window.location
																	.href
															);
															toast.success(
																"Link copied to clipboard"
															);
														} catch (error) {
															console.error(
																"Failed to copy link:",
																error
															);
															toast.error(
																"Failed to copy link"
															);
														}
													}}
													className='flex-1 cursor-pointer border-white/30 text-sky-600 hover:bg-white/20 gap-2'>
													<Share2 size={18} />
													Share
												</Button>
											</div>
										</div>
									)}
								</CardContent>
							</Card>
						</div>

						{/* Details */}
						<Card className='bg-white border border-slate-200 shadow-lg'>
							<CardHeader className='border-b border-slate-200'>
								<CardTitle className='text-slate-900 text-2xl md:text-3xl font-bold'>
									{listing?.title}
								</CardTitle>
							</CardHeader>
							<CardContent className='space-y-6 pt-6'>
								<div>
									<h3 className='text-sm font-semibold text-slate-700 mb-2'>
										Description
									</h3>
									<p className='text-slate-600 leading-relaxed text-base'>
										{listing.description}
									</p>
								</div>

								{/* Metrics Grid */}
								<div>
									<h3 className='text-sm font-semibold text-slate-700 mb-4'>
										Key Metrics
									</h3>
									<div className='grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4'>
										{listing.metrics?.assetLink && (
											<div className='p-4 bg-linear-to-br from-sky-50 to-blue-50 rounded-xl border border-sky-100 col-span-2 md:col-span-3'>
												<p className='text-xs text-slate-600 mb-2 font-medium flex items-center gap-1'>
													<LinkIcon
														size={14}
														className='text-sky-600'
													/>
													Asset Link
												</p>
												<a
													href={sanitizeUrl(
														listing.metrics
															.assetLink
													)}
													target='_blank'
													rel='noopener noreferrer'
													className='text-sm font-semibold text-sky-600 hover:text-sky-700 break-all flex items-center gap-1 group'>
													{
														listing?.metrics
															?.assetLink
													}
													<ArrowUpRight
														size={14}
														className='group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform'
													/>
												</a>
											</div>
										)}
										{listing.metrics?.monthlyRevenue >=
											0 && (
											<div className='p-4 bg-linear-to-br from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-100'>
												<p className='text-xs text-slate-600 mb-2 font-medium flex items-center gap-1'>
													<DollarSign
														size={14}
														className='text-emerald-600'
													/>
													Monthly Revenue
												</p>
												<p className='text-xl md:text-2xl font-bold text-emerald-700'>
													$
													{listing.metrics?.monthlyRevenue?.toLocaleString()}
												</p>
											</div>
										)}
										{listing.metrics?.monthlyTraffic && (
											<div className='p-4 bg-slate-50 rounded-xl border border-slate-100'>
												<p className='text-xs text-slate-600 mb-2 font-medium flex items-center gap-1'>
													<Eye
														size={14}
														className='text-slate-500'
													/>
													Monthly Traffic
												</p>
												<p className='text-xl md:text-2xl font-bold text-slate-900'>
													{listing.metrics?.monthlyTraffic?.toLocaleString()}
												</p>
											</div>
										)}
										{listing?.metrics?.followers && (
											<div className='p-4 bg-slate-50 rounded-xl border border-slate-100'>
												<p className='text-xs text-slate-600 mb-2 font-medium flex items-center gap-1'>
													<Users
														size={14}
														className='text-slate-500'
													/>
													Followers
												</p>
												<p className='text-xl md:text-2xl font-bold text-slate-900'>
													{listing.metrics?.followers?.toLocaleString()}
												</p>
											</div>
										)}
										{listing?.metrics?.country && (
											<div className='p-4 bg-slate-50 rounded-xl border border-slate-100'>
												<p className='text-xs text-slate-600 mb-2 font-medium flex items-center gap-1'>
													<MapPin
														size={14}
														className='text-slate-500'
													/>
													Country
												</p>
												<p className='text-xl md:text-2xl font-bold text-slate-900'>
													{listing?.metrics?.country}
												</p>
											</div>
										)}
										{listing?.metrics?.age && (
											<div className='p-4 bg-slate-50 rounded-xl border border-slate-100'>
												<p className='text-xs text-slate-600 mb-2 font-medium flex items-center gap-1'>
													<Calendar
														size={14}
														className='text-slate-500'
													/>
													Age
												</p>
												<p className='text-xl md:text-2xl font-bold text-slate-900'>
													{listing?.metrics?.age}{" "}
													months
												</p>
											</div>
										)}
									</div>
								</div>

								{/* Details */}
								{listing.details && (
									<div className='space-y-4 pt-6 border-t border-slate-200'>
										<h3 className='text-sm font-semibold text-slate-700 mb-4'>
											Additional Details
										</h3>
										<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4'>
											{listing.details.niche && (
												<div className='p-4 bg-slate-50 rounded-xl border border-slate-100'>
													<p className='text-xs text-slate-600 mb-1 font-medium'>
														Niche
													</p>
													<p className='text-slate-900 font-semibold text-sm'>
														{listing.details.niche}
													</p>
												</div>
											)}
											{listing.details.monetization && (
												<div className='p-4 bg-slate-50 rounded-xl border border-slate-100'>
													<p className='text-xs text-slate-600 mb-1 font-medium'>
														Monetization
													</p>
													<p className='text-slate-900 font-semibold text-sm'>
														{
															listing.details
																.monetization
														}
													</p>
												</div>
											)}
											{listing.details.trafficSource && (
												<div className='p-4 bg-slate-50 rounded-xl border border-slate-100'>
													<p className='text-xs text-slate-600 mb-1 font-medium'>
														Traffic Source
													</p>
													<p className='text-slate-900 font-semibold text-sm'>
														{
															listing.details
																.trafficSource
														}
													</p>
												</div>
											)}
											{listing.details
												.growthPotential && (
												<div className='p-4 bg-slate-50 rounded-xl border border-slate-100'>
													<p className='text-xs text-slate-600 mb-1 font-medium'>
														Growth Potential
													</p>
													<p className='text-slate-900 font-semibold text-sm'>
														{
															listing.details
																.growthPotential
														}
													</p>
												</div>
											)}
											{listing.details
												.paymentReceived && (
												<div className='p-4 bg-slate-50 rounded-xl border border-slate-100'>
													<p className='text-xs text-slate-600 mb-1 font-medium'>
														Payment Received
													</p>
													<p className='text-slate-900 font-semibold text-sm'>
														{
															listing.details
																.paymentReceived
														}
													</p>
												</div>
											)}
											{listing.details.adManager && (
												<div className='p-4 bg-slate-50 rounded-xl border border-slate-100'>
													<p className='text-xs text-slate-600 mb-1 font-medium'>
														Ad Manager
													</p>
													<p className='text-slate-900 font-semibold text-sm'>
														{
															listing.details
																.adManager
														}
													</p>
												</div>
											)}
											{listing.details.domainProvider && (
												<div className='p-4 bg-slate-50 rounded-xl border border-slate-100'>
													<p className='text-xs text-slate-600 mb-1 font-medium'>
														Domain Provider
													</p>
													<p className='text-slate-900 font-semibold text-sm'>
														{
															listing.details
																.domainProvider
														}
													</p>
												</div>
											)}
											{listing.details.domainExpiry && (
												<div className='p-4 bg-slate-50 rounded-xl border border-slate-100'>
													<p className='text-xs text-slate-600 mb-1 font-medium'>
														Domain Expiry
													</p>
													<p className='text-slate-900 font-semibold text-sm'>
														{
															listing.details
																.domainExpiry
														}
													</p>
												</div>
											)}
											{listing.details.platform && (
												<div className='p-4 bg-slate-50 rounded-xl border border-slate-100'>
													<p className='text-xs text-slate-600 mb-1 font-medium'>
														Platform
													</p>
													<p className='text-slate-900 font-semibold text-sm'>
														{
															listing.details
																.platform
														}
													</p>
												</div>
											)}
											{listing.details.issue && (
												<div className='p-4 bg-amber-50 rounded-xl border border-amber-100 col-span-1 sm:col-span-2 md:col-span-3'>
													<p className='text-xs text-amber-700 mb-1 font-medium flex items-center gap-1'>
														<AlertCircle
															size={14}
														/>
														Any Issues
													</p>
													<p className='text-amber-900 font-semibold text-sm'>
														{listing.details.issue}
													</p>
												</div>
											)}
										</div>
									</div>
								)}
							</CardContent>
						</Card>

						{/* Image Gallery - Masonry */}
						{listing?.images && listing.images.length > 0 && (
							<Card className='bg-white border border-slate-200 shadow-lg'>
								<CardHeader className='border-b border-slate-200'>
									<CardTitle className='text-slate-900 text-xl font-bold flex items-center gap-2'>
										<FileText
											size={20}
											className='text-sky-600'
										/>
										Gallery
									</CardTitle>
								</CardHeader>
								<CardContent className='pt-6'>
									<div className='columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:balance]'>
										{(listing.images as string[])
											.filter(
												(img) =>
													img &&
													img !== listing.thumbnail
											)
											.map((img, idx) => (
												<div
													key={idx}
													className='mb-4 break-inside-avoid group'>
													<div className='overflow-hidden rounded-xl border border-slate-200 bg-slate-50 cursor-pointer'>
														<img
															src={img}
															onClick={(e) => {
																e.preventDefault();
																setPreviewUrl(
																	img
																);
															}}
															alt={`Image ${
																idx + 1
															}`}
															className='w-full h-auto object-cover group-hover:scale-110 transition-transform duration-500'
														/>
													</div>
												</div>
											))}
									</div>
								</CardContent>
							</Card>
						)}
					</div>

					{/* Image Preview Lightbox */}
					{previewUrl && (
						<div
							className='fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4'
							onClick={() => setPreviewUrl(null)}>
							<button
								onClick={(e) => {
									e.stopPropagation();
									setPreviewUrl(null);
								}}
								className='absolute top-4 right-4 text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-full px-4 py-2 text-sm font-semibold shadow-xl flex items-center gap-2 transition-all duration-200'>
								<X size={18} />
								Close
							</button>
							<img
								src={previewUrl as string}
								alt='Preview'
								onClick={(e) => e.stopPropagation()}
								className='max-w-[95vw] max-h-[85vh] object-contain shadow-2xl rounded-lg'
							/>
						</div>
					)}

					{/* Sidebar */}
					<div className='space-y-6'>
						{/* Price Card */}
						<Card className='bg-linear-to-br hidden lg:block from-sky-600 via-blue-600 to-cyan-600 border-0 shadow-2xl overflow-hidden'>
							<div className='absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl' />
							<div className='absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl' />
							<CardContent className='p-6 relative z-10'>
								<p className='text-white/90 text-sm font-medium mb-2'>
									Asking Price
								</p>
								<p className='text-4xl md:text-5xl font-bold text-white mb-6'>
									${listing.price?.toLocaleString() || "0"}
								</p>
								{listing.status === "sold" ? (
									<div className='text-center py-4'>
										<XCircle className='h-12 w-12 text-red-300 mx-auto mb-2' />
										<h2 className='text-red-200 text-2xl font-black'>
											Out Of Stock
										</h2>
									</div>
								) : (
									<div className='space-y-3'>
										<Button
											onClick={() =>
												handleContactSeller(
													listing.seller?.phone || ""
												)
											}
											className='w-full cursor-pointer bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white gap-2 shadow-lg shadow-emerald-500/20'>
											<MessageCircle size={18} />
											Contact on WhatsApp
										</Button>

										<div className='flex gap-2'>
											<Button
												variant='outline'
												onClick={() =>
													handleContactSeller(PHONE)
												}
												className='flex-1 cursor-pointer border-white/30 text-sky-600 hover:text-white hover:bg-white/20 gap-2'>
												<MessageCircle size={18} />
												Admin
											</Button>
											<Button
												variant='outline'
												onClick={() => {
													try {
														navigator.clipboard.writeText(
															window.location.href
														);
														toast.success(
															"Link copied to clipboard"
														);
													} catch (error) {
														console.error(
															"Failed to copy link:",
															error
														);
														toast.error(
															"Failed to copy link"
														);
													}
												}}
												className='flex-1 cursor-pointer border-white/30 text-sky-600 hover:text-white hover:bg-white/20 gap-2'>
												<Share2 size={18} />
												Share
											</Button>
										</div>
									</div>
								)}
							</CardContent>
						</Card>

						{/* Recent Bids */}
						{listing.bids && listing.bids.length > 0 && (
							<Card className='bg-white border border-slate-200 shadow-lg'>
								<CardHeader className='border-b border-slate-200'>
									<CardTitle className='text-slate-900 text-lg font-bold flex items-center gap-2'>
										<TrendingDown
											size={20}
											className='text-cyan-600'
										/>
										Recent Bids ({listing.bids.length})
									</CardTitle>
								</CardHeader>
								<CardContent className='pt-6'>
									<div className='space-y-3 max-h-96 overflow-y-auto pr-2'>
										{listing.bids.map((bid: any) => (
											<div
												key={bid._id}
												className='p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-slate-100 transition-all duration-200'>
												<div className='flex items-start justify-between mb-2'>
													<div className='flex-1 min-w-0'>
														<p className='font-bold text-slate-900 text-sm mb-1'>
															{bid.bidder?.name ||
																"Anonymous"}
														</p>
														<div className='flex items-center gap-2 mb-2'>
															<p className='font-medium flex items-center gap-1 text-slate-700 text-xs'>
																<Phone
																	size={12}
																	className='text-slate-400'
																/>
																{bid.bidder
																	?.phone ||
																	"Unknown"}
															</p>
															{bid.bidder
																?.phone && (
																<button
																	onClick={() => {
																		navigator.clipboard.writeText(
																			bid
																				.bidder
																				?.phone ||
																				""
																		);
																		toast.success(
																			"Phone number copied"
																		);
																	}}
																	className='p-1 hover:bg-slate-200 rounded transition-colors'>
																	<Copy
																		size={
																			14
																		}
																		className='text-slate-500 cursor-pointer'
																	/>
																</button>
															)}
														</div>
														<p className='text-xs text-slate-500 flex items-center gap-1'>
															<Clock size={12} />
															{new Date(
																bid.createdAt
															).toLocaleDateString()}{" "}
															{new Date(
																bid.createdAt
															).toLocaleTimeString(
																[],
																{
																	hour: "2-digit",
																	minute: "2-digit",
																}
															)}
														</p>
													</div>
													<div className='text-right ml-4'>
														<p className='font-bold text-cyan-600 text-lg'>
															$
															{bid.amount?.toLocaleString() ||
																"0"}
														</p>
														{bid.amount >
															listing.price && (
															<p className='text-xs text-emerald-600 font-semibold'>
																+$
																{(
																	bid.amount -
																	listing.price
																).toLocaleString()}{" "}
																above asking
															</p>
														)}
													</div>
												</div>
												{bid.message && (
													<p className='text-xs text-slate-600 italic border-t border-slate-200 pt-2 mt-2 bg-white/60 rounded p-2'>
														"{bid.message}"
													</p>
												)}
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						)}

						{/* Bidding Card */}
						{listing.allowBidding && (
							<Card className='bg-white border border-slate-200 shadow-lg'>
								<CardHeader className='border-b border-slate-200'>
									<CardTitle className='text-slate-900 text-lg font-bold flex items-center gap-2'>
										<DollarSign
											size={20}
											className='text-emerald-600'
										/>
										Place a Bid
									</CardTitle>
								</CardHeader>
								<CardContent className='pt-6'>
									<form
										onSubmit={handlePlaceBid}
										className='space-y-4'>
										<div>
											<Label
												htmlFor='bidAmount'
												className='text-slate-700 font-semibold text-sm mb-2 block'>
												Bid Amount (USD)
											</Label>
											<Input
												id='bidAmount'
												type='number'
												min={
													listing.minBidAmount ||
													listing.price
												}
												value={bidAmount}
												onChange={(e) =>
													setBidAmount(e.target.value)
												}
												className='bg-white border-slate-200 text-slate-900 focus:border-sky-500 focus:ring-sky-500/20 h-11'
												required
											/>
											<p className='text-xs text-slate-500 mt-1.5'>
												Minimum: $
												{(
													listing.minBidAmount ||
													listing.price
												).toLocaleString()}
											</p>
										</div>

										<div>
											<Label
												htmlFor='bidMessage'
												className='text-slate-700 font-semibold text-sm mb-2 block'>
												Message (Optional)
											</Label>
											<textarea
												id='bidMessage'
												value={bidMessage}
												onChange={(e) =>
													setBidMessage(
														e.target.value
													)
												}
												placeholder="Tell the seller why you're interested..."
												className='w-full p-3 bg-white border border-slate-200 text-slate-900 rounded-lg text-sm placeholder:text-slate-400 focus:border-sky-500 focus:ring-sky-500/20 resize-none'
												rows={4}
											/>
										</div>

										<Button
											type='submit'
											disabled={
												listing.status === "sold" ||
												submittingBid
											}
											className='w-full bg-linear-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white cursor-pointer shadow-lg shadow-sky-500/20 disabled:opacity-50 disabled:cursor-not-allowed gap-2'>
											{submittingBid ? (
												<>
													<Loader2
														size={18}
														className='animate-spin'
													/>
													Placing Bid...
												</>
											) : listing.status === "sold" ? (
												"Bidding Closed"
											) : (
												<>
													<DollarSign size={18} />
													Place Bid
												</>
											)}
										</Button>
									</form>
								</CardContent>
							</Card>
						)}

						{/* Seller Info */}
						<Card className='bg-white border border-slate-200 shadow-lg'>
							<CardHeader className='border-b border-slate-200'>
								<CardTitle className='text-slate-900 text-lg font-bold flex items-center gap-2'>
									<Users size={20} className='text-sky-600' />
									Seller Information
								</CardTitle>
							</CardHeader>
							<CardContent className='space-y-4 pt-6'>
								<div className='flex items-center gap-4'>
									<div className='relative'>
										<div className='w-16 h-16 rounded-full bg-linear-to-br from-sky-400 to-blue-500 flex items-center justify-center border-4 border-white shadow-lg'>
											<span className='text-2xl font-bold text-white'>
												{listing.seller?.name
													?.charAt(0)
													.toUpperCase() || "S"}
											</span>
										</div>
										{listing.seller?.verified && (
											<div className='absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg'>
												<CheckCircle
													size={14}
													className='text-white'
												/>
											</div>
										)}
									</div>
									<div className='flex-1 min-w-0'>
										<div className='flex items-center gap-2 flex-wrap mb-1'>
											<p className='font-bold text-slate-900 text-base'>
												{listing.seller?.name ||
													"Unknown Seller"}
											</p>
											{listing.seller?.verified && (
												<span className='inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-200'>
													<CheckCircle size={12} />
													Verified
												</span>
											)}
											{listing.seller?.role ===
												"admin" && (
												<span className='inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold border border-blue-200'>
													<Verified size={12} />
													Admin
												</span>
											)}
										</div>
										<div className='flex items-center gap-2'>
											<div className='flex items-center gap-1'>
												{[...Array(5)].map((_, i) => (
													<Star
														key={i}
														size={14}
														className={
															i <
															Math.floor(
																listing.seller
																	?.rating ||
																	0
															)
																? "fill-amber-400 text-amber-400"
																: "text-slate-300"
														}
													/>
												))}
											</div>
											<span className='text-sm text-slate-600 font-semibold'>
												{(
													listing.seller?.rating || 0
												).toFixed(1)}
											</span>
										</div>
									</div>
								</div>

								<div className='grid grid-cols-2 gap-3 pt-4 border-t border-slate-200'>
									<div className='bg-slate-50 rounded-lg p-3 border border-slate-100'>
										<p className='text-xs text-slate-600 mb-1 font-medium'>
											Total Sales
										</p>
										<p className='font-bold text-slate-900 text-lg'>
											$
											{(
												listing.seller?.totalSales || 0
											).toLocaleString()}
										</p>
									</div>
									<div className='bg-slate-50 rounded-lg p-3 border border-slate-100'>
										<p className='text-xs text-slate-600 mb-1 font-medium'>
											Listings
										</p>
										<p className='font-bold text-slate-900 text-lg'>
											{listing.seller?.listings?.length ||
												0}
										</p>
									</div>
								</div>
								<Link
									href={`/profile/${listing.seller?._id}`}
									className='block'>
									<Button
										variant='outline'
										className='w-full border-sky-200 text-sky-700 hover:bg-sky-50 cursor-pointer gap-2'>
										View Profile
										<ArrowUpRight size={16} />
									</Button>
								</Link>
							</CardContent>
						</Card>

						{/* Stats */}
						<Card className='bg-white border border-slate-200 shadow-lg'>
							<CardHeader className='border-b border-slate-200'>
								<CardTitle className='text-slate-900 text-lg font-bold flex items-center gap-2'>
									<FileText
										size={20}
										className='text-sky-600'
									/>
									Listing Stats
								</CardTitle>
							</CardHeader>
							<CardContent className='p-6 space-y-4'>
								<div className='flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100'>
									<span className='text-slate-600 flex items-center gap-2 font-medium text-sm'>
										<Eye
											size={18}
											className='text-slate-500'
										/>
										Views
									</span>
									<span className='font-bold text-slate-900 text-lg'>
										{listing.views || 0}
									</span>
								</div>
								<div className='flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100'>
									<span className='text-slate-600 flex items-center gap-2 font-medium text-sm'>
										<Calendar
											size={18}
											className='text-slate-500'
										/>
										Listed
									</span>
									<span className='font-bold text-slate-900 text-lg'>
										{listing.createdAt
											? new Date(
													listing.createdAt
											  ).toLocaleDateString()
											: "N/A"}
									</span>
								</div>
								{listing.bids && listing.bids.length > 0 && (
									<div className='flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100'>
										<span className='text-slate-600 flex items-center gap-2 font-medium text-sm'>
											<MessageCircle
												size={18}
												className='text-slate-500'
											/>
											Bids
										</span>
										<span className='font-bold text-slate-900 text-lg'>
											{listing.bids.length}
										</span>
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
