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
		<AddBlogForm
			redirectPath='/admin/blogs'
			initialData={initialData}
			title={id ? "Edit Blog" : "Create New Blog"}
		/>
	);
}

export default function AdminAddBlogPage() {
	return (
		<div className='flex min-h-[calc(100vh-92px)] bg-linear-to-br from-slate-50 via-white to-slate-100'>
			<AdminSidebar />
			<div className='flex-1 md:ml-64 p-4 md:p-6 lg:p-8'>
				<Suspense
					fallback={
						<div className='flex justify-center p-8'>
							<Loader2 className='animate-spin' />
						</div>
					}>
					<AddBlogContent />
				</Suspense>
			</div>
		</div>
	);
}
