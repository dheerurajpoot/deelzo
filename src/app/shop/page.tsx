"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Search,
	Filter,
	ShoppingCart,
	Star,
	Package,
	Code,
	Wrench,
	Sparkles,
	TrendingUp,
	Zap,
	ArrowRight,
	Loader2,
	X,
} from "lucide-react";
import axios from "axios";

interface Product {
	_id: string;
	title: string;
	slug: string;
	shortDescription?: string;
	description: string;
	category: string;
	price: number;
	comparePrice?: number;
	currency: string;
	thumbnail?: string;
	images: string[];
	status: string;
	rating: {
		average: number;
		count: number;
	};
	salesCount: number;
	isFeatured: boolean;
	isBestseller: boolean;
	features: string[];
}

interface ProductWithDisplayPrices extends Product {
	displayPrice?: number;
	displayComparePrice?: number;
}

const categories = [
	{ value: "all", label: "All Categories", icon: Package },
	{ value: "script", label: "Code Scripts", icon: Code },
	{ value: "tool", label: "Tools & Software", icon: Wrench },
	{ value: "automation", label: "Automation", icon: Package },
	{ value: "seo", label: "SEO", icon: Package },
	{ value: "adsense", label: "AdSense", icon: Package },
	{ value: "other", label: "Other", icon: Package },
];

const sortOptions = [
	{ value: "newest", label: "Newest First" },
	{ value: "price-low", label: "Price: Low to High" },
	{ value: "price-high", label: "Price: High to Low" },
	{ value: "popular", label: "Most Popular" },
	{ value: "rated", label: "Best Rated" },
];

