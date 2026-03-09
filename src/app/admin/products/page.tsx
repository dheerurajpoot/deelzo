"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Package,
	Plus,
	Search,
	Edit,
	Trash2,
	Eye,
	Loader2,
	CheckCircle,
	XCircle,
	Clock,
	Star,
	Upload,
	X,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import AdminSidebar from "@/components/admin-sidebar";
import Link from "next/link";

// Dynamic import for ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

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
	images: string[];
	thumbnail?: string;
	status: "draft" | "active" | "archived";
	stock: number;
	salesCount: number;
	rating: {
		average: number;
		count: number;
	};
	isFeatured: boolean;
	isBestseller: boolean;
	demoUrl?: string;
	videoUrl?: string;
	createdAt: string;
	downloadOptions?: {
		type: "upload" | "link";
		file?: {
			name: string;
			url: string;
			size: string;
			type: string;
		};
		link?: string;
	};
}

const categories = [
	// Product Types
	{ value: "script", label: "💻 Code Script" },
	{ value: "tool", label: "🛠️ Tool/Software" },
	{ value: "course", label: "📚 Course" },
	{ value: "service", label: "🎯 Service" },
	{ value: "template", label: "📄 Template" },
	{ value: "ebook", label: "📖 E-Book" },
	// Tech Categories
	{ value: "wordpress", label: "WordPress" },
	{ value: "react", label: "React" },
	{ value: "nextjs", label: "Next.js" },
	{ value: "nodejs", label: "Node.js" },
	{ value: "python", label: "Python" },
	{ value: "php", label: "PHP" },
	// Other Categories
	{ value: "automation", label: "Automation" },
	{ value: "seo", label: "SEO" },
	{ value: "marketing", label: "Marketing" },
	{ value: "design", label: "Design" },
	{ value: "adsense", label: "AdSense" },
	{ value: "monetization", label: "Monetization" },
	{ value: "other", label: "Other" },
];

