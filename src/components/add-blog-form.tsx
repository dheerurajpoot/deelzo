"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Loader2,
	Upload,
	X,
	ArrowLeft,
	Image as ImageIcon,
	Save,
	Send,
} from "lucide-react";
import Image from "next/image";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import { toast } from "sonner";
import axios from "axios";
import { userContext } from "@/context/userContext";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import Link from "next/link";

// Dynamic import for ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const CATEGORIES = [
	"General",
	"Technology",
	"Business",
	"Lifestyle",
	"Health",
	"Travel",
	"Food",
	"Education",
];

interface AddBlogFormProps {
	redirectPath?: string;
	title?: string;
	initialData?: any;
}

export default function AddBlogForm({
	redirectPath,
	title = "Create New Blog",
	initialData,
}: AddBlogFormProps) {
	const router = useRouter();
	const { user } = userContext();
	const [loading, setLoading] = useState(false);
	const [uploadingImage, setUploadingImage] = useState(false);
	const [showGuidelines, setShowGuidelines] = useState(false);

	const [formData, setFormData] = useState({
		title: "",
		slug: "",
		content: "",
		category: "General",
		image: "",
		seo: {
			metaTitle: "",
			metaDescription: "",
			keywords: "",
		},
	});
	const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

	// Helper function to slugify title
	const slugifyTitle = (title: string) => {
		return title
			.toString()
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9\s-]/g, "")
			.replace(/\s+/g, "-")
			.replace(/-+/g, "-");
	};

	useEffect(() => {
		if (initialData) {
			setFormData({
				title: initialData.title || "",
				slug: initialData.slug || "",
				content: initialData.content || "",
				category: initialData.category || "General",
				image: initialData.image || "",
				seo: {
					metaTitle: initialData.seo?.metaTitle || "",
					metaDescription: initialData.seo?.metaDescription || "",
					keywords: initialData.seo?.keywords || "",
				},
			});
			setIsSlugManuallyEdited(!!initialData.slug);
		}
	}, [initialData]);

	// Auto-generate slug from title when title changes (if slug hasn't been manually edited)
	useEffect(() => {
		if (!isSlugManuallyEdited && formData.title) {
			const generatedSlug = slugifyTitle(formData.title);
			setFormData((prev) => ({ ...prev, slug: generatedSlug }));
		}
	}, [formData.title, isSlugManuallyEdited]);

	useEffect(() => {
		if (!initialData) {
			setShowGuidelines(true);
		}
	}, [initialData]);

	const modules = useMemo(
		() => ({
			toolbar: [
				[{ header: [1, 2, 3, 4, 5, 6, false] }],
				["bold", "italic", "underline", "strike", "blockquote"],
				[
					{ list: "ordered" },
					{ list: "bullet" },
					{ indent: "-1" },
					{ indent: "+1" },
				],
				["link", "image"],
				["clean"],
			],
		}),
		[]
	);

	const handleImageUpload = async (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setUploadingImage(true);
		try {
			// Get ImageKit auth
			const authRes = await axios.get("/api/imagekit/auth");
			const { token, expire, signature, publicKey } = authRes.data;

			const form = new FormData();
			form.append("file", file);
			form.append("fileName", file.name);
			form.append("publicKey", publicKey);
			form.append("signature", signature);
			form.append("expire", String(expire));
			form.append("token", token);
			form.append("useUniqueFileName", "true");

			const uploadRes = await axios.post(
				"https://upload.imagekit.io/api/v1/files/upload",
				form
			);

			if (uploadRes.data && uploadRes.data.url) {
				setFormData((prev) => ({ ...prev, image: uploadRes.data.url }));
				toast.success("Image uploaded successfully");
			} else {
				throw new Error("No URL returned");
			}
		} catch (error: any) {
			console.error("Upload failed:", error);
			// Fallback to local upload if ImageKit fails or not configured
			try {
				const formData = new FormData();
				formData.append("file", file);
				const localRes = await axios.post("/api/upload", formData);
				if (localRes.data.success) {
					setFormData((prev) => ({
						...prev,
						image: localRes.data.url,
					}));
					toast.success("Image uploaded successfully (local)");
				} else {
					toast.error("Failed to upload image");
				}
			} catch (localError) {
				toast.error("Image upload failed");
			}
		} finally {
			setUploadingImage(false);
		}
	};

	const removeImage = () => {
		setFormData((prev) => ({ ...prev, image: "" }));
	};

	const handleSubmit = async (status: "published" | "draft") => {
		if (!formData.title || !formData.content) {
			toast.error("Title and content are required");
			return;
		}

		setLoading(true);
		try {
			const payload = { ...formData, status };
			let res;

			if (initialData?._id) {
				res = await axios.put(`/api/blogs/${initialData._id}`, payload);
			} else {
				res = await axios.post("/api/blogs", payload);
			}

			if (res.data.success) {
				toast.success(
					status === "draft"
						? "Draft saved successfully!"
						: user?.role === "admin"
						? "Blog published successfully!"
						: "Blog submitted for review!"
				);
				if (redirectPath) {
					router.push(redirectPath);
				} else {
					router.push(
						user?.role === "admin"
							? "/admin/blogs"
							: "/dashboard/blogs"
					);
				}
			} else {
				toast.error(res.data.message || "Failed to save blog");
			}
		} catch (error: any) {
			const msg = error.response?.data?.message || "An error occurred";
			toast.error(msg);
		} finally {
			setLoading(false);
		}
	};

	const formats = useMemo(
		() => [
			"header",
			"bold",
			"italic",
			"underline",
			"strike",
			"blockquote",
			"list",
			"indent",
			"link",
			"image",
			"size",
			"align",
			"code",
			"code-block",
		],
		[]
	);

	return (
		<div className='max-w-6xl mx-auto space-y-8'>
			<Dialog open={showGuidelines} onOpenChange={setShowGuidelines}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Writing Guidelines</DialogTitle>
						<DialogDescription>
							Keep posts clear, helpful, and engaging.
						</DialogDescription>
					</DialogHeader>
					<div className='space-y-2 text-sm text-slate-700'>
						<p>• Use a concise, descriptive title (Only English)</p>
						<p>
							• Structure with headings (H2/H3) like <Link className="font-semibold text-green-600" target="_blank" href='https://www.deelzo.com/blogs/what-fountain-is-gwynn-at'>Demo Blog</Link>
						</p>
						<p>
							• Add a featured image (Under 100KB) and relevant
							category
						</p>
						<p>• Include internal/external links where useful</p>
						<p>
							• Casino/Gambling/Betting related content is
							strictly prohibited
						</p>
						<p>
							• Fill SEO fields: meta title, description, keywords
						</p>
						<p>• Proofread for grammar and clarity</p>
						<p>• Every post must be original and not plagiarized</p>
						<p>
							• All Posts and Links are reviewed by Deelzo Team.
						</p>
					</div>
					<DialogFooter>
						<Button onClick={() => setShowGuidelines(false)}>
							Got it
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
			<div className='flex flex-col md:flex-row gap-5 items-center md:justify-between'>
				<div className='flex items-center gap-4'>
					<Button
						variant='ghost'
						size='icon'
						onClick={() => router.back()}
						className='rounded-full'>
						<ArrowLeft size={20} />
					</Button>
					<div>
						<h1 className='text-3xl font-bold text-slate-900'>
							{initialData ? "Edit Blog" : title}
						</h1>
						<p className='text-slate-500'>
							{initialData
								? "Update your content"
								: "Share your thoughts with the world"}
						</p>
					</div>
				</div>
				<div className='flex gap-2'>
					<Button
						variant='outline'
						onClick={() => handleSubmit("draft")}
						disabled={loading}>
						{loading ? (
							<Loader2 className='h-4 w-4 animate-spin' />
						) : (
							<Save className='h-4 w-4 mr-2' />
						)}
						Save Draft
					</Button>
					<Button
						onClick={() => handleSubmit("published")}
						disabled={loading}>
						{loading ? (
							<Loader2 className='h-4 w-4 animate-spin' />
						) : (
							<Send className='h-4 w-4 mr-2' />
						)}
						{user?.role === "admin" ? "Publish" : "Submit Review"}
					</Button>
				</div>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
				<div className='lg:col-span-2 space-y-6'>
					<Card className='p-0 border-none shadow-sm'>
						<CardContent className='p-6 space-y-6'>
							<div className='space-y-2'>
								<Label htmlFor='title'>Blog Title</Label>
								<Input
									id='title'
									value={formData.title}
									onChange={(e) =>
										setFormData({
											...formData,
											title: e.target.value,
										})
									}
									placeholder='Enter an engaging title'
									className='text-lg md:text-xl font-medium'
								/>
							</div>

							<div className='space-y-2'>
								<Label htmlFor='slug'>URL Slug</Label>
								<Input
									id='slug'
									value={formData.slug}
									onChange={(e) => {
										setFormData({
											...formData,
											slug: slugifyTitle(e.target.value),
										});
										setIsSlugManuallyEdited(true);
									}}
									placeholder='blog-post-url-slug'
									className='font-mono text-sm'
								/>
								<p className='text-xs text-slate-500'>
									Auto-generated from title. You can customize
									it.
								</p>
							</div>

							<div className='space-y-2'>
								<Label>Content</Label>
								<div className='mb-12'>
									<div className='pro-editor h-[600px]'>
										<ReactQuill
											theme='snow'
											placeholder='Write your content here...'
											value={formData.content}
											onChange={(value: string) =>
												setFormData({
													...formData,
													content: value,
												})
											}
											modules={{
												...modules,
												toolbar: [
													[
														{
															header: [
																1,
																2,
																3,
																4,
																5,
																6,
																false,
															],
														},
													],
													[
														{
															size: [
																"small",
																false,
																"large",
																"huge",
															],
														},
													],
													[
														"bold",
														"italic",
														"underline",
														"strike",
														"blockquote",
													],
													[
														{ list: "ordered" },
														{ list: "bullet" },
														{ indent: "-1" },
														{ indent: "+1" },
													],
													[{ align: [] }],
													["link", "image"],
													["clean"],
												],
											}}
											formats={formats}
											className='h-full'
										/>
									</div>
									<style jsx>{`
										.pro-editor :global(.ql-toolbar) {
											border: 1px solid #e2e8f0;
											border-radius: 12px 12px 0 0;
											background: #f8fafc;
											padding: 12px 14px;
											position: sticky;
											top: 0;
											z-index: 10;
										}
										.pro-editor
											:global(
												.ql-toolbar .ql-formats button
											),
										.pro-editor
											:global(.ql-toolbar .ql-picker),
										.pro-editor
											:global(
												.ql-toolbar .ql-picker-label
											),
										.pro-editor
											:global(
												.ql-toolbar .ql-picker-item
											) {
											font-size: 15px;
										}
										.pro-editor :global(.ql-container) {
											border: 1px solid #e2e8f0;
											border-top: none;
											border-radius: 0 0 12px 12px;
											box-shadow: 0 10px 16px -4px rgba(15, 23, 42, 0.08);
											height: calc(100% - 10px);
										}
										.pro-editor :global(.ql-editor) {
											font-size: 18px;
											line-height: 1.9;
											letter-spacing: 0.01em;
											word-spacing: 0.06em;
											color: #0f172a;
											padding: 24px;
										}
										.pro-editor :global(.ql-editor p) {
											margin: 0 0 1.2em 0;
										}
										.pro-editor :global(.ql-editor h1) {
											font-size: 2.25rem;
											line-height: 1.2;
											margin: 1.2em 0 0.6em;
											font-weight: 800;
											letter-spacing: -0.01em;
										}
										.pro-editor :global(.ql-editor h2) {
											font-size: 1.745rem;
											line-height: 1.25;
											margin: 1.1em 0 0.55em;
											font-weight: 700;
										}
										.pro-editor :global(.ql-editor h3) {
											font-size: 1.5rem;
											line-height: 1.35;
											margin: 1em 0 0.5em;
											font-weight: 700;
										}
										.pro-editor
											:global(.ql-editor blockquote) {
											border-left: 4px solid #38bdf8;
											padding-left: 16px;
											margin: 1.2em 0;
											color: #334155;
											background: #f0f9ff;
											border-radius: 8px;
										}
										.pro-editor :global(.ql-editor a) {
											color: #0284c7;
											text-decoration: underline;
											font-weight: 600;
										}
										.pro-editor :global(.ql-editor ul),
										.pro-editor :global(.ql-editor ol) {
											padding-left: 1.25rem;
											margin: 0.8em 0 1.2em;
										}
										.pro-editor :global(.ql-editor img) {
											border-radius: 12px;
											box-shadow: 0 12px 20px -6px rgba(15, 23, 42, 0.2);
											margin: 1rem auto;
											display: block;
											max-width: 100%;
										}
										.pro-editor :global(.ql-editor pre),
										.pro-editor :global(.ql-editor code) {
											background: #0b1220;
											color: #e5e7eb;
											border-radius: 8px;
											padding: 0.5rem 0.75rem;
											font-family: ui-monospace,
												SFMono-Regular, Menlo, Monaco,
												Consolas, "Liberation Mono",
												"Courier New", monospace;
										}
										.pro-editor
											:global(
												.ql-editor.ql-blank::before
											) {
											color: #94a3b8;
											font-size: 1rem;
										}
									`}</style>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				<div className='space-y-6'>
					<Card className='border-none shadow-sm'>
						<CardHeader>
							<CardTitle className='text-lg'>
								Publishing Details
							</CardTitle>
						</CardHeader>
						<CardContent className='space-y-6'>
							<div className='space-y-2'>
								<Label>Category</Label>
								<Select
									value={formData.category}
									onValueChange={(value) =>
										setFormData({
											...formData,
											category: value,
										})
									}>
									<SelectTrigger>
										<SelectValue placeholder='Select category' />
									</SelectTrigger>
									<SelectContent>
										{CATEGORIES.map((cat) => (
											<SelectItem key={cat} value={cat}>
												{cat}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className='space-y-2'>
								<Label>Featured Image</Label>
								{formData.image && formData.image !== "" ? (
									<div className='relative aspect-video rounded-lg overflow-hidden border'>
										<Image
											src={formData.image}
											alt='Featured'
											fill
											className='object-cover'
										/>
										<Button
											variant='destructive'
											size='icon'
											className='absolute top-2 right-2 h-8 w-8'
											onClick={removeImage}>
											<X size={16} />
										</Button>
									</div>
								) : (
									<div className='border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 transition-colors cursor-pointer relative'>
										<Input
											type='file'
											accept='image/*'
											className='absolute inset-0 h-full opacity-0 cursor-pointer'
											onChange={handleImageUpload}
											disabled={uploadingImage}
										/>
										{uploadingImage ? (
											<Loader2 className='h-8 w-8 animate-spin text-slate-400' />
										) : (
											<div className='flex flex-col items-center text-slate-500'>
												<div className='p-3 bg-slate-100 rounded-full mb-2'>
													<Upload size={20} />
												</div>
												<span className='text-sm font-medium'>
													Click to upload
												</span>
												<span className='text-xs text-slate-400'>
													JPG, PNG, WebP
												</span>
											</div>
										)}
									</div>
								)}
							</div>
							<div><p>Thumbnail Template - <Link target="_blank" className="text-blue-600" href='https://www.canva.com/design/DAG_UdJDzos/de15RUfbt_iJ5W2MT42WuA/edit?utm_content=DAG_UdJDzos&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton'>Create Thumbnail</Link></p></div>
						</CardContent>
					</Card>

					<Card className='border-none shadow-sm'>
						<CardHeader>
							<CardTitle className='text-lg'>
								SEO Settings
							</CardTitle>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='space-y-2'>
								<div className='flex justify-between'>
									<Label>Meta Title</Label>
									<span
										className={`text-xs ${
											formData.seo.metaTitle.length > 60
												? "text-red-500"
												: "text-slate-500"
										}`}>
										{formData.seo.metaTitle.length}/60
									</span>
								</div>
								<Input
									value={formData.seo.metaTitle}
									onChange={(e) =>
										setFormData({
											...formData,
											seo: {
												...formData.seo,
												metaTitle: e.target.value,
											},
										})
									}
									placeholder='SEO Title'
								/>
							</div>

							<div className='space-y-2'>
								<div className='flex justify-between'>
									<Label>Meta Description</Label>
									<span
										className={`text-xs ${
											formData.seo.metaDescription
												.length > 160
												? "text-red-500"
												: "text-slate-500"
										}`}>
										{formData.seo.metaDescription.length}
										/160
									</span>
								</div>
								<Textarea
									value={formData.seo.metaDescription}
									onChange={(e) =>
										setFormData({
											...formData,
											seo: {
												...formData.seo,
												metaDescription: e.target.value,
											},
										})
									}
									placeholder='Brief description for search engines'
									className='resize-none'
									rows={4}
								/>
							</div>

							<div className='space-y-2'>
								<Label>Keywords</Label>
								<Input
									value={formData.seo.keywords}
									onChange={(e) =>
										setFormData({
											...formData,
											seo: {
												...formData.seo,
												keywords: e.target.value,
											},
										})
									}
									placeholder='Comma separated keywords'
								/>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
