"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle, XCircle, Plus, Pencil, Trash2, Eye } from "lucide-react";
import Image from "next/image";
import AdminSidebar from "@/components/admin-sidebar";
import Link from "next/link";

export default function AdminBlogsPage() {
	const [blogs, setBlogs] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	const fetchBlogs = async () => {
		try {
			const res = await fetch("/api/blogs?limit=100");
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
		fetchBlogs();
	}, []);

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this blog?")) return;
		try {
			const res = await fetch(`/api/blogs/${id}`, {
				method: "DELETE",
			});
			const data = await res.json();
			if (data.success) {
				toast.success("Blog deleted successfully");
				fetchBlogs();
			} else {
				toast.error(data.message || "Failed to delete blog");
			}
		} catch (error) {
			toast.error("An error occurred");
		}
	};

	const handleStatusChange = async (id: string, status: string) => {
		try {
			const res = await fetch(`/api/blogs/${id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status }),
			});
			const data = await res.json();
			if (data.success) {
				toast.success(`Blog ${status} successfully`);
				fetchBlogs();
			} else {
				toast.error(data.message || "Failed to update status");
			}
		} catch (error) {
			toast.error("An error occurred");
		}
	};

	return (
		<div className='flex min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100'>
			<AdminSidebar />
			<div className='flex-1 md:ml-64 p-4 md:p-6 lg:p-8'>
				<div className='flex justify-between mb-8 items-center'>
					<div>
						<h1 className='text-3xl font-bold text-slate-900'>
							Blog Management
						</h1>
						<p className='text-slate-500 mt-1'>
							Review and manage all blog posts
						</p>
					</div>
					<Link href='/admin/add-blog'>
						<Button className='gap-2 cursor-pointer shadow-sm hover:shadow-md transition-all'>
							<Plus size={16} /> New Blog
						</Button>
					</Link>
				</div>

				<div className='space-y-4'>
					{blogs.map((blog: any) => (
						<Card
							key={blog._id}
							className='p-0 overflow-hidden border-none shadow-sm hover:shadow-md transition-all'>
							<CardContent className='p-6 flex flex-col md:flex-row items-start gap-6'>
								{blog.image && (
									<div className='w-full md:w-48 h-32 relative rounded-lg overflow-hidden shrink-0 bg-slate-100'>
										<Image
											src={blog.image}
											alt={blog.title}
											fill
											className='object-cover'
										/>
									</div>
								)}
								<div className='flex-1 w-full'>
									<div className='flex flex-col md:flex-row justify-between items-start gap-4 mb-2'>
										<div>
											<div className='flex items-center gap-2 mb-2'>
												<span
													className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
														blog.status ===
														"published"
															? "bg-green-100 text-green-800"
															: blog.status ===
															  "rejected"
															? "bg-red-100 text-red-800"
															: blog.status ===
															  "draft"
															? "bg-slate-100 text-slate-800"
															: "bg-yellow-100 text-yellow-800"
													}`}>
													{blog.status
														.charAt(0)
														.toUpperCase() +
														blog.status.slice(1)}
												</span>
												<span className='text-xs text-slate-500'>
													By {blog.author?.name}
												</span>
												<span className='text-xs text-slate-400'>
													•
												</span>
												<span className='text-xs text-slate-400'>
													{new Date(
														blog.createdAt
													).toLocaleDateString()}
												</span>
											</div>
											<h3 className='font-bold text-lg text-slate-900'>
												{blog.title}
											</h3>
										</div>
										<div className='flex gap-2 shrink-0'>
											{blog.status === "pending" && (
												<>
													<Button
														size='sm'
														className='bg-green-600 hover:bg-green-700'
														onClick={() =>
															handleStatusChange(
																blog._id,
																"published"
															)
														}>
														<CheckCircle
															size={16}
															className='mr-1'
														/>
														Approve
													</Button>
													<Button
														size='sm'
														variant='destructive'
														onClick={() =>
															handleStatusChange(
																blog._id,
																"rejected"
															)
														}>
														<XCircle
															size={16}
															className='mr-1'
														/>
														Reject
													</Button>
												</>
											)}
											<Link
												href={`/admin/add-blog?id=${blog._id}`}>
												<Button
													variant='outline'
													size='icon'>
													<Pencil size={16} />
												</Button>
											</Link>
											<Link
												href={`/blogs/${blog.slug}`} target="_blank">
												<Button
													variant='outline'
													size='icon'>
													<Eye size={16} />
												</Button>
											</Link>
											<Button
												variant='ghost'
												size='icon'
												className='text-red-500 hover:bg-red-50'
												onClick={() =>
													handleDelete(blog._id)
												}>
												<Trash2 size={16} />
											</Button>
										</div>
									</div>
									<p className='text-sm text-slate-600 line-clamp-2'>
										{blog.seo?.metaDescription ||
											blog.content.replace(
												/<[^>]*>?/gm,
												""
											)}
									</p>
								</div>
							</CardContent>
						</Card>
					))}
					{blogs.length === 0 && (
						<div className='text-center py-12 bg-white rounded-xl border border-dashed border-slate-200'>
							<p className='text-slate-500'>No blogs found</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
