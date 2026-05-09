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
	DollarSign,
	TrendingUp,
	BarChart3,
	Layers,
	Zap,
	ShoppingBag,
	Tag,
	ArrowRight,
	ExternalLink,
	RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { productService } from "@/services/productService";
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
	features?: string[];
	tags?: string[];
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

const getCurrencySymbol = (currency?: string) => {
	switch (currency) {
		case "INR":
			return "₹";
		case "USD":
			return "$";
		case "USDT":
			return "$";
		case "EUR":
			return "€";
		case "GBP":
			return "£";
		default:
			return currency === "INR" ? "₹" : "$";
	}
};

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
		tags: [] as string[],
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
            const result = await productService.getProducts({ limit: 100 });
			setProducts(result.products || []);
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

            await productService.createProduct(payload);
			toast.success("Product created successfully");
			setIsAddDialogOpen(false);
			resetForm();
			fetchProducts();
		} catch (error: any) {
			toast.error("Failed to create product");
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

            await productService.updateProduct(editingProduct._id, payload);
			toast.success("Product updated successfully");
			setIsEditDialogOpen(false);
			setEditingProduct(null);
			fetchProducts();
		} catch (error: any) {
			toast.error("Failed to update product");
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this product?")) return;

		try {
            await productService.deleteProduct(id);
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
			features: product.features || [],
			tags: product.tags || [],
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
			tags: [],
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

				<div className='col-span-2 border-t pt-4 mt-4'>
					<h3 className='text-lg font-semibold mb-4 text-slate-900'>Features & Tags</h3>
					<div className='grid grid-cols-2 gap-6'>
						<div>
							<Label className='mb-2 block font-bold'>Product Features</Label>
							<div className='space-y-2 mb-2'>
								{formData.features.map((feature, idx) => (
									<div key={idx} className='flex gap-2 items-center'>
										<Input 
											value={feature} 
											onChange={(e) => {
												const newFeatures = [...formData.features];
												newFeatures[idx] = e.target.value;
												setFormData({ ...formData, features: newFeatures });
											}}
											placeholder='e.g. 24/7 Support'
											className='h-8'
										/>
										<Button 
											size='sm' 
											variant='ghost' 
											onClick={() => {
												const newFeatures = formData.features.filter((_, i) => i !== idx);
												setFormData({ ...formData, features: newFeatures });
											}}
											className='h-8 w-8 text-rose-500'
										>
											<X size={14} />
										</Button>
									</div>
								))}
							</div>
							<Button 
								size='sm' 
								variant='outline' 
								onClick={() => setFormData({ ...formData, features: [...formData.features, ''] })}
								className='text-[10px] font-black uppercase tracking-widest'
							>
								<Plus size={12} className='mr-1' /> Add Feature
							</Button>
						</div>

						<div>
							<Label className='mb-2 block font-bold text-slate-700'>SEO Search Tags</Label>
							<div className='flex flex-wrap gap-2 p-3 border rounded-xl bg-slate-50 min-h-[42px] mb-3'>
								{formData.tags.length === 0 && <span className='text-[10px] text-slate-400 font-black uppercase tracking-widest'>No tags added</span>}
								{formData.tags.map((tag, idx) => (
									<span key={idx} className='inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-tight rounded-lg shadow-sm group-hover:border-indigo-200 transition-colors'>
										{tag}
										<button onClick={() => setFormData({ ...formData, tags: formData.tags.filter((_, i) => i !== idx) })} className='text-slate-400 hover:text-rose-500'>
											<X size={10} />
										</button>
									</span>
								))}
							</div>
							<Input 
								placeholder='Add tag and press Enter'
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										e.preventDefault();
										const val = e.currentTarget.value.trim();
										if (val && !formData.tags.includes(val)) {
											setFormData({ ...formData, tags: [...formData.tags, val] });
											e.currentTarget.value = '';
										}
									}
								}}
								className='h-9 bg-white border-slate-200 shadow-sm rounded-xl'
							/>
							<p className='text-[9px] text-slate-400 mt-1.5 font-bold uppercase'>Press Enter to save each tag</p>
						</div>
					</div>
				</div>

				<div className='col-span-2 flex gap-4 border-t pt-4 mt-4'>
					<label className='flex items-center gap-2 cursor-pointer group'>
						<div className={`w-10 h-6 rounded-full transition-colors flex items-center p-1 ${formData.isFeatured ? 'bg-orange-500' : 'bg-slate-200'}`}
							onClick={() => setFormData({ ...formData, isFeatured: !formData.isFeatured })}>
							<div className={`w-4 h-4 bg-white rounded-full transition-transform ${formData.isFeatured ? 'translate-x-4' : 'translate-x-0'}`} />
						</div>
						<span className='text-xs font-black uppercase tracking-widest text-slate-600'>Featured Product</span>
					</label>

					<label className='flex items-center gap-2 cursor-pointer group'>
						<div className={`w-10 h-6 rounded-full transition-colors flex items-center p-1 ${formData.isBestseller ? 'bg-violet-500' : 'bg-slate-200'}`}
							onClick={() => setFormData({ ...formData, isBestseller: !formData.isBestseller })}>
							<div className={`w-4 h-4 bg-white rounded-full transition-transform ${formData.isBestseller ? 'translate-x-4' : 'translate-x-0'}`} />
						</div>
						<span className='text-xs font-black uppercase tracking-widest text-slate-600'>Bestseller</span>
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
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10'>
					<Card className='bg-slate-900 border-slate-800 shadow-xl overflow-hidden group'>
						<CardContent className='p-6 relative'>
							<div className='absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform'>
								<DollarSign size={80} className='text-white' />
							</div>
							<p className='text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1'>Inventory Value (Converted to INR)</p>
							<h3 className='text-3xl font-black text-white'>
								₹{products.reduce((sum, p) => {
									const val = p.currency === "USD" || p.currency === "USDT" ? p.price * 83 : p.price;
									return sum + val;
								}, 0).toLocaleString()}
							</h3>
							<div className='mt-4 flex items-center gap-2'>
								<span className='text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full'>+12.5%</span>
								<span className='text-[10px] text-slate-500 font-bold uppercase'>from prev. month</span>
							</div>
						</CardContent>
					</Card>

					<Card className='bg-white border-slate-200 shadow-xl overflow-hidden group'>
						<CardContent className='p-6 relative'>
							<div className='absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform'>
								<Zap size={80} className='text-amber-500' />
							</div>
							<p className='text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1'>Platform Sales</p>
							<h3 className='text-3xl font-black text-slate-900'>
								{products.reduce((sum, p) => sum + (p.salesCount || 0), 0).toLocaleString()}
							</h3>
							<div className='mt-4 flex items-center gap-2'>
								<span className='text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full'>Active</span>
								<span className='text-[10px] text-slate-400 font-bold uppercase'>{products.filter(p => p.status === 'active').length} Products</span>
							</div>
						</CardContent>
					</Card>

					<Card className='bg-white border-slate-200 shadow-xl overflow-hidden group'>
						<CardContent className='p-6 relative'>
							<div className='absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform'>
								<Star size={80} className='text-emerald-500' />
							</div>
							<p className='text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1'>Average Rating</p>
							<h3 className='text-3xl font-black text-slate-900'>
								{(products.reduce((sum, p) => sum + (p.rating?.average || 0), 0) / (products.length || 1)).toFixed(1)}
							</h3>
							<div className='mt-4 flex items-center gap-2 text-amber-500'>
								<Star size={12} className='fill-amber-500' />
								<span className='text-[10px] font-black uppercase tracking-widest'>Customer Satisfaction</span>
							</div>
						</CardContent>
					</Card>

					<Card className='bg-white border-slate-200 shadow-xl overflow-hidden group'>
						<CardContent className='p-6 relative'>
							<div className='absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform'>
								<Layers size={80} className='text-indigo-500' />
							</div>
							<p className='text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1'>Inventory Size</p>
							<h3 className='text-3xl font-black text-slate-900'>{products.length}</h3>
							<div className='mt-4 flex items-center gap-2'>
								<Link href='/admin/orders'>
									<Button variant='ghost' size='sm' className='h-6 text-[9px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-50'>View Transactions</Button>
								</Link>
							</div>
						</CardContent>
					</Card>
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
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20'>
						{filteredProducts.map((product) => (
							<Card
								key={product._id}
								className='bg-white border-slate-200 shadow-xl hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 p-0 group overflow-hidden flex flex-col'>
								<div className='relative aspect-video bg-slate-100 overflow-hidden'>
									{product.thumbnail ? (
										<img
											src={product.thumbnail}
											alt={product.title}
											className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-700'
										/>
									) : (
										<div className='w-full h-full flex items-center justify-center bg-slate-50'>
											<Package size={60} className='text-slate-200' />
										</div>
									)}
									
									{/* Commercial Ribbons */}
									<div className='absolute top-3 left-3 flex flex-col gap-2'>
										{product.isFeatured && (
											<div className='flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-orange-500/30'>
												<Star size={10} className='fill-white' /> Featured
											</div>
										)}
										{product.isBestseller && (
											<div className='flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-violet-500/30'>
												<Zap size={10} className='fill-white' /> Bestseller
											</div>
										)}
									</div>

									{/* Status Floating Badge */}
									<div className='absolute bottom-3 right-3'>
										{product.status === 'active' ? (
											<div className='px-3 py-1 bg-white/90 backdrop-blur-md text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100 shadow-sm flex items-center gap-1.5'>
												<div className='w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse' /> Active
											</div>
										) : (
											<div className='px-3 py-1 bg-white/90 backdrop-blur-md text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-slate-200 shadow-sm'>
												{product.status}
											</div>
										)}
									</div>
								</div>

								<CardContent className='p-6 flex-1 flex flex-col'>
									<div className='flex items-start justify-between gap-4 mb-4'>
										<div className='min-w-0'>
											<h4 className='text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-1.5 truncate'>
												{product.category}
											</h4>
											<h3 className='text-xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-indigo-600 transition-colors truncate'>
												{product.title}
											</h3>
										</div>
										<div className='text-right shrink-0'>
											<div className='flex flex-col items-end'>
												<span className='text-2xl font-black text-slate-900 tracking-tighter'>
													{getCurrencySymbol(product.currency)}{product.price.toLocaleString()}
												</span>
												{product.comparePrice && product.comparePrice > product.price && (
													<span className='text-xs font-bold text-slate-400 line-through'>
														{getCurrencySymbol(product.currency)}{product.comparePrice.toLocaleString()}
													</span>
												)}
											</div>
										</div>
									</div>

									<p className='text-sm font-medium text-slate-500 line-clamp-2 mb-6 leading-relaxed'>
										{product.shortDescription || "Manage this product's digital distribution and commercial performance metrics."}
									</p>

									<div className='grid grid-cols-2 gap-4 mb-6'>
										<div className='bg-slate-50 rounded-2xl p-3 border border-slate-100 group-hover:bg-white group-hover:border-slate-200 transition-all'>
											<p className='text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5'>
												<ShoppingBag size={12} /> Stock Hub
											</p>
											<div className='flex items-center justify-between'>
												<span className='text-xs font-black text-slate-800'>
													{product.stock === -1 ? "∞ Unlimited" : `${product.stock} Units`}
												</span>
												{product.stock !== -1 && (
													<div className='w-12 h-1 bg-slate-200 rounded-full overflow-hidden'>
														<div className={`h-full ${product.stock < 10 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(product.stock * 5, 100)}%` }} />
													</div>
												)}
											</div>
										</div>
										<div className='bg-slate-50 rounded-2xl p-3 border border-slate-100 group-hover:bg-white group-hover:border-slate-200 transition-all'>
											<p className='text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5'>
												<TrendingUp size={12} /> Commercials
											</p>
											<div className='flex items-center gap-2'>
												<span className='text-xs font-black text-slate-800'>{product.salesCount || 0}</span>
												<span className='text-[10px] font-bold text-slate-400 uppercase'>Sales</span>
											</div>
										</div>
									</div>

									<div className='flex items-center justify-between pt-6 border-t border-slate-100 mt-auto'>
										<div className='flex items-center gap-1.5'>
											<div className='flex text-amber-400'>
												<Star size={12} className='fill-amber-400' />
											</div>
											<span className='text-xs font-black text-slate-900'>
												{product.rating?.average?.toFixed(1) || "0.0"}
											</span>
											<span className='text-[10px] font-bold text-slate-400'>({product.rating?.count || 0})</span>
										</div>
										<div className='flex items-center bg-slate-100 p-1 rounded-xl gap-1'>
											<Link href={`/shop/${product.slug}`} target='_blank'>
												<Button variant='ghost' size='sm' className='h-8 w-8 p-0 rounded-lg hover:bg-white text-slate-500 hover:text-indigo-600 transition-all shadow-sm'>
													<Eye size={16} />
												</Button>
											</Link>
											<Button 
												variant='ghost' 
												size='sm' 
												className='h-8 w-8 p-0 rounded-lg hover:bg-white text-slate-500 hover:text-blue-600 transition-all shadow-sm'
												onClick={() => openEditDialog(product)}
											>
												<Edit size={16} />
											</Button>
											<Button 
												variant='ghost' 
												size='sm' 
												className='h-8 w-8 p-0 rounded-lg hover:bg-white text-slate-500 hover:text-rose-600 transition-all shadow-sm'
												onClick={() => handleDelete(product._id)}
											>
												<Trash2 size={16} />
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