export default function ShopPage() {
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [sortBy, setSortBy] = useState("newest");

	const fetchProducts = async () => {
		try {
			setLoading(true);
			const params = new URLSearchParams();

			params.append("status", "active");
			params.append("limit", "100");

			if (selectedCategory !== "all")
				params.append("category", selectedCategory);
			if (searchQuery) params.append("search", searchQuery);

			// Handle sorting
			switch (sortBy) {
				case "price-low":
					params.append("sortBy", "price");
					params.append("sortOrder", "asc");
					break;
				case "price-high":
					params.append("sortBy", "price");
					params.append("sortOrder", "desc");
					break;
				case "popular":
					params.append("sortBy", "salesCount");
					params.append("sortOrder", "desc");
					break;
				case "rated":
					params.append("sortBy", "rating.average");
					params.append("sortOrder", "desc");
					break;
				default:
					params.append("sortBy", "createdAt");
					params.append("sortOrder", "desc");
			}

			const response = await axios.get(
				`/api/products?${params.toString()}`,
			);
			const fetchedProducts = response.data.products || [];

			setProducts(fetchedProducts);
		} catch (error) {
			console.error("Error fetching products:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchProducts();
	}, [selectedCategory, sortBy]);

	const hasActiveFilters = selectedCategory !== "all" || searchQuery;

	const clearFilters = () => {
		setSelectedCategory("all");
		setSearchQuery("");
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100'>
			{/* Hero Section */}
			<section className='relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16 md:py-24'>
				<div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
				<div className='absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-orange-500/20 to-rose-500/20 rounded-full blur-3xl' />
				<div className='absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-full blur-3xl' />

				<div className='relative max-w-7xl mx-auto px-4 md:px-6 lg:px-8'>
					<div className='text-center max-w-3xl mx-auto'>
						<div className='inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6'>
							<Sparkles size={16} className='text-orange-400' />
							<span className='text-sm font-medium'>
								Premium Digital Products
							</span>
						</div>
						<h1 className='text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight'>
							Supercharge Your
							<span className='block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400'>
								Digital Journey
							</span>
						</h1>
						<p className='text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto'>
							Discover premium code scripts, tools, and services
							to accelerate your online success
						</p>

						{/* Search Bar */}
						<div className='relative max-w-2xl mx-auto'>
							<Search
								className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400'
								size={20}
							/>
							<Input
								placeholder='Search for scripts, tools, courses...'
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className='pl-12 pr-4 py-6 text-lg bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-slate-400 rounded-xl focus:bg-white/20'
							/>
						</div>
					</div>
				</div>
			</section>

			{/* Main Content */}
			<section className='py-12'>
				<div className='max-w-7xl mx-auto px-4 md:px-6 lg:px-8'>
					{/* Filters Bar */}
					<div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8'>
						<div className='flex items-center gap-4'>
							<h2 className='text-2xl font-bold text-slate-900'>
								{selectedCategory === "all"
									? "All Products"
									: categories.find(
											(c) => c.value === selectedCategory,
										)?.label}
							</h2>
							<span className='px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium'>
								{products.length} items
							</span>
						</div>

						<div className='flex items-center gap-3'>
							{hasActiveFilters && (
								<Button
									variant='ghost'
									onClick={clearFilters}
									className='text-slate-500 hover:text-slate-700 gap-2'>
									<X size={16} />
									Clear Filters
								</Button>
							)}

							<Select value={sortBy} onValueChange={setSortBy}>
								<SelectTrigger className='w-[180px]'>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{sortOptions.map((option) => (
										<SelectItem
											key={option.value}
											value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							<Select
								value={selectedCategory}
								onValueChange={setSelectedCategory}>
								<SelectTrigger className='w-[160px]'>
									<Filter size={16} className='mr-2' />
									<SelectValue placeholder='Category' />
								</SelectTrigger>
								<SelectContent>
									{categories.map((cat) => (
										<SelectItem
											key={cat.value}
											value={cat.value}>
											{cat.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* Products Grid */}
					{loading ? (
						<div className='flex items-center justify-center py-20'>
							<Loader2
								className='animate-spin text-orange-500'
								size={40}
							/>
						</div>
					) : products.length === 0 ? (
						<div className='text-center py-20'>
							<Package
								size={64}
								className='mx-auto mb-4 text-slate-300'
							/>
							<h3 className='text-xl font-semibold text-slate-900 mb-2'>
								No products found
							</h3>
							<p className='text-slate-500 mb-6'>
								Try adjusting your filters or search query
							</p>
							{hasActiveFilters && (
								<Button
									onClick={clearFilters}
									variant='outline'>
									Clear Filters
								</Button>
							)}
						</div>
					) : (
						<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
							{products.map((product) => (
								<ProductCard
									key={product._id}
									product={product}
								/>
							))}
						</div>
					)}
				</div>
			</section>

			{/* CTA Section */}
			<section className='py-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white'>
				<div className='max-w-7xl mx-auto px-4 md:px-6 lg:px-8'>
					<div className='text-center max-w-2xl mx-auto'>
						<div className='w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/25'>
							<Zap size={32} className='text-white' />
						</div>
						<h2 className='text-3xl md:text-4xl font-bold mb-4'>
							Can't find what you're looking for?
						</h2>
						<p className='text-slate-300 mb-8'>
							We offer custom development services tailored to
							your specific needs. Let's build something amazing
							together.
						</p>
						<div className='flex flex-col sm:flex-row gap-4 justify-center'>
							<Link href='/contact'>
								<Button className='bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white px-8 py-6 text-base font-semibold shadow-lg shadow-orange-500/25 rounded-xl'>
									Request Custom Service
									<ArrowRight size={18} className='ml-2' />
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}

function ProductCard({ product }: { product: Product }) {
	const discount =
		product.comparePrice && product.comparePrice > product.price
			? Math.round(
					((product.comparePrice - product.price) /
						product.comparePrice) *
						100,
				)
			: 0;

	return (
		<Link href={`/shop/${product.slug}`}>
			<Card
				className={`group bg-white border-slate-200 overflow-hidden p-0 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 cursor-pointer ${product.isFeatured ? "ring-2 ring-emerald-500/20" : ""}`}>
				{/* Image */}
				<div className='relative h-48 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200'>
					{product.thumbnail ? (
						<img
							src={product.thumbnail}
							alt={product.title}
							className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
						/>
					) : (
						<div className='w-full h-full flex items-center justify-center'>
							<Package size={48} className='text-slate-300' />
						</div>
					)}

					{/* Featured corner ribbon */}
					{product.isFeatured && (
						<div className='absolute top-0 left-0 overflow-hidden'>
							<div className='absolute top-2 -left-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-6 py-1 rotate-45 transform origin-center shadow-lg'>
								<Star size={10} className='inline mr-1' />
								FEATURED
							</div>
						</div>
					)}

					{/* Badges */}
					<div className='absolute top-3 left-3 flex flex-col gap-2'>
						{discount > 0 && (
							<Badge className='bg-gradient-to-r from-rose-500 to-red-500 text-white border-0 shadow-lg shadow-rose-500/30'>
								-{discount}%
							</Badge>
						)}
						{product.isBestseller && (
							<Badge className='bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg shadow-amber-500/30'>
								<TrendingUp size={12} className='mr-1' />
								Bestseller
							</Badge>
						)}
						{product.isFeatured && (
							<Badge className='bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-lg shadow-emerald-500/30'>
								<Star size={12} className='mr-1' />
								Featured
							</Badge>
						)}
					</div>

					{/* Category Badge */}
					<div className='absolute top-3 right-3'>
						<div
							className={`px-3 py-1 rounded-full bg-gradient-to-r ${getCategoryColor(product.category)} text-white text-xs font-medium shadow-lg`}>
							{product.category}
						</div>
					</div>

					{/* Hover Overlay */}
					<div className='absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4'>
						<Button className='bg-white text-slate-900 hover:bg-slate-100 gap-2 shadow-lg'>
							<ShoppingCart size={16} />
							View Details
						</Button>
					</div>
				</div>

				<CardContent className='p-5'>
					{/* Category */}
					<p className='text-xs text-slate-500 uppercase tracking-wide mb-2'>
						{product.category}
					</p>

					{/* Title */}
					<h3 className='font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors'>
						{product.title}
					</h3>

					{/* Description */}
					<p className='text-sm text-slate-600 line-clamp-2 mb-4'>
						{product.shortDescription || product.description}
					</p>

					{/* Rating & Sales */}
					<div className='flex items-center gap-4 mb-4'>
						<div className='flex items-center gap-1'>
							<Star
								size={14}
								className='text-amber-400 fill-amber-400'
							/>
							<span className='text-sm font-medium text-slate-700'>
								{product.rating?.average?.toFixed(1) || "0.0"}
							</span>
							<span className='text-xs text-slate-400'>
								({product.rating?.count || 0})
							</span>
						</div>
						<span className='text-slate-300'>|</span>
						<span className='text-sm text-slate-500'>
							{product.salesCount || 0} sold
						</span>
					</div>

					{/* Price */}
					<div className='flex items-baseline gap-2'>
						<span className='text-xl font-bold text-slate-900'>
							{product.currency} {product.price}
						</span>
						{product.comparePrice && product.comparePrice > 0 && (
							<span className='text-sm text-slate-400 line-through'>
								{product.currency} {product.comparePrice}
							</span>
						)}
					</div>
				</CardContent>
			</Card>
		</Link>
	);
}

function getCategoryColor(categoryValue: string) {
	const colors: Record<string, string> = {
		script: "from-blue-500 to-indigo-500",
		tool: "from-emerald-500 to-teal-500",
		course: "from-amber-500 to-orange-500",
		service: "from-rose-500 to-pink-500",
		template: "from-violet-500 to-purple-500",
		ebook: "from-cyan-500 to-sky-500",
		wordpress: "from-slate-500 to-slate-600",
		react: "from-blue-400 to-cyan-400",
		nextjs: "from-slate-600 to-slate-800",
		nodejs: "from-green-500 to-emerald-500",
		python: "from-yellow-500 to-amber-500",
		php: "from-indigo-400 to-purple-400",
		automation: "from-orange-400 to-red-400",
		seo: "from-emerald-400 to-teal-400",
		marketing: "from-pink-400 to-rose-400",
		adsense: "from-blue-500 to-blue-600",
		monetization: "from-green-500 to-teal-500",
	};
	return colors[categoryValue] || "from-slate-500 to-slate-600";
}
