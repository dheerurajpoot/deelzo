"use client";

import AddBlogForm from "@/components/add-blog-form";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Loader2 } from "lucide-react";
import AdminSidebar from "@/components/admin-sidebar";

function AddBlogContent() {
	const searchParams = useSearchParams();
	const id = searchParams.get("id");
	const [initialData, setInitialData] = useState(null);
	const [loading, setLoading] = useState(!!id);

	useEffect(() => {
		if (id) {
			fetch(`/api/blogs/${id}`)
				.then((res) => res.json())
				.then((data) => {
					if (data.success) {
						setInitialData(data.blog);
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
