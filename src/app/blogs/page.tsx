"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Calendar, User, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const CATEGORIES = [
	"All",
	"General",
	"Technology",
	"Business",
	"Lifestyle",
	"Health",
	"Travel",
	"Food",
	"Education",
];

export default function BlogsPage() {
	const [blogs, setBlogs] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [category, setCategory] = useState("All");

	const fetchBlogs = async () => {
		setLoading(true);
		try {
			const queryParams = new URLSearchParams();
			queryParams.append("status", "published");
			if (search) queryParams.append("search", search);
			if (category !== "All") queryParams.append("category", category);

			const res = await fetch(`/api/blogs?${queryParams.toString()}`);
			const data = await res.json();
			if (data.success) {
				setBlogs(data.blogs);
			}
		} catch (error) {
			console.error("Failed to fetch blogs:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		const timeout = setTimeout(() => {
			fetchBlogs();
		}, 500);
		return () => clearTimeout(timeout);
	}, [search, category]);

	return (
		<div className='min-h-screen bg-slate-50 pb-20'>
			{/* Hero Section */}
			<div className='bg-slate-900 text-white py-20 relative overflow-hidden'>
				<div className='absolute inset-0 bg-linear-to-r from-purple-900/50 to-blue-900/50'></div>
				<div className='container mx-auto px-4 text-center relative z-10'>
					<h1 className='text-4xl md:text-5xl font-bold mb-4'>
						Our Blog
					</h1>
					<p className='text-slate-300 text-lg max-w-2xl mx-auto'>
						Discover the latest insights, tutorials, and trends in
						the digital world.
					</p>
				</div>
			</div>

			{/* Filters */}
			<div className='container mx-auto px-4 -mt-8 relative z-20'>
				<Card className='p-4 shadow-lg border-0'>
					<div className='flex flex-col md:flex-row gap-4 items-center justify-between'>
						<div className='flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto hide-scrollbar'>
							{CATEGORIES.map((cat) => (
								<Button
									key={cat}
									variant={
										category === cat ? "default" : "outline"
									}
									onClick={() => setCategory(cat)}
									className={`whitespace-nowrap rounded-full ${
										category === cat
											? "bg-purple-600 hover:bg-purple-700"
											: ""
									}`}
									size='sm'>
									{cat}
								</Button>
							))}
						</div>
						<div className='relative w-full md:w-72'>
							<Search
								className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
								size={16}
							/>
							<Input
								placeholder='Search blogs...'
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className='pl-9 rounded-full border-slate-200 focus:border-purple-500'
							/>
						</div>
					</div>
				</Card>
			</div>

			{/* Blog Grid */}
			<div className='container mx-auto px-4 py-12'>
				{loading ? (
					<div className='flex justify-center py-20'>
						<Loader2 className='animate-spin w-8 h-8 text-purple-600' />
					</div>
				) : blogs.length > 0 ? (
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
						{blogs.map((blog) => (
							<Link
								href={`/blogs/${blog.slug || blog._id}`}
								key={blog._id}
								className='group'>
								<Card className='p-0 h-full overflow-hidden hover:shadow-xl transition-shadow border-0 shadow-md flex flex-col bg-white'>
									<div className='relative h-48 w-full overflow-hidden bg-slate-200'>
										{blog.image ? (
											<Image
												src={blog.image}
												alt={blog.title}
												fill
												className='object-cover transition-transform duration-500 group-hover:scale-110'
											/>
										) : (
											<div className='flex items-center justify-center h-full text-slate-400'>
												No Image
											</div>
										)}
										<div className='absolute top-4 left-4'>
											<Badge className='bg-white/90 text-slate-900 hover:bg-white shadow-sm backdrop-blur-sm'>
												{blog.category || "General"}
											</Badge>
										</div>
									</div>
									<CardContent className='p-6 flex-1 flex flex-col'>
										<div className='flex items-center gap-4 text-xs text-slate-500 mb-3'>
											<span className='flex items-center gap-1'>
												<Calendar size={14} />
												{new Date(
													blog.createdAt
												).toLocaleDateString()}
											</span>
											<span className='flex items-center gap-1'>
												<User size={14} />
												{blog.author?.name || "Admin"}
											</span>
										</div>
										<h3 className='text-xl font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-purple-600 transition-colors'>
											{blog.title}
										</h3>
										<p className='text-slate-600 mb-4 line-clamp-3 text-sm flex-1'>
											{blog.seo?.metaDescription ||
												(blog.content
													? blog.content
															.replace(
																/<[^>]*>/g,
																""
															)
															.substring(0, 150) +
													  "..."
													: "No content")}
										</p>
										<div className='flex items-center text-purple-600 font-medium text-sm mt-auto group/btn'>
											Read More{" "}
											<ArrowRight
												size={16}
												className='ml-1 group-hover/btn:translate-x-1 transition-transform'
											/>
										</div>
									</CardContent>
								</Card>
							</Link>
						))}
					</div>
				) : (
					<div className='text-center py-20'>
						<div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4'>
							<Search className='w-8 h-8 text-slate-400' />
						</div>
						<h3 className='text-2xl font-bold text-slate-900 mb-2'>
							No blogs found
						</h3>
						<p className='text-slate-600'>
							Try adjusting your search or category filter.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
