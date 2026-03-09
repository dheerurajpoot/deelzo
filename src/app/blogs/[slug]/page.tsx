import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
	Calendar,
	User,
	Clock,
	ChevronRight,
	Home,
	ArrowRight,
	Image as ImageIcon,
	BookCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { connectDB } from "@/lib/mongodb";
import Blog from "@/models/Blog";
import UserModel from "@/models/User"; // Ensure User model is registered
import mongoose from "mongoose";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

// Helper to fetch blog
async function getBlog(slug: string) {
	await connectDB();
	// Ensure User model is registered before population
	const _ = UserModel;

	// Try by slug first
	let blog = await Blog.findOne({ slug, status: { $in: ["published", "pending", "rejected"] } }).populate(
		"author",
		"name avatar"
	);

	// If not found and it looks like an ID, try ID (backward compatibility)
	if (!blog && mongoose.Types.ObjectId.isValid(slug)) {
		blog = await Blog.findOne({ _id: slug, status: "published" }).populate(
			"author",
			"name avatar"
		);
	}

	return blog;
}

// Helper to fetch latest blogs
async function getLatestBlogs(currentId: any) {
	await connectDB();
	const blogs = await Blog.find({
		status: "published",
		_id: { $ne: currentId },
	})
		.sort({ createdAt: -1 })
		.limit(3)
		.populate("author", "name avatar");
	return blogs;
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const blog = await getBlog(slug);

	if (!blog) {
		return {
			title: "Blog Not Found",
		};
	}

	return {
		title: blog.seo?.metaTitle || blog.title,
		description:
			blog.seo?.metaDescription ||
			blog.content.replace(/<[^>]*>?/gm, "").substring(0, 160),
		keywords: blog.seo?.keywords?.split(","),
		alternates: {
			canonical: `${process.env.NEXT_PUBLIC_APP_URL}/blogs/${blog.slug}`,
		},
		openGraph: {
			title: blog.seo?.metaTitle || blog.title,
			description:
				blog.seo?.metaDescription ||
				blog.content.replace(/<[^>]*>?/gm, "").substring(0, 160),
			images: blog.image ? [blog.image] : [],
		},
	};
}