export default function AdminProductsPage() {
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<string>("all");
	const [selectedStatus, setSelectedStatus] = useState<string>("all");
	const [uploadingImage, setUploadingImage] = useState(false);
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [editingProduct, setEditingProduct] = useState<Product | null>(null);
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		shortDescription: "",
		category: "script",
		price: "",
		comparePrice: "",
		currency: "INR",
		status: "draft",
		stock: "-1",
		isFeatured: false,
		isBestseller: false,
		images: [] as string[],
		thumbnail: "",
		features: [] as string[],
		demoUrl: "",
		videoUrl: "",
		downloadOptions: {
			type: "upload" as "upload" | "link",
			file: {
				name: "",
				url: "",
				size: "",
				type: "",
			},
			link: "",
		} as {
			type: "upload" | "link";
			file: { name: string; url: string; size: string; type: string };
			link: string;
		},
	});

	const fetchProducts = async () => {
		try {
			setLoading(true);
			const response = await axios.get("/api/products?limit=100&status=");
			setProducts(response.data.products || []);
		} catch (error) {
			toast.error("Failed to fetch products");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchProducts();
	}, []);

	const handleCreate = async () => {
		try {
			const payload = {
				...formData,
				price: parseFloat(formData.price),
				comparePrice: formData.comparePrice
					? parseFloat(formData.comparePrice)
					: undefined,
				stock: parseInt(formData.stock),
			};

			await axios.post("/api/products", payload);
			toast.success("Product created successfully");
			setIsAddDialogOpen(false);
			resetForm();
			fetchProducts();
		} catch (error: any) {
			toast.error(
				error.response?.data?.message || "Failed to create product",
			);
		}
	};

	const handleUpdate = async () => {
		if (!editingProduct) return;

		try {
			const payload = {
				...formData,
				price: parseFloat(formData.price),
				comparePrice: formData.comparePrice
					? parseFloat(formData.comparePrice)
					: undefined,
				stock: parseInt(formData.stock),
			};

			await axios.put(`/api/products/${editingProduct._id}`, payload);
			toast.success("Product updated successfully");
			setIsEditDialogOpen(false);
			setEditingProduct(null);
			fetchProducts();
		} catch (error: any) {
			toast.error(
				error.response?.data?.message || "Failed to update product",
			);
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this product?")) return;

		try {
			await axios.delete(`/api/products/${id}`);
			toast.success("Product deleted successfully");
			fetchProducts();
		} catch (error) {
			toast.error("Failed to delete product");
		}
	};

	const openEditDialog = (product: Product) => {
		setEditingProduct(product);
		setFormData({
			title: product.title,
			description: product.description,
			shortDescription: product.shortDescription || "",
			category: product.category,
			price: product.price.toString(),
			comparePrice: product.comparePrice?.toString() || "",
			currency: product.currency || "INR",
			status: product.status,
			stock: product.stock.toString(),
			isFeatured: product.isFeatured,
			isBestseller: product.isBestseller,
			images: product.images || [],
			thumbnail: product.thumbnail || "",
			features: [],
			demoUrl: product.demoUrl || "",
			videoUrl: product.videoUrl || "",
			downloadOptions: {
				type: product.downloadOptions?.type || "upload",
				file: product.downloadOptions?.file || {
					name: "",
					url: "",
					size: "",
					type: "",
				},
				link: product.downloadOptions?.link || "",
			} as {
				type: "upload" | "link";
				file: { name: string; url: string; size: string; type: string };
				link: string;
			},
		});
		setIsEditDialogOpen(true);
	};

	// Reset form to default values
	const resetForm = () => {
		setFormData({
			title: "",
			description: "",
			shortDescription: "",
			category: "script",
			price: "",
			comparePrice: "",
			currency: "INR",
			status: "draft",
			stock: "-1",
			isFeatured: false,
			isBestseller: false,
			images: [],
			thumbnail: "",
			features: [],
			demoUrl: "",
			videoUrl: "",
			downloadOptions: {
				type: "upload",
				file: {
					name: "",
					url: "",
					size: "",
					type: "",
				},
				link: "",
			} as {
				type: "upload" | "link";
				file: { name: string; url: string; size: string; type: string };
				link: string;
			},
		});
	};

	const handleDownloadFileUpload = async (
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = e.target.files?.[0];
		if (!file || !editingProduct) return;

		try {
			setUploadingImage(true);

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
			form.append("folder", "/downloads");

			const uploadRes = await axios.post(
				"https://upload.imagekit.io/api/v1/files/upload",
				form,
			);

			if (uploadRes.data && uploadRes.data.url) {
				setFormData((prev) => ({
					...prev,
					downloadOptions: {
						...prev.downloadOptions,
						type: "upload",
						file: {
							name: file.name,
							url: uploadRes.data.url,
							size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
							type: file.type,
							imageKitFileId: uploadRes.data.fileId, // Store ImageKit file ID
						},
					},
				}));
				toast.success("Download file uploaded successfully");
			}
		} catch (error: any) {
			console.error("Upload failed:", error);
			toast.error(
				error.response?.data?.message ||
					"Failed to upload download file",
			);
		} finally {
			setUploadingImage(false);
		}
	};

	const handleImageUpload = useCallback(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			const files = e.target.files;
			if (!files || files.length === 0) return;

			setUploadingImage(true);
			const uploadedImages: string[] = [];

			try {
				for (let i = 0; i < files.length; i++) {
					const file = files[i];

					// Get ImageKit auth
					const authRes = await axios.get("/api/imagekit/auth");
					const { token, expire, signature, publicKey } =
						authRes.data;

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
						form,
					);

					if (uploadRes.data && uploadRes.data.url) {
						uploadedImages.push(uploadRes.data.url);
					}
				}

				if (uploadedImages.length > 0) {
					setFormData((prev) => ({
						...prev,
						images: [...prev.images, ...uploadedImages],
						// Set first image as thumbnail if no thumbnail set
						thumbnail: prev.thumbnail || uploadedImages[0],
					}));
					toast.success(
						`${uploadedImages.length} image(s) uploaded successfully`,
					);
				}
			} catch (error: any) {
				console.error("Upload failed:", error);
				// Fallback to local upload if ImageKit fails
				try {
					for (let i = 0; i < files.length; i++) {
						const file = files[i];
						const formData = new FormData();
						formData.append("file", file);
						const localRes = await axios.post(
							"/api/upload",
							formData,
						);
						if (localRes.data.success) {
							uploadedImages.push(localRes.data.url);
						}
					}
					if (uploadedImages.length > 0) {
						setFormData((prev) => ({
							...prev,
							images: [...prev.images, ...uploadedImages],
							thumbnail: prev.thumbnail || uploadedImages[0],
						}));
						toast.success(
							`${uploadedImages.length} image(s) uploaded successfully (local)`,
						);
					}
				} catch (localError) {
					toast.error("Image upload failed");
				}
			} finally {
				setUploadingImage(false);
			}
		},
		[],
	);

	const removeImage = useCallback((index: number) => {
		setFormData((prev) => {
			const newImages = prev.images.filter((_, i) => i !== index);
			const wasThumbnail = prev.images[index] === prev.thumbnail;
			return {
				...prev,
				images: newImages,
				// If removed image was thumbnail, set new thumbnail
				thumbnail: wasThumbnail ? newImages[0] || "" : prev.thumbnail,
			};
		});
		toast.success("Image removed");
	}, []);

	const filteredProducts = products.filter((product) => {
		const matchesSearch = product.title
			.toLowerCase()
			.includes(searchQuery.toLowerCase());
		const matchesCategory =
			selectedCategory === "all" || product.category === selectedCategory;
		const matchesStatus =
			selectedStatus === "all" || product.status === selectedStatus;
		return matchesSearch && matchesCategory && matchesStatus;
	});

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

	// Simple inline form - no nested component to avoid focus issues
	const renderProductForm = (isEdit = false) => (
		<div className='space-y-4 max-h-[70vh] overflow-y-auto pr-2'>
			<div className='grid grid-cols-2 gap-4'>
				<div className='col-span-2'>
					<Label>Title</Label>
					<Input
						value={formData.title}
						onChange={(e) =>
							setFormData({ ...formData, title: e.target.value })
						}
						placeholder='Product title'
					/>
				</div>

				<div className='col-span-2'>
					<Label>Short Description</Label>
					<Input
						value={formData.shortDescription}
						onChange={(e) =>
							setFormData({
								...formData,
								shortDescription: e.target.value,
							})
						}
						placeholder='Brief description (max 300 chars)'
						maxLength={300}
					/>
				</div>

				<div className='col-span-2'>
					<Label>Full Description</Label>
					<div className='mb-12'>
						<div className='pro-editor h-[300px]'>
							<ReactQuill
								theme='snow'
								placeholder='Write your detailed product description here...'
								value={formData.description}
								onChange={(value: string) =>
									setFormData({
										...formData,
										description: value,
									})
								}
								modules={{
									toolbar: [
										[{ header: [1, 2, 3, 4, 5, 6, false] }],
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
										["link", "image"],
										["clean"],
									],
								}}
								formats={[
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
								]}
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
							.pro-editor :global(.ql-toolbar .ql-formats button),
							.pro-editor :global(.ql-toolbar .ql-picker),
							.pro-editor :global(.ql-toolbar .ql-picker-label),
							.pro-editor :global(.ql-toolbar .ql-picker-item) {
								font-size: 15px;
							}
							.pro-editor :global(.ql-container) {
								border: 1px solid #e2e8f0;
								border-top: none;
								border-radius: 0 0 12px 12px;
								box-shadow: 0 10px 16px -4px
									rgba(15, 23, 42, 0.08);
								height: calc(100% - 10px);
							}
							.pro-editor :global(.ql-editor) {
								font-size: 16px;
								line-height: 1.6;
								letter-spacing: 0.01em;
								word-spacing: 0.06em;
								color: #0f172a;
								padding: 20px;
							}
							.pro-editor :global(.ql-editor p) {
								margin: 0 0 1em 0;
							}
							.pro-editor :global(.ql-editor h1) {
								font-size: 2rem;
								line-height: 1.3;
								margin: 1em 0 0.5em;
								font-weight: 700;
								letter-spacing: -0.01em;
							}
							.pro-editor :global(.ql-editor h2) {
								font-size: 1.5rem;
								line-height: 1.35;
								margin: 0.8em 0 0.4em;
								font-weight: 700;
							}
							.pro-editor :global(.ql-editor h3) {
								font-size: 1.25rem;
								line-height: 1.4;
								margin: 0.7em 0 0.3em;
								font-weight: 700;
							}
							.pro-editor :global(.ql-editor blockquote) {
								border-left: 4px solid #38bdf8;
								padding-left: 16px;
								margin: 1em 0;
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
								margin: 0.8em 0 1em;
							}
							.pro-editor :global(.ql-editor img) {
								border-radius: 8px;
								box-shadow: 0 4px 12px -2px
									rgba(15, 23, 42, 0.1);
								margin: 1rem auto;
								display: block;
								max-width: 100%;
							}
							.pro-editor :global(.ql-editor pre),
							.pro-editor :global(.ql-editor code) {
								background: #0b1220;
								color: #e5e7eb;
								border-radius: 6px;
								padding: 0.3rem 0.5rem;
								font-family:
									ui-monospace, SFMono-Regular, Menlo, Monaco,
									Consolas, "Liberation Mono", "Courier New",
									monospace;
							}
							.pro-editor :global(.ql-editor.ql-blank::before) {
								color: #94a3b8;
								font-size: 1rem;
							}
						`}</style>
					</div>
				</div>

				<div className='col-span-2'>
					<Label>Category</Label>
					<Select
						value={formData.category}
						onValueChange={(value) =>
							setFormData({ ...formData, category: value })
						}>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{categories.map((cat) => (
								<SelectItem key={cat.value} value={cat.value}>
									{cat.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div>
					<Label>Price</Label>
					<Input
						type='number'
						value={formData.price}
						onChange={(e) =>
							setFormData({ ...formData, price: e.target.value })
						}
						placeholder='0.00'
					/>
				</div>

				<div>
					<Label>Compare Price</Label>
					<Input
						type='number'
						value={formData.comparePrice}
						onChange={(e) =>
							setFormData({
								...formData,
								comparePrice: e.target.value,
							})
						}
						placeholder='0.00'
					/>
				</div>

				<div>
					<Label>Currency</Label>
					<Select
						value={formData.currency}
						onValueChange={(value) =>
							setFormData({ ...formData, currency: value })
						}>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='USD'>USD</SelectItem>
							<SelectItem value='EUR'>EUR</SelectItem>
							<SelectItem value='GBP'>GBP</SelectItem>
							<SelectItem value='INR'>INR</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div>
					<Label>Stock (-1 for unlimited)</Label>
					<Input
						type='number'
						value={formData.stock}
						onChange={(e) =>
							setFormData({ ...formData, stock: e.target.value })
						}
					/>
				</div>

				<div>
					<Label>Status</Label>
					<Select
						value={formData.status}
						onValueChange={(value: any) =>
							setFormData({ ...formData, status: value })
						}>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='draft'>Draft</SelectItem>
							<SelectItem value='active'>Active</SelectItem>
							<SelectItem value='archived'>Archived</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className='col-span-2'>
					<Label>Product Images</Label>
					<div className='space-y-4'>
						{/* Image Upload Area */}
						<div className='border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 transition-colors cursor-pointer relative'>
							<Input
								type='file'
								accept='image/*'
								className='absolute inset-0 h-full opacity-0 cursor-pointer'
								onChange={handleImageUpload}
								disabled={uploadingImage}
								multiple
							/>
							{uploadingImage ? (
								<Loader2 className='h-8 w-8 animate-spin text-slate-400' />
							) : (
								<div className='flex flex-col items-center text-slate-500'>
									<div className='p-3 bg-slate-100 rounded-full mb-2'>
										<Upload size={20} />
									</div>
									<span className='text-sm font-medium'>
										Click to upload images
									</span>
									<span className='text-xs text-slate-400'>
										JPG, PNG, WebP (Max 5 images)
									</span>
								</div>
							)}
						</div>

						{/* Image Previews */}
						{formData.images.length > 0 && (
							<div className='grid grid-cols-5 gap-3'>
								{formData.images.map((img, idx) => (
									<div
										key={idx}
										className='relative aspect-square rounded-lg overflow-hidden border'>
										<img
											src={img}
											alt=''
											className='w-full h-full object-cover'
										/>
										<div className='absolute top-1 right-1 flex gap-1'>
											<Button
												size='sm'
												variant='secondary'
												className='h-6 w-6 p-0'
												onClick={() =>
													setFormData({
														...formData,
														thumbnail: img,
													})
												}
												title='Set as thumbnail'>
												{formData.thumbnail === img ? (
													<Star
														size={12}
														className='text-amber-500 fill-amber-500'
													/>
												) : (
													<Star size={12} />
												)}
											</Button>
											<Button
												size='sm'
												variant='destructive'
												className='h-6 w-6 p-0'
												onClick={() =>
													removeImage(idx)
												}>
												<X size={12} />
											</Button>
										</div>
										{formData.thumbnail === img && (
											<div className='absolute bottom-0 left-0 right-0 bg-amber-500 text-white text-xs text-center py-0.5'>
												Thumbnail
											</div>
										)}
									</div>
								))}
							</div>
						)}
					</div>
				</div>

				<div className='col-span-2'>
					<Label>Demo URL</Label>
					<Input
						value={formData.demoUrl}
						onChange={(e) =>
							setFormData({
								...formData,
								demoUrl: e.target.value,
							})
						}
						placeholder='https://example.com/demo'
					/>
				</div>

				{/* Download Options Section */}
				<div className='col-span-2 border-t pt-4 mt-4'>
					<h3 className='text-lg font-semibold mb-4 text-slate-900'>
						Download Options
					</h3>

					<div className='space-y-4'>
						{/* Download Type Selection */}
						<div>
							<Label className='mb-2 block'>Download Type</Label>
							<div className='flex gap-4'>
								<label className='flex items-center gap-2 cursor-pointer'>
									<input
										type='radio'
										checked={
											formData.downloadOptions.type ===
											"upload"
										}
										onChange={() =>
											setFormData({
												...formData,
												downloadOptions: {
													...formData.downloadOptions,
													type: "upload",
													link: "",
												},
											})
										}
										className='w-4 h-4 text-orange-600'
									/>
									<span className='text-sm'>Upload File</span>
								</label>
								<label className='flex items-center gap-2 cursor-pointer'>
									<input
										type='radio'
										checked={
											formData.downloadOptions.type ===
											"link"
										}
										onChange={() =>
											setFormData({
												...formData,
												downloadOptions: {
													...formData.downloadOptions,
													type: "link",
													file: {
														name: "",
														url: "",
														size: "",
														type: "",
													},
												},
											})
										}
										className='w-4 h-4 text-orange-600'
									/>
									<span className='text-sm'>
										External Link
									</span>
								</label>
							</div>
						</div>

						{/* Upload File Option */}
						{formData.downloadOptions.type === "upload" && (
							<div className='border rounded-lg p-4 bg-slate-50'>
								<Label className='mb-2 block'>
									Upload Download File
								</Label>
								{formData.downloadOptions.file?.url ? (
									<div className='flex items-center justify-between p-3 bg-white rounded border'>
										<div>
											<p className='font-medium text-slate-900'>
												{
													formData.downloadOptions
														.file.name
												}
											</p>
											<p className='text-sm text-slate-500'>
												{
													formData.downloadOptions
														.file.size
												}
											</p>
										</div>
										<Button
											variant='destructive'
											size='sm'
											onClick={() =>
												setFormData({
													...formData,
													downloadOptions: {
														...formData.downloadOptions,
														file: {
															name: "",
															url: "",
															size: "",
															type: "",
														},
													},
												})
											}>
											<X size={16} />
										</Button>
									</div>
								) : (
									<div className='border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 hover:bg-slate-100 transition-colors cursor-pointer relative'>
										<Input
											type='file'
											accept='*/*'
											className='absolute inset-0 h-full opacity-0 cursor-pointer'
											onChange={handleDownloadFileUpload}
											disabled={!editingProduct}
										/>
										<div className='flex flex-col items-center text-slate-500'>
											<div className='p-3 bg-slate-100 rounded-full mb-2'>
												<Upload size={20} />
											</div>
											<span className='text-sm font-medium'>
												Click to upload file
											</span>
											<span className='text-xs text-slate-400'>
												Any file type allowed
											</span>
										</div>
									</div>
								)}
								{!editingProduct && (
									<p className='text-sm text-amber-600 mt-2'>
										Save product first to enable file upload
									</p>
								)}
							</div>
						)}

						{/* External Link Option */}
						{formData.downloadOptions.type === "link" && (
							<div className='border rounded-lg p-4 bg-slate-50'>
								<Label className='mb-2 block'>
									External Download Link
								</Label>
								<Input
									value={formData.downloadOptions.link}
									onChange={(e) =>
										setFormData({
											...formData,
											downloadOptions: {
												...formData.downloadOptions,
												link: e.target.value,
											},
										})
									}
									placeholder='https://example.com/download/file.zip'
								/>
								<p className='text-xs text-slate-500 mt-1'>
									Provide a direct download link to your file
								</p>
							</div>
						)}
					</div>
				</div>

				<div className='col-span-2 flex gap-4'>
					<label className='flex items-center gap-2 cursor-pointer'>
						<input
							type='checkbox'
							checked={formData.isFeatured}
							onChange={(e) =>
								setFormData({
									...formData,
									isFeatured: e.target.checked,
								})
							}
							className='w-4 h-4 rounded border-slate-300'
						/>
						<span className='text-sm'>Featured Product</span>
					</label>

					<label className='flex items-center gap-2 cursor-pointer'>
						<input
							type='checkbox'
							checked={formData.isBestseller}
							onChange={(e) =>
								setFormData({
									...formData,
									isBestseller: e.target.checked,
								})
							}
							className='w-4 h-4 rounded border-slate-300'
						/>
						<span className='text-sm'>Bestseller</span>
					</label>
				</div>
			</div>

			<div className='flex justify-end gap-3 pt-4'>
				<Button
					variant='outline'
					onClick={() =>
						isEdit
							? setIsEditDialogOpen(false)
							: setIsAddDialogOpen(false)
					}>
					Cancel
				</Button>
				<Button
					onClick={isEdit ? handleUpdate : handleCreate}
					className='bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600'>
					{isEdit ? "Update Product" : "Create Product"}
				</Button>
			</div>
		</div>
	);

	return (
		<div className='flex min-h-[calc(100vh-85px)] bg-gradient-to-br from-slate-50 via-white to-slate-100'>
			<AdminSidebar />

			<main className='flex-1 md:ml-64 p-4 md:p-6 lg:p-8'>
				{/* Header */}
				<div className='mb-8 mt-5 md:mt-0'>
					<div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
						<div className='flex items-center gap-3'>
							<div className='w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/25'>
								<Package size={24} className='text-white' />
							</div>
							<div>
								<h1 className='text-2xl md:text-3xl font-bold text-slate-900'>
									Shop Products
								</h1>
								<p className='text-slate-500 text-sm'>
									Manage your digital products, scripts,
									courses & services
								</p>
							</div>
						</div>

						<Dialog
							open={isAddDialogOpen}
							onOpenChange={setIsAddDialogOpen}>
							<DialogTrigger asChild>
								<Button className='bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 gap-2'>
									<Plus size={18} />
									Add Product
								</Button>
							</DialogTrigger>
							<DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
								<DialogHeader>
									<DialogTitle>Add New Product</DialogTitle>
								</DialogHeader>
								{renderProductForm()}
							</DialogContent>
						</Dialog>
					</div>
				</div>

				{/* Stats */}
				<div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'>
					{[
						{
							label: "Total Products",
							value: products.length,
							color: "from-blue-500 to-indigo-500",
						},
						{
							label: "Active",
							value: products.filter((p) => p.status === "active")
								.length,
							color: "from-emerald-500 to-teal-500",
						},
						{
							label: "Drafts",
							value: products.filter((p) => p.status === "draft")
								.length,
							color: "from-amber-500 to-orange-500",
						},
						{
							label: "Total Sales",
							value: products.reduce(
								(sum, p) => sum + (p.salesCount || 0),
								0,
							),
							color: "from-violet-500 to-purple-500",
						},
					].map((stat, i) => (
						<Card
							key={i}
							className='bg-white border-slate-200 shadow-sm'>
							<CardContent className='p-4'>
								<p className='text-xs text-slate-500 mb-1'>
									{stat.label}
								</p>
								<p
									className={`text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${stat.color}`}>
									{stat.value}
								</p>
							</CardContent>
						</Card>
					))}
				</div>

				{/* Filters */}
				<div className='flex flex-col md:flex-row gap-4 mb-6'>
					<div className='relative flex-1'>
						<Search
							className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
							size={18}
						/>
						<Input
							placeholder='Search products...'
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className='pl-10'
						/>
					</div>
					<Select
						value={selectedCategory}
						onValueChange={setSelectedCategory}>
						<SelectTrigger className='w-[180px]'>
							<SelectValue placeholder='All Categories' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='all'>All Categories</SelectItem>
							{categories.map((cat) => (
								<SelectItem key={cat.value} value={cat.value}>
									{cat.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Select
						value={selectedStatus}
						onValueChange={setSelectedStatus}>
						<SelectTrigger className='w-[150px]'>
							<SelectValue placeholder='All Status' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='all'>All Status</SelectItem>
							<SelectItem value='active'>Active</SelectItem>
							<SelectItem value='draft'>Draft</SelectItem>
							<SelectItem value='archived'>Archived</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{/* Products Grid */}
				{loading ? (
					<div className='flex items-center justify-center py-12'>
						<Loader2
							className='animate-spin text-orange-500'
							size={32}
						/>
					</div>
				) : filteredProducts.length === 0 ? (
					<Card className='bg-slate-50 border-dashed'>
						<CardContent className='p-12 text-center'>
							<Package
								size={48}
								className='mx-auto mb-4 text-slate-300'
							/>
							<h3 className='text-lg font-semibold text-slate-900 mb-2'>
								No products found
							</h3>
							<p className='text-slate-500 mb-4'>
								Create your first product to get started
							</p>
							<Button
								onClick={() => setIsAddDialogOpen(true)}
								className='bg-gradient-to-r from-orange-500 to-rose-500'>
								<Plus size={18} className='mr-2' />
								Add Product
							</Button>
						</CardContent>
					</Card>
				) : (
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
						{filteredProducts.map((product) => (
							<Card
								key={product._id}
								className='bg-white border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 p-0 group overflow-hidden'>
								<div className='relative h-40 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden'>
									{product.thumbnail ? (
										<img
											src={product.thumbnail}
											alt={product.title}
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
										{product.isFeatured && (
											<span className='px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded-full'>
												Featured
											</span>
										)}
										{product.isBestseller && (
											<span className='px-2 py-1 bg-violet-500 text-white text-xs font-medium rounded-full'>
												Bestseller
											</span>
										)}
									</div>
									<div className='absolute bottom-2 left-2'>
										{getStatusBadge(product.status)}
									</div>
								</div>

								<CardContent className='p-4'>
									<div className='flex items-start justify-between mb-2'>
										<div>
											<p className='text-xs text-slate-500 uppercase tracking-wide'>
												{product.category}
											</p>
											<h3 className='font-semibold text-slate-900 line-clamp-1'>
												{product.title}
											</h3>
										</div>
									</div>

									<p className='text-sm text-slate-600 line-clamp-2 mb-3'>
										{product.shortDescription ||
											product.description}
									</p>

									<div className='flex items-center justify-between mb-3'>
										<div className='flex items-baseline gap-2'>
											<span className='text-lg font-bold text-slate-900'>
												{product.currency}{" "}
												{product.price.toFixed(2)}
											</span>
											{product.comparePrice &&
												product.comparePrice > 0 && (
													<span className='text-sm text-slate-400 line-through'>
														{product.currency}{" "}
														{product.comparePrice?.toFixed(
															2,
														)}
													</span>
												)}
										</div>
										<div className='flex items-center gap-1 text-sm text-slate-500'>
											<Star
												size={14}
												className='text-amber-400 fill-amber-400'
											/>
											<span>
												{product.rating?.average?.toFixed(
													1,
												) || "0.0"}
											</span>
											<span className='text-slate-400'>
												({product.rating?.count || 0})
											</span>
										</div>
									</div>

									<div className='flex items-center justify-between pt-3 border-t border-slate-100'>
										<span className='text-xs text-slate-500'>
											{product.salesCount || 0} sales
										</span>
										<div className='flex gap-1'>
											<Link
												href={`/shop/${product.slug}`}
												target='_blank'>
												<Button
													size='sm'
													variant='ghost'
													className='h-8 w-8 p-0'>
													<Eye
														size={16}
														className='text-slate-500'
													/>
												</Button>
											</Link>
											<Button
												size='sm'
												variant='ghost'
												className='h-8 w-8 p-0'
												onClick={() =>
													openEditDialog(product)
												}>
												<Edit
													size={16}
													className='text-blue-500'
												/>
											</Button>
											<Button
												size='sm'
												variant='ghost'
												className='h-8 w-8 p-0'
												onClick={() =>
													handleDelete(product._id)
												}>
												<Trash2
													size={16}
													className='text-rose-500'
												/>
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}

				{/* Edit Dialog */}
				<Dialog
					open={isEditDialogOpen}
					onOpenChange={setIsEditDialogOpen}>
					<DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
						<DialogHeader>
							<DialogTitle>Edit Product</DialogTitle>
						</DialogHeader>
						{renderProductForm(true)}
					</DialogContent>
				</Dialog>
			</main>
		</div>
	);
}
