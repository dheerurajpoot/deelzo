"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	ShoppingCart,
	Star,
	Package,
	CheckCircle,
	ArrowLeft,
	Shield,
	Zap,
	Download,
	ExternalLink,
	Loader2,
	XCircle,
	Clock,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation";
import { userContext } from "@/context/userContext";
import DOMPurify from "dompurify";

interface Product {
	_id: string;
	title: string;
	slug: string;
	description: string;
	shortDescription?: string;
	category: string;
	price: number;
	comparePrice?: number;
	currency: string;
	thumbnail?: string;
	images: string[];
	status: string;
	stock: number;
	salesCount: number;
	rating: {
		average: number;
		count: number;
	};
	features: string[];
	requirements: string[];
	tags: string[];
	demoUrl?: string;
	videoUrl?: string;
	downloadUrl?: string; // Added for downloadable products
	isFeatured: boolean;
	isBestseller: boolean;
	faqs?: { question: string; answer: string }[];
	metadata?: {
		documentation?: string;
		supportInfo?: string;
		version?: string;
	};
	reviews?: Array<{
		_id: string;
		user: {
			name: string;
		};
		rating: number;
		comment: string;
		createdAt: string;
	}>;
}

export default function ProductDetailPage() {
	const params = useParams();
	const router = useRouter();
	const slug = params.slug as string;
	const { user } = userContext();

	const [product, setProduct] = useState<Product | null>(null);
	const [loading, setLoading] = useState(true);
	const [isBuying, setIsBuying] = useState(false);
	const [selectedImage, setSelectedImage] = useState(0);

	const [popularProducts, setPopularProducts] = useState<Product[]>([]);
	const [showReviewForm, setShowReviewForm] = useState(false);
	const [reviewData, setReviewData] = useState({
		rating: 0,
		comment: "",
	});

	useEffect(() => {
		fetchProduct();
		fetchPopularProducts();
	}, [slug]);

	const fetchProduct = async () => {
		try {
			setLoading(true);
			// Fetch all products and find by slug
			const response = await axios.get(
				"/api/products?limit=1000&status=",
			);
			const products = response.data.products || [];
			const foundProduct = products.find((p: Product) => p.slug === slug);

			if (foundProduct) {
				setProduct(foundProduct);
			} else {
				toast.error("Product not found");
			}
		} catch (error) {
			console.error("Error fetching product:", error);
			toast.error("Failed to load product");
		} finally {
			setLoading(false);
		}
	};

	const fetchPopularProducts = async () => {
		try {
			const response = await axios.get(
				"/api/products?limit=4&sortBy=salesCount&sortOrder=desc",
			);
			setPopularProducts(response.data.products || []);
		} catch (error) {
			console.error("Error fetching popular products:", error);
		}
	};

	const handleBuy = async () => {
		if (!user) {
			toast.error("Please login to purchase");
			return;
		}

		if (!product) return;

		// Redirect to checkout page
		router.push(`/shop/checkout?product=${product._id}`);
	};

	const submitReview = async () => {
		if (!user) {
			toast.error("Please login to submit a review");
			return;
		}

		if (reviewData.rating === 0 || reviewData.comment.trim() === "") {
			toast.error("Please provide a rating and comment");
			return;
		}

		try {
			const response = await axios.post(
				`/api/products/${product?._id}/reviews`,
				{
					rating: reviewData.rating,
					comment: reviewData.comment,
				},
			);

			if (response.data.success) {
				toast.success("Review submitted successfully!");
				setShowReviewForm(false);
				// Refresh product data to show new review
				fetchProduct();
			} else {
				toast.error(response.data.message || "Failed to submit review");
			}
		} catch (error: any) {
			toast.error(
				error.response?.data?.message || "Failed to submit review",
			);
		}
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "active":
				return (
					<span className='flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium'>
						<CheckCircle size={12} /> Active
					</span>
				);
			case "draft":
				return (
					<span className='flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium'>
						<Clock size={12} /> Draft
					</span>
				);
			case "archived":
				return (
					<span className='flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium'>
						<XCircle size={12} /> Archived
					</span>
				);
			default:
				return null;
		}
	};

	const discount =
		product?.comparePrice && product.comparePrice > product.price
			? Math.round(
					((product.comparePrice - product.price) /
						product.comparePrice) *
						100,
				)
			: 0;

	if (loading) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center'>
				<Loader2 className='animate-spin text-orange-500' size={48} />
			</div>
		);
	}

	if (!product) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center'>
				<div className='text-center'>
					<Package
						size={64}
						className='mx-auto mb-4 text-slate-300'
					/>
					<h1 className='text-2xl font-bold text-slate-900 mb-2'>
						Product Not Found
					</h1>
					<p className='text-slate-500 mb-6'>
						The product you're looking for doesn't exist.
					</p>
					<Link href='/shop'>
						<Button className='bg-gradient-to-r from-orange-500 to-rose-500'>
							<ArrowLeft size={18} className='mr-2' />
							Back to Shop
						</Button>
					</Link>
				</div>
			</div>
		);
	}

	// console.log(product)

	return (
		<div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100'>
			{/* Breadcrumb */}
			<div className='border-b border-slate-200 bg-white/80 backdrop-blur-sm'>
				<div className='max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4'>
					<div className='flex items-center gap-2 text-sm'>
						<Link
							href='/'
							className='text-slate-500 hover:text-orange-600 transition-colors'>
							Home
						</Link>
						<span className='text-slate-300'>/</span>
						<Link
							href='/shop'
							className='text-slate-500 hover:text-orange-600 transition-colors'>
							Shop
						</Link>
						<span className='text-slate-300'>/</span>
						<span className='text-slate-900 font-medium truncate'>
							{product.title}
						</span>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className='max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8'>
				<div className='grid lg:grid-cols-2 gap-8 lg:gap-12'>
					{/* Left: Images */}
					<div className='space-y-4'>
						<div className='relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 shadow-lg'>
							{product.thumbnail ||
							product.images[selectedImage] ? (
								<img
									src={
										product.thumbnail ||
										product.images[selectedImage]
									}
									alt={product.title}
									className='w-full h-full object-cover'
								/>
							) : (
								<div className='w-full h-full flex items-center justify-center'>
									<Package
										size={80}
										className='text-slate-300'
									/>
								</div>
							)}

							{/* Badges */}
							<div className='absolute top-4 left-4 flex flex-col gap-2'>
								{discount > 0 && (
									<Badge className='bg-rose-500 text-white border-0 px-3 py-1 text-sm'>
										-{discount}% OFF
									</Badge>
								)}
								{product.isBestseller && (
									<Badge className='bg-amber-500 text-white border-0 px-3 py-1 text-sm'>
										Bestseller
									</Badge>
								)}
							</div>
						</div>

						{/* Thumbnail Gallery */}
						{product.images.length > 0 && (
							<div className='flex gap-3 overflow-x-auto pb-2'>
								{product.images.map((img, idx) => (
									<button
										key={idx}
										onClick={() => setSelectedImage(idx)}
										className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
											selectedImage === idx
												? "border-orange-500"
												: "border-transparent"
										}`}>
										<img
											src={img}
											alt=''
											className='w-full h-full object-cover'
										/>
									</button>
								))}
							</div>
						)}
					</div>

					{/* Right: Product Info */}
					<div className='space-y-6'>
						<div>
							<div className='flex items-center gap-3 mb-3'>
								<Badge
									variant='outline'
									className='text-slate-600 border-slate-300 capitalize'>
									{product.category}
								</Badge>
							</div>

							<h1 className='text-3xl md:text-4xl font-bold text-slate-900 mb-4'>
								{product.title}
							</h1>

							<div className='flex items-center gap-4 mb-4'>
								<div className='flex items-center gap-1'>
									{[...Array(5)].map((_, i) => (
										<Star
											key={i}
											size={18}
											className={
												i <
												Math.round(
													product.rating?.average ||
														0,
												)
													? "text-amber-400 fill-amber-400"
													: "text-slate-300"
											}
										/>
									))}
									<span className='ml-2 text-slate-600'>
										{product.rating?.average?.toFixed(1) ||
											"0.0"}{" "}
										({product.rating?.count || 0} reviews)
									</span>
								</div>
								<span className='text-slate-300'>|</span>
								<span className='text-slate-600'>
									{product.salesCount || 0} sold
								</span>
							</div>

							<p className='text-slate-600 text-lg leading-relaxed'>
								{product.shortDescription ||
									product.description}
							</p>
						</div>

						{/* Price */}
						<div className='flex items-baseline gap-4 p-6 bg-gradient-to-r from-orange-50 to-rose-50 rounded-2xl border border-orange-100'>
							<span className='text-4xl font-bold text-slate-900'>
								{product.currency} {product.price}
							</span>
							{product.comparePrice &&
								product.comparePrice > 0 && (
									<span className='text-xl text-slate-400 line-through'>
										{product.currency}{" "}
										{product.comparePrice}
									</span>
								)}
						</div>

						{/* Actions */}
						<div className='flex gap-3'>
							<Button
								onClick={handleBuy}
								disabled={
									isBuying || product.status !== "active"
								}
								className='flex-1 bg-gradient-to-r cursor-pointer from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white py-6 text-lg font-semibold shadow-lg shadow-orange-500/25 rounded-xl'>
								{isBuying ? (
									<Loader2
										className='animate-spin mr-2'
										size={20}
									/>
								) : (
									<ShoppingCart className='mr-2' size={20} />
								)}
								{product.status === "active"
									? "Buy Now"
									: "Unavailable"}
							</Button>

							{product.demoUrl && (
								<Link href={product.demoUrl} target='_blank'>
									<Button
										variant='outline'
										className='py-5 cursor-pointer px-6 rounded-xl border-2'>
										Demo Link
										<ExternalLink size={20} />
									</Button>
								</Link>
							)}
						</div>

						{/* Trust Badges */}
						<div className='grid grid-cols-3 gap-2'>
							<div className='flex items-center gap-2 text-sm text-slate-600'>
								<Shield
									size={18}
									className='text-emerald-500'
								/>
								<span>Secure Payment</span>
							</div>
							<div className='flex items-center gap-2 text-sm text-slate-600'>
								<Download size={18} className='text-blue-500' />
								<span>Instant Download</span>
							</div>
							<div className='flex items-center gap-2 text-sm text-slate-600'>
								<Zap size={18} className='text-amber-500' />
								<span>Lifetime Access</span>
							</div>
						</div>
					</div>
				</div>

				{/* Description */}
				<div className='mt-12'>
					<div className='w-full'>
						<h3 className='text-xl md:text-2xl font-bold text-slate-900 mb-4'>
							Description
						</h3>
						<div
							className='prose prose-slate max-w-none text-slate-600 leading-relaxed'
							dangerouslySetInnerHTML={{
								__html: DOMPurify.sanitize(product.description),
							}}
						/>
					</div>
				</div>
			</div>

			{/* Reviews Section */}
			<div className='mt-16'>
				<div className='max-w-7xl mx-auto px-4 md:px-6 lg:px-8'>
					<div className='flex justify-between items-center mb-8'>
						<h2 className='text-xl md:text-2xl font-bold text-slate-900'>
							Customer Reviews
						</h2>
						{user && (
							<Button
								onClick={() => setShowReviewForm(true)}
								className='bg-gradient-to-r from-orange-500 to-rose-500'>
								Write a Review
							</Button>
						)}
					</div>

					{product.reviews && product.reviews.length > 0 ? (
						<div className='space-y-6'>
							{product.reviews &&
								product.reviews.length > 0 &&
								product.reviews.map((review) => (
									<div
										key={review._id}
										className='bg-white border border-slate-200 rounded-xl p-6'>
										<div className='flex items-center justify-between mb-4'>
											<div className='flex items-center gap-3'>
												<div className='w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center'>
													<span className='font-semibold text-slate-700'>
														{review?.user?.name
															?.charAt(0)
															.toUpperCase()}
													</span>
												</div>
												<div>
													<p className='font-semibold text-slate-900'>
														{review?.user?.name}
													</p>
													<div className='flex items-center gap-1'>
														{[...Array(5)].map(
															(_, i) => (
																<Star
																	key={i}
																	size={16}
																	className={
																		i <
																		review.rating
																			? "text-amber-400 fill-amber-400"
																			: "text-slate-300"
																	}
																/>
															),
														)}
													</div>
												</div>
											</div>
											<span className='text-sm text-slate-500'>
												{new Date(
													review.createdAt,
												).toLocaleDateString()}
											</span>
										</div>
										<p className='text-slate-600'>
											{review.comment}
										</p>
									</div>
								))}
						</div>
					) : (
						<div className='bg-white border border-slate-200 rounded-xl p-12 text-center'>
							<Star
								size={48}
								className='mx-auto mb-4 text-slate-300'
							/>
							<h3 className='text-lg font-semibold text-slate-900 mb-2'>
								No reviews yet
							</h3>
							<p className='text-slate-500'>
								Be the first to review this product
							</p>
						</div>
					)}
				</div>
			</div>

			{/* Review Form Dialog */}
			<Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
				<DialogContent className='max-w-md'>
					<DialogHeader>
						<DialogTitle>Write a Review</DialogTitle>
					</DialogHeader>
					<div className='space-y-4 py-4'>
						<div>
							<label className='block text-sm font-medium text-slate-700 mb-2'>
								Rating
							</label>
							<div className='flex gap-1'>
								{[1, 2, 3, 4, 5].map((star) => (
									<button
										key={star}
										type='button'
										onClick={() =>
											setReviewData({
												...reviewData,
												rating: star,
											})
										}
										className={`p-1 ${star <= reviewData.rating ? "text-amber-400" : "text-slate-300"}`}>
										<Star
											size={24}
											fill={
												star <= reviewData.rating
													? "currentColor"
													: "none"
											}
										/>
									</button>
								))}
							</div>
						</div>
						<div>
							<label className='block text-sm font-medium text-slate-700 mb-2'>
								Review
							</label>
							<textarea
								value={reviewData.comment}
								onChange={(e) =>
									setReviewData({
										...reviewData,
										comment: e.target.value,
									})
								}
								className='w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent'
								rows={4}
								placeholder='Share your experience with this product...'
							/>
						</div>
						<div className='flex justify-end gap-3 pt-4'>
							<Button
								variant='outline'
								onClick={() => setShowReviewForm(false)}>
								Cancel
							</Button>
							<Button
								onClick={submitReview}
								disabled={
									reviewData.rating === 0 ||
									reviewData.comment.trim() === ""
								}
								className='bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600'>
								Submit Review
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Popular Products Section */}
			<div className='my-8'>
				<div className='max-w-7xl mx-auto px-4 md:px-6 lg:px-8'>
					<h2 className='text-2xl md:text-2xl font-bold text-slate-900 mb-8'>
						Popular Products
					</h2>

					{loading ? (
						<div className='flex justify-center'>
							<Loader2
								className='animate-spin text-orange-500'
								size={32}
							/>
						</div>
					) : (
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
							{popularProducts.map((popProduct) => (
								<Link
									key={popProduct._id}
									href={`/shop/${popProduct.slug}`}>
									<Card
										key={popProduct._id}
										className='bg-white border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 p-0 group overflow-hidden cursor-pointer'>
										<div className='relative h-40 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden'>
											{popProduct.thumbnail ? (
												<img
													src={popProduct.thumbnail}
													alt={popProduct.title}
													className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
												/>
											) : (
												<div className='w-full h-full flex items-center justify-center'>
													<Package
														size={48}
														className='text-slate-300'
													/>
												</div>
											)}
											<div className='absolute top-2 right-2 flex gap-1'>
												{popProduct.isFeatured && (
													<span className='px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded-full'>
														Featured
													</span>
												)}
												{popProduct.isBestseller && (
													<span className='px-2 py-1 bg-violet-500 text-white text-xs font-medium rounded-full'>
														Bestseller
													</span>
												)}
											</div>
											<div className='absolute bottom-2 left-2'>
												{getStatusBadge(
													popProduct.status,
												)}
											</div>
										</div>

										<CardContent className='p-4'>
											<div className='flex items-start justify-between mb-2'>
												<div>
													<p className='text-xs text-slate-500 uppercase tracking-wide'>
														{popProduct.category}
													</p>
													<h3 className='font-semibold text-slate-900 line-clamp-1'>
														{popProduct.title}
													</h3>
												</div>
											</div>

											<p className='text-sm text-slate-600 line-clamp-2 mb-3'>
												{popProduct.shortDescription ||
													popProduct.description.substring(
														0,
														100,
													) + "..."}
											</p>

											<div className='flex items-center justify-between mb-3'>
												<div className='flex items-baseline gap-2'>
													<span className='text-lg font-bold text-slate-900'>
														{popProduct.currency}{" "}
														{popProduct.price}
													</span>
													{popProduct.comparePrice &&
														popProduct.comparePrice >
															0 && (
															<span className='text-sm text-slate-400 line-through'>
																{
																	popProduct.currency
																}
																{
																	popProduct.comparePrice
																}
															</span>
														)}
												</div>
												<div className='flex items-center gap-1 text-sm text-slate-500'>
													<Star
														size={14}
														className='text-amber-400 fill-amber-400'
													/>
													<span>
														{popProduct.rating?.average?.toFixed(
															1,
														) || "0.0"}
													</span>
													<span className='text-slate-400'>
														(
														{popProduct.rating
															?.count || 0}
														)
													</span>
												</div>
											</div>

											<div className='flex items-center justify-between pt-3 border-t border-slate-100'>
												<span className='text-xs text-slate-500'>
													{popProduct.salesCount || 0}{" "}
													sales
												</span>
											</div>
										</CardContent>
									</Card>
								</Link>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
