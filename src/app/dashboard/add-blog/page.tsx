"use client";

import AddBlogForm from "@/components/add-blog-form";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Loader2 } from "lucide-react";
import AdminSidebar from "@/components/admin-sidebar";
import { blogService } from "@/services/blogService";

function AddBlogContent() {
	const searchParams = useSearchParams();
	const id = searchParams.get("id");
	const [initialData, setInitialData] = useState(null);
	const [loading, setLoading] = useState(!!id);

	useEffect(() => {
		if (id) {
            blogService.getBlog(id)
				.then((blog) => {
					if (blog) {
						setInitialData(blog as any);
					}
				})
				.finally(() => setLoading(false));
		}
	}, [id]);

	if (loading) {
		return (
			<div className='flex justify-center p-8'>
				<Loader2 className='animate-spin' />
			</div>
		);
	}

	return (
		<div className='md:ml-64 p-6'>
			<AddBlogForm
				redirectPath='/dashboard/blogs'
				initialData={initialData}
				title={id ? "Edit Blog" : "Create New Blog"}
			/>
		</div>
	);
}

export default function AddBlogPage() {
	return (
		<Suspense

			fallback={
				<div className='flex justify-center p-8'>
					<Loader2 className='animate-spin' />
				</div>
			}>
			<AdminSidebar role="user" />
			<AddBlogContent />
		</Suspense>
	);
}