export default async function BlogPostPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const blog = await getBlog(slug);

	if (!blog) {
		notFound();
	}

	// Increment views
	try {
		await Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } });
	} catch (e) {
		console.error("Failed to increment views", e);
	}

	const latestBlogs = await getLatestBlogs(blog._id);

	// Calculate read time (approx 200 words per minute)
	const wordCount = blog.content
		.replace(/<[^>]*>?/gm, "")
		.split(/\s+/).length;
	const readTime = Math.ceil(wordCount / 200);

	return (
		<div className='min-h-screen bg-slate-50'>
			{/* Breadcrumb Section */}

			<article className='container mx-auto px-4 py-5 max-w-5xl'>
				<div className='container mx-auto max-w-5xl py-4'>
					<div className='flex items-center gap-2 text-sm text-slate-500'>
						<Link
							href='/'
							className='hover:text-purple-600 transition-colors flex items-center gap-1'>
							<Home size={14} />
							Home
						</Link>
						<ChevronRight size={14} />
						<Link
							href='/blogs'
							className='hover:text-purple-600 transition-colors'>
							Blogs
						</Link>
						<ChevronRight size={14} />
						<span className='text-slate-900 font-medium truncate max-w-[200px]'>
							{blog.title}
						</span>
					</div>
				</div>
				{/* Header Section */}
				<div className=' mb-6'>
					<h1 className='text-3xl md:text-5xl font-bold text-slate-900 mb-3 leading-tight'>
						{blog.title}
					</h1>

					<div className='flex flex-wrap items-center gap-2 md:gap-4 text-slate-500 text-sm'>
						<div className='flex items-center gap-2'>
							<Link
								href={`/profile/${blog.author?._id}`}
								className='flex items-center gap-2'>
								<div className='w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden relative'>
									{blog.author?.avatar ? (
										<Image
											src={blog.author.avatar}
											alt={blog.author.name}
											fill
											className='object-cover'
										/>
									) : (
										<User
											className='text-slate-400'
											size={16}
										/>
									)}
								</div>
								<span className='font-medium text-slate-900'>
									{blog.author?.name || "Unknown Author"}
								</span>
							</Link>
						</div>
						<div className='w-1 h-1 rounded-full bg-slate-300'></div>
						<div className='flex items-center gap-1'>
							<Calendar size={14} />
							<span>
								{new Date(blog.createdAt).toLocaleDateString(
									"en-US",
									{
										year: "numeric",
										month: "long",
										day: "numeric",
									}
								)}
							</span>
						</div>
						<div className='w-1 h-1 rounded-full bg-slate-300'></div>
						<div className='flex items-center gap-1'>
							<BookCheck size={14} />
							<span>{blog.category}</span>
						</div>
					</div>
				</div>

				{/* Featured Image */}
				{blog.image && (
					<div className='relative w-full aspect-video rounded-2xl overflow-hidden mb-12 shadow-xl'>
						<Image
							src={blog.image}
							alt={blog.title}
							fill
							className='object-cover'
							priority
						/>
					</div>
				)}

				{/* Content */}
				<div
					className='prose prose-lg prose-slate max-w-none 
					prose-headings:font-bold prose-headings:text-slate-900 
					prose-p:text-slate-700 prose-p:leading-relaxed
					prose-a:text-purple-600 prose-a:no-underline hover:prose-a:text-purple-700 hover:prose-a:underline
					prose-img:rounded-xl prose-img:shadow-lg
					prose-blockquote:border-l-4 prose-blockquote:border-purple-500 prose-blockquote:bg-purple-50 prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
					bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-100'
					style={{
						overflowWrap: "break-word",
						wordBreak: "break-word",
					}}
					dangerouslySetInnerHTML={{ __html: blog.content }}
				/>
			</article>

			{/* Latest Posts Section */}
			{latestBlogs.length > 0 && (
				<div className='bg-slate-100 py-16 mt-12 border-t border-slate-200'>
					<div className='container mx-auto px-4 max-w-6xl'>
						<div className='flex items-center justify-between mb-8'>
							<h2 className='text-2xl font-bold text-slate-900'>
								Latest Posts
							</h2>
							<Link href='/blogs'>
								<Button
									variant='ghost'
									className='gap-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50'>
									View All <ArrowRight size={16} />
								</Button>
							</Link>
						</div>

						<div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
							{latestBlogs.map((latestBlog: any) => (
								<Link
									href={`/blogs/${
										latestBlog.slug || latestBlog._id
									}`}
									key={latestBlog._id}
									className='group'>
									<Card className='p-0 h-full overflow-hidden hover:shadow-xl transition-all duration-300 border-none shadow-md flex flex-col bg-white'>
										<div className='relative h-48 w-full overflow-hidden bg-slate-200'>
											{latestBlog.image ? (
												<Image
													src={latestBlog.image}
													alt={latestBlog.title}
													fill
													className='object-cover transition-transform duration-500 group-hover:scale-110'
												/>
											) : (
												<div className='flex items-center justify-center h-full text-slate-400'>
													<ImageIcon
														className='opacity-50'
														size={32}
													/>
												</div>
											)}
											<div className='absolute top-3 left-3'>
												<Badge className='bg-white/90 text-slate-900 hover:bg-white shadow-sm backdrop-blur-sm'>
													{latestBlog.category ||
														"General"}
												</Badge>
											</div>
										</div>
										<CardContent className='p-5 flex-1 flex flex-col'>
											<div className='flex items-center gap-3 text-xs text-slate-500 mb-3'>
												<span className='flex items-center gap-1'>
													<Calendar size={12} />
													{new Date(
														latestBlog.createdAt
													).toLocaleDateString()}
												</span>
												<span className='flex items-center gap-1'>
													<Clock size={12} />
													{Math.ceil(
														latestBlog.content.split(
															/\s+/
														).length / 200
													)}{" "}
													min
												</span>
											</div>
											<h3 className='text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors'>
												{latestBlog.title}
											</h3>
											<p className='text-slate-600 mb-4 line-clamp-2 text-sm flex-1'>
												{latestBlog.seo
													?.metaDescription ||
													latestBlog.content
														.replace(/<[^>]*>/g, "")
														.substring(0, 100) +
														"..."}
											</p>
											<div className='flex items-center text-purple-600 font-medium text-sm mt-auto group/btn'>
												Read Article{" "}
												<ArrowRight
													size={14}
													className='ml-1 group-hover/btn:translate-x-1 transition-transform'
												/>
											</div>
										</CardContent>
									</Card>
								</Link>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
