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
import { db } from "@/lib/firebase/admin";
import { getBlogByIdOrSlug } from "@/lib/db/blogs";
import { getUserById } from "@/lib/db/users";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

async function getBlog(slug: string) {
	let blog = await getBlogByIdOrSlug(slug);

	if (!blog) return null;
	if (!["published", "pending", "rejected"].includes((blog as any).status)) return null;

	if (blog.author) {
		const authorData = await getUserById(blog.author);
		if (authorData) {
			blog.author = {
				_id: authorData._id,
				name: authorData.name,
				avatar: authorData.avatar
			};
		}
	}

	return blog;
}

async function getLatestBlogs(currentId: string) {
	const snapshot = await db.collection("blogs")
		.where("status", "==", "published")
		.get();
		
	let allPBlogs = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() } as any));
	
	allPBlogs.sort((a, b) => {
		const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
		const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
		return timeB - timeA;
	});

	let blogs = allPBlogs
		.filter(b => b._id !== currentId)
		.slice(0, 3);
		
	if (blogs.length > 0) {
		const rawAuthorIds = [...new Set(blogs.map(b => b.author))];
		const authorIds = rawAuthorIds.map(id => typeof id === 'string' ? id : (id._id || id.id || id.toString())).filter(Boolean);
		const authorsMap: Record<string, any> = {};
		
		for (let i = 0; i < authorIds.length; i += 10) {
			const batch = authorIds.slice(i, i + 10);
			if (batch.length > 0) {
				const authorsSnapshot = await db.collection("users").where("__name__", "in", batch).get();
				authorsSnapshot.forEach(doc => {
					authorsMap[doc.id] = { _id: doc.id, name: doc.data().name, avatar: doc.data().avatar };
				});
			}
		}

		blogs = blogs.map(b => ({
			...b,
			author: authorsMap[b.author] || { _id: b.author, name: "Unknown" }
		}));
	}
	// Deep serialize
	const serializeFirebaseData = (obj: any): any => {
		if (obj === null || obj === undefined) return obj;
		if (typeof obj?.toDate === "function") return obj.toDate().toISOString();
		if (typeof obj === "object" && obj._seconds !== undefined && obj._nanoseconds !== undefined) {
			return new Date(obj._seconds * 1000).toISOString();
		}
		if (obj instanceof Date) return obj.toISOString();
		if (Array.isArray(obj)) return obj.map(serializeFirebaseData);
		if (typeof obj === "object") {
			const res: any = {};
			for (const key in obj) {
				res[key] = serializeFirebaseData(obj[key]);
			}
			return res;
		}
		return obj;
	};

	return serializeFirebaseData(blogs);
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

	try {
        const { FieldValue } = require("firebase-admin/firestore");
		await db.collection("blogs").doc(blog._id).update({
            views: FieldValue.increment(1)
        });
	} catch (e) {
		console.error("Failed to increment views", e);
	}

	const latestBlogs = await getLatestBlogs(blog._id);

	const wordCount = blog.content
		.replace(/<[^>]*>?/gm, "")
		.split(/\s+/).length;
	const readTime = Math.ceil(wordCount / 200);

	return (
		<div className='min-h-screen bg-slate-50'>
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
								{new Date(blog.createdAt?.toDate ? blog.createdAt.toDate() : blog.createdAt).toLocaleDateString(
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
														latestBlog.createdAt?.toDate ? latestBlog.createdAt.toDate() : latestBlog.createdAt
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
