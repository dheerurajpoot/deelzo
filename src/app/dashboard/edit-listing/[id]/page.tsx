"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { userContext } from "@/context/userContext";
import { toast } from "sonner";
import {
	X,
	Upload,
	Check,
	Loader2,
	ArrowLeft,
	ArrowRight,
	FileText,
	Image as ImageIcon,
	TrendingUp,
	DollarSign,
	ShoppingBag,
	Globe,
	MapPin,
	Calendar,
	Users,
	Eye,
	Tag,
	CreditCard,
	AlertCircle,
	Info,
	Link as LinkIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const categories = [
	{ id: "website", label: "Website" },
	{ id: "youtube", label: "YouTube Channel" },
	{ id: "facebook", label: "Facebook Page" },
	{ id: "instagram", label: "Instagram Page" },
	{ id: "tiktok", label: "TikTok Account" },
	{ id: "twitter", label: "Twitter Account" },
	{ id: "play-console", label: "Play Console" },
	{ id: "adsense", label: "AdSense Dashboard" },
	{ id: "shopify", label: "Shopify Store" },
	{ id: "dropshipping", label: "Dropshipping Store" },
	{ id: "saas", label: "SaaS" },
	{ id: "mobile-app", label: "Mobile App" },
	{ id: "other", label: "Other" },
];

const steps = [
	{ id: 1, name: "Category" },
	{ id: 2, name: "Details" },
	{ id: 3, name: "Images" },
	{ id: 4, name: "Metrics" },
	{ id: 5, name: "Pricing" },
];

type ListingFormState = {
	title: string;
	description: string;
	category: string;
	price: string;
	thumbnail: string;
	images: string[];
	metrics: {
		monthlyRevenue: string;
		monthlyTraffic: string;
		followers: string;
		subscribers: string;
		engagement: string;
		age: string;
		assetLink: string;
		country: string;
	};
	details: {
		niche: string;
		monetization: string;
		trafficSource: string;
		growthPotential: string;
		paymentReceived: string;
		adManager: string;
		domainProvider: string;
		domainExpiry: string;
		platform: string;
		issue: string;
	};
};

export default function EditListing() {
	const router = useRouter();
	const params = useParams();
	const { user } = userContext();
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [uploadingImages, setUploadingImages] = useState(false);
	const [currentStep, setCurrentStep] = useState(1);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const submitButtonClicked = useRef(false);
	const [formData, setFormData] = useState<ListingFormState>({
		title: "",
		description: "",
		category: "",
		price: "",
		thumbnail: "",
		images: [],
		metrics: {
			monthlyRevenue: "",
			monthlyTraffic: "",
			followers: "",
			subscribers: "",
			engagement: "",
			age: "",
			assetLink: "",
			country: "",
		},
		details: {
			niche: "",
			monetization: "",
			trafficSource: "",
			growthPotential: "",
			paymentReceived: "",
			adManager: "",
			domainProvider: "",
			domainExpiry: "",
			platform: "",
			issue: "",
		},
	});

	// Fetch listing data
	useEffect(() => {
		const fetchListing = async () => {
			try {
				const response = await axios.get(`/api/listings/${params.id}`);
				if (response.data) {
					const listing = response.data;
					// Convert price to string for the form
					// Handle images array - ensure it's always an array and filter out thumbnail
					let imagesArray: string[] = [];
					if (Array.isArray(listing.images)) {
						imagesArray = listing.images.filter(
							(img: string) => img && img !== listing.thumbnail
						);
					} else if (
						listing.images &&
						typeof listing.images === "string"
					) {
						// If images is a single string, convert to array
						if (listing.images !== listing.thumbnail) {
							imagesArray = [listing.images];
						}
					}

					const formattedListing = {
						...listing,
						title: listing.title || "",
						description: listing.description || "",
						category: listing.category || "",
						price: listing.price?.toString() || "",
						thumbnail: listing.thumbnail || "",
						images: imagesArray,
						// Ensure all metrics and details fields are strings
						metrics: {
							monthlyRevenue:
								listing.metrics?.monthlyRevenue?.toString() ||
								"",
							monthlyTraffic:
								listing.metrics?.monthlyTraffic?.toString() ||
								"",
							followers:
								listing.metrics?.followers?.toString() || "",
							subscribers:
								listing.metrics?.subscribers?.toString() || "",
							engagement:
								listing.metrics?.engagement?.toString() || "",
							age: listing.metrics?.age?.toString() || "",
							assetLink: listing.metrics?.assetLink || "",
							country: listing.metrics?.country || "",
						},
						details: {
							niche: listing.details?.niche || "",
							monetization: listing.details?.monetization || "",
							trafficSource: listing.details?.trafficSource || "",
							growthPotential:
								listing.details?.growthPotential || "",
							paymentReceived:
								listing.details?.paymentReceived || "",
							adManager: listing.details?.adManager || "",
							domainProvider:
								listing.details?.domainProvider || "",
							domainExpiry: listing.details?.domainExpiry || "",
							platform: listing.details?.platform || "",
							issue: listing.details?.issue || "",
						},
					};
					setFormData(formattedListing);
				}
			} catch (error) {
				console.error("Failed to fetch listing:", error);
				toast.error("Failed to load listing. Please try again.");
			} finally {
				setLoading(false);
			}
		};

		if (params.id) {
			fetchListing();
		}
	}, [params.id]);

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));

		// Clear error for this field
		if (errors[name]) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[name];
				return newErrors;
			});
		}
	};

	const sanitizeUrl = (url: string): string => {
		if (!url) return "";
		let sanitized = url.trim();
		if (/^https?:\/\//i.test(sanitized)) {
			return sanitized;
		}
		if (/^www\./i.test(sanitized)) {
			return `https://${sanitized}`;
		}
		return `https://${sanitized}`;
	};

	// Categories that have followers/subscribers
	const hasFollowers = () => {
		const followersCategories = [
			"YouTube Channel",
			"Facebook Page",
			"Instagram Page",
			"Twitter Account",
			"TikTok Account",
		];
		return followersCategories.includes(formData.category);
	};

	const handleMetricsChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;

		// Sanitize URL for assetLink
		let sanitizedValue = value;
		if (name === "assetLink" && value) {
			sanitizedValue = sanitizeUrl(value);
		}

		setFormData((prev) => ({
			...prev,
			metrics: {
				...prev.metrics,
				[name]: sanitizedValue,
			},
		}));

		// Clear error for this field
		if (errors[name]) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[name];
				return newErrors;
			});
		}
	};

	const handleDetailsChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			details: {
				...prev.details,
				[name]: value,
			},
		}));

		// Clear error for this field
		if (errors[`details.${name}`]) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[`details.${name}`];
				return newErrors;
			});
		}
	};

	const handleImageUpload = async (
		e: React.ChangeEvent<HTMLInputElement>,
		isThumbnail = false
	) => {
		const files = Array.from((e.target.files as FileList) || []);
		if (files.length === 0) return;

		if (!isThumbnail && formData.images.length + files.length > 6) {
			toast.error(
				`Maximum 6 images allowed. You already have ${formData.images.length} images.`
			);
			e.target.value = "";
			return;
		}

		setUploadingImages(true);

		try {
			const uploadPromises = files.map(async (file) => {
				try {
					const authRes = await fetch("/api/imagekit/auth");
					if (!authRes.ok) {
						throw new Error("Failed to get ImageKit auth");
					}
					const { token, expire, signature, publicKey } =
						await authRes.json();

					const form = new FormData();
					form.append("file", file);
					form.append("fileName", file.name);
					form.append("publicKey", publicKey);
					form.append("signature", signature);
					form.append("expire", String(expire));
					form.append("token", token);
					form.append("useUniqueFileName", "true");

					const uploadRes = await fetch(
						"https://upload.imagekit.io/api/v1/files/upload",
						{ method: "POST", body: form }
					);

					if (!uploadRes.ok) {
						const errorData = await uploadRes
							.json()
							.catch(() => ({}));
						throw new Error(
							errorData.message || `Failed to upload ${file.name}`
						);
					}

					const data = await uploadRes.json();
					if (data && data.url) {
						return {
							success: true,
							url: data.url,
							fileName: file.name,
						};
					}
					throw new Error(`No URL returned for ${file.name}`);
				} catch (error: any) {
					console.error(`Upload failed for ${file.name}:`, error);
					return {
						success: false,
						fileName: file.name,
						error: error.message,
					};
				}
			});

			const results = await Promise.allSettled(uploadPromises);

			const successfulUploads: string[] = [];
			const failedUploads: string[] = [];

			results.forEach((result, index) => {
				if (result.status === "fulfilled" && result.value.success) {
					successfulUploads.push(result.value.url);
				} else {
					const fileName =
						result.status === "fulfilled"
							? result.value.fileName
							: files[index]?.name || `File ${index + 1}`;
					failedUploads.push(fileName);
				}
			});

			if (successfulUploads.length === 0) {
				throw new Error(
					"No images were uploaded successfully. Please try again."
				);
			}

			if (failedUploads.length > 0) {
				toast.warning(
					`${successfulUploads.length} uploaded, ${failedUploads.length} failed`
				);
			}

			if (isThumbnail && successfulUploads.length > 0) {
				setFormData((prev) => ({
					...prev,
					thumbnail: successfulUploads[0],
				}));
				toast.success("Thumbnail updated successfully!");
			} else if (successfulUploads.length > 0) {
				setFormData((prev) => ({
					...prev,
					images: [...prev.images, ...successfulUploads],
				}));
				toast.success(
					`${successfulUploads.length} image(s) uploaded successfully!`
				);
			}

			e.target.value = "";
		} catch (error: any) {
			console.error("Upload failed:", error);
			toast.error(
				error?.message || "Failed to upload images. Please try again."
			);
		} finally {
			setUploadingImages(false);
		}
	};

	const removeImage = (index: number) => {
		setFormData((prev) => ({
			...prev,
			images: prev.images.filter((_, i) => i !== index),
		}));
	};

	const removeThumbnail = () => {
		setFormData((prev) => ({
			...prev,
			thumbnail: "",
		}));
	};

	const validateStep = (step: number): boolean => {
		const newErrors: Record<string, string> = {};

		if (step === 1) {
			if (!formData.category) {
				newErrors.category = "Please select a category";
			}
		}

		if (step === 2) {
			if (!formData.title || formData.title.trim().length < 3) {
				newErrors.title = "Title must be at least 3 characters";
			}
			if (
				!formData.description ||
				formData.description.trim().length < 10
			) {
				newErrors.description =
					"Description must be at least 10 characters";
			}
		}

		if (step === 3) {
			if (!formData.thumbnail) {
				newErrors.thumbnail = "Please upload a thumbnail image";
			}
		}

		if (step === 5) {
			if (!formData.price || Number.parseFloat(formData.price) <= 0) {
				newErrors.price = "Please enter a valid price greater than 0";
			}
		}

		setErrors(newErrors);

		if (Object.keys(newErrors).length > 0) {
			toast.error("Please fix the errors before proceeding");
			return false;
		}

		return true;
	};

	const nextStep = () => {
		if (!validateStep(currentStep)) {
			return;
		}
		if (currentStep < steps.length) {
			setCurrentStep(currentStep + 1);
		}
	};

	const prevStep = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1);
		} else {
			router.back();
		}
	};

	const selectCategory = (categoryId: string) => {
		const category = categories.find((c) => c.id === categoryId);
		if (category) {
			setFormData((prev) => ({ ...prev, category: category.label }));
			if (errors.category) {
				setErrors((prev) => {
					const newErrors = { ...prev };
					delete newErrors.category;
					return newErrors;
				});
			}
		}
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		e.stopPropagation();

		if (currentStep < steps.length) {
			return;
		}

		if (!submitButtonClicked.current) {
			return;
		}

		// Reset the flag
		submitButtonClicked.current = false;

		// Final validation
		if (!validateStep(5)) {
			return;
		}

		setSaving(true);
		if (!user) {
			toast.error("User not found! Please login again.");
			setSaving(false);
			router.push("/login");
			return;
		}

		try {
			// Sanitize assetLink before submission
			const submitData = {
				...formData,
				price: Number.parseFloat(formData.price),
				userId: user?._id,
				metrics: {
					...formData.metrics,
					assetLink: formData.metrics.assetLink
						? sanitizeUrl(formData.metrics.assetLink)
						: "",
				},
			};

			const response = await axios.put(
				`/api/listings/${params.id}`,
				submitData
			);

			if (response.data.success) {
				toast.success(
					response.data.message || "Listing updated successfully!"
				);
				router.push("/dashboard/listings");
			} else {
				throw new Error(
					response.data.message || "Failed to update listing"
				);
			}
		} catch (error: any) {
			console.error("Failed to update listing:", error);
			const errorMessage =
				error.response?.data?.message ||
				error.message ||
				"Failed to update listing. Please try again.";
			toast.error(errorMessage);

			// Set field-specific errors if available
			if (error.response?.data?.errors) {
				setErrors(error.response.data.errors);
			}
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className='flex items-center justify-center min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100'>
				<Loader2 className='h-12 w-12 animate-spin text-sky-600' />
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 p-4 md:p-6 lg:p-8 pb-24 md:pb-8'>
			<div className='max-w-6xl mx-auto'>
				{/* Header */}
				<div className='flex items-center justify-between mb-6'>
					<div>
						<h1 className='text-3xl md:text-4xl font-bold bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent mb-2'>
							Edit Listing
						</h1>
						<p className='text-slate-600 text-sm md:text-base'>
							Update your listing details below
						</p>
					</div>
					<div className='flex items-center justify-between'>
						<Link href='/dashboard/listings'>
							<Button variant='outline'>
								<ArrowLeft className='mr-2' />Back to Listings
							</Button>
						</Link>
					</div>
				</div>

				<Card className='bg-white border p-0 border-slate-200 shadow-2xl overflow-hidden'>
					<CardHeader className='border-b border-slate-200 bg-linear-to-r from-sky-50 to-blue-50 pb-4 md:pb-6'>
						<CardTitle className='text-2xl md:text-3xl font-bold text-center text-slate-900 mb-6'>
							{/* Edit Your Listing */}
						</CardTitle>

						{/* Stepper */}
						<div className='mt-4 md:mt-6'>
							<div className='max-w-4xl mx-auto'>
								{/* Step circles and lines */}
								<div className='flex items-center justify-between mb-3 md:mb-4'>
									{steps.map((step, index) => (
										<div
											key={step.id}
											className='flex items-center flex-1'>
											<div className='flex items-center w-full'>
												{/* Left line */}
												{index > 0 && (
													<div
														className={cn(
															"flex-1 h-1 rounded-full transition-all duration-300",
															currentStep >
																step.id - 1
																? "bg-linear-to-r from-sky-500 to-blue-500"
																: "bg-slate-200"
														)}
													/>
												)}
												{/* Circle */}
												<div
													className={cn(
														"w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-sm md:text-base transition-all duration-300 mx-1 md:mx-2 shadow-lg",
														currentStep === step.id
															? "bg-linear-to-br from-sky-500 to-blue-500 text-white scale-110 shadow-sky-500/30"
															: currentStep >
															  step.id
															? "bg-linear-to-br from-emerald-500 to-green-500 text-white shadow-emerald-500/30"
															: "bg-slate-200 text-slate-500"
													)}>
													{currentStep > step.id ? (
														<Check className='w-5 h-5 md:w-6 md:h-6' />
													) : (
														step.id
													)}
												</div>
												{/* Right line */}
												{index < steps.length - 1 && (
													<div
														className={cn(
															"flex-1 h-1 rounded-full transition-all duration-300",
															currentStep >
																step.id
																? "bg-linear-to-r from-sky-500 to-blue-500"
																: "bg-slate-200"
														)}
													/>
												)}
											</div>
										</div>
									))}
								</div>
								{/* Step labels */}
								<div className='flex items-center justify-between px-2 md:px-4'>
									{steps.map((step) => (
										<div
											key={step.id}
											className='flex-1 text-center min-w-0'>
											<span
												className={cn(
													"text-xs md:text-sm font-semibold transition-colors duration-200",
													currentStep === step.id
														? "text-sky-600"
														: currentStep > step.id
														? "text-slate-700"
														: "text-slate-400"
												)}>
												{step.name}
											</span>
										</div>
									))}
								</div>
							</div>
						</div>
					</CardHeader>

					<CardContent className='p-4 md:p-6 lg:p-8'>
						<form
							onSubmit={handleSubmit}
							onKeyDown={(e) => {
								// Prevent ALL form submissions via Enter key
								// Only allow submission via explicit button click
								if (e.key === "Enter") {
									e.preventDefault();
									e.stopPropagation();
								}
							}}
							className='space-y-6 md:space-y-8'>
							{/* Step 1: Category */}
							{currentStep === 1 && (
								<div className='space-y-6'>
									<div className='text-center md:text-left'>
										<h2 className='text-2xl md:text-3xl font-bold text-slate-900 mb-2 flex items-center gap-2 justify-center md:justify-start'>
											<Tag
												size={28}
												className='text-sky-600'
											/>
											Category
										</h2>
										<p className='text-slate-600 text-sm md:text-base'>
											Select the category that best fits
											your digital asset
										</p>
									</div>

									{errors.category && (
										<div className='p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm flex items-start gap-2'>
											<AlertCircle
												size={18}
												className='text-rose-600 mt-0.5 shrink-0'
											/>
											<span>{errors.category}</span>
										</div>
									)}

									<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4'>
										{categories.map((category) => (
											<button
												key={category.id}
												type='button'
												onClick={() =>
													selectCategory(category.id)
												}
												className={cn(
													"p-3 md:p-4 border-2 rounded-xl text-center font-semibold text-sm md:text-base transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5",
													formData.category ===
														category.label
														? "border-sky-500 bg-linear-to-br from-sky-50 to-blue-50 text-sky-700 shadow-lg shadow-sky-500/20 scale-105"
														: "border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:bg-slate-50"
												)}>
												{category.label}
											</button>
										))}
									</div>
								</div>
							)}

							{/* Step 2: Details */}
							{currentStep === 2 && (
								<div className='space-y-6'>
									<div className='text-center md:text-left'>
										<h2 className='text-2xl md:text-3xl font-bold text-slate-900 mb-2 flex items-center gap-2 justify-center md:justify-start'>
											<FileText
												size={28}
												className='text-sky-600'
											/>
											Details
										</h2>
										<p className='text-slate-600 text-sm md:text-base'>
											Provide basic information about your
											digital asset
										</p>
									</div>

									<div className='space-y-4 md:space-y-5'>
										<div>
											<Label
												htmlFor='title'
												className='text-slate-700 font-semibold text-sm mb-2 flex items-center gap-2'>
												<FileText
													size={16}
													className='text-slate-500'
												/>
												Title{" "}
												<span className='text-rose-500'>
													*
												</span>
											</Label>
											<Input
												id='title'
												name='title'
												value={formData.title}
												onChange={handleChange}
												placeholder='e.g., High-Traffic Tech Blog'
												className={cn(
													"h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-sky-500/20",
													errors.title &&
														"border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
												)}
												required
											/>
											{errors.title && (
												<p className='text-rose-600 text-xs mt-1.5 flex items-center gap-1'>
													<AlertCircle size={14} />
													{errors.title}
												</p>
											)}
										</div>

										<div>
											<Label
												htmlFor='description'
												className='text-slate-700 font-semibold text-sm mb-2 flex items-center gap-2'>
												<FileText
													size={16}
													className='text-slate-500'
												/>
												Description{" "}
												<span className='text-rose-500'>
													*
												</span>
											</Label>
											<textarea
												id='description'
												name='description'
												value={formData.description}
												onChange={(
													e: React.ChangeEvent<HTMLTextAreaElement>
												) => handleChange(e)}
												placeholder='Describe your asset in detail...'
												className={cn(
													"w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 resize-none",
													errors.description &&
														"border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
												)}
												rows={5}
												required
											/>
											{errors.description && (
												<p className='text-rose-600 text-xs mt-1.5 flex items-center gap-1'>
													<AlertCircle size={14} />
													{errors.description}
												</p>
											)}
											<p className='text-slate-500 text-xs mt-1.5'>
												{formData.description.length}{" "}
												characters
											</p>
										</div>

										<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
											<div>
												<Label
													htmlFor='assetLink'
													className='text-slate-700 font-semibold text-sm mb-2 flex items-center gap-2'>
													<LinkIcon
														size={16}
														className='text-slate-500'
													/>
													Asset Link/URL
												</Label>
												<Input
													id='assetLink'
													name='assetLink'
													type='text'
													value={
														formData.metrics
															.assetLink
													}
													onChange={
														handleMetricsChange
													}
													placeholder='example.com or https://example.com'
													className='h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-sky-500/20'
												/>
												<p className='text-slate-500 text-xs mt-1.5 flex items-center gap-1'>
													<Info size={12} />
													URL will be automatically
													formatted
												</p>
											</div>
											<div>
												<Label
													htmlFor='country'
													className='text-slate-700 font-semibold text-sm mb-2 flex items-center gap-2'>
													<MapPin
														size={16}
														className='text-slate-500'
													/>
													Country
												</Label>
												<Input
													id='country'
													name='country'
													type='text'
													value={
														formData.metrics.country
													}
													onChange={
														handleMetricsChange
													}
													placeholder='e.g., United States'
													className='h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-sky-500/20'
												/>
											</div>
										</div>
									</div>
								</div>
							)}

							{/* Step 3: Images */}
							{currentStep === 3 && (
								<div className='space-y-6'>
									<div className='text-center md:text-left'>
										<h2 className='text-2xl md:text-3xl font-bold text-slate-900 mb-2 flex items-center gap-2 justify-center md:justify-start'>
											<ImageIcon
												size={28}
												className='text-sky-600'
											/>
											Images
										</h2>
										<p className='text-slate-600 text-sm md:text-base'>
											Upload images to showcase your
											digital asset
										</p>
									</div>

									{errors.thumbnail && (
										<div className='p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm flex items-start gap-2'>
											<AlertCircle
												size={18}
												className='text-rose-600 mt-0.5 shrink-0'
											/>
											<span>{errors.thumbnail}</span>
										</div>
									)}

									<div className='space-y-5 md:space-y-6'>
										{/* Thumbnail Upload */}
										<div>
											<Label className='text-slate-700 font-semibold text-sm mb-3 flex items-center gap-2'>
												<ImageIcon
													size={16}
													className='text-slate-500'
												/>
												Thumbnail Image{" "}
												<span className='text-rose-500'>
													*
												</span>
											</Label>
											<div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-4'>
												<label
													className={cn(
														"flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 md:p-8 transition-all duration-200 min-h-[140px]",
														uploadingImages
															? "border-sky-500 bg-sky-50 cursor-not-allowed"
															: formData.thumbnail
															? "border-emerald-300 bg-emerald-50/30 cursor-pointer hover:border-emerald-400"
															: "border-slate-300 bg-slate-50 cursor-pointer hover:border-sky-400 hover:bg-sky-50/30"
													)}>
													<div className='text-center'>
														{uploadingImages ? (
															<>
																<Loader2 className='w-8 h-8 text-sky-600 mx-auto mb-3 animate-spin' />
																<span className='text-sm text-sky-700 font-semibold'>
																	Uploading...
																</span>
															</>
														) : formData.thumbnail ? (
															<>
																<Check className='w-8 h-8 text-emerald-600 mx-auto mb-2' />
																<span className='text-sm text-emerald-700 font-semibold'>
																	Thumbnail
																	Uploaded
																</span>
																<p className='text-xs text-slate-500 mt-1'>
																	Click to
																	change
																</p>
															</>
														) : (
															<>
																<div className='w-12 h-12 rounded-xl bg-linear-to-br from-sky-500 to-blue-500 flex items-center justify-center mb-3 shadow-lg'>
																	<Upload className='w-6 h-6 text-white' />
																</div>
																<span className='text-sm text-slate-700 font-semibold block mb-1'>
																	Click to
																	upload
																	thumbnail
																</span>
																<span className='text-xs text-slate-500'>
																	PNG, JPG up
																	to 10MB
																</span>
															</>
														)}
													</div>
													<input
														type='file'
														accept='image/*'
														onChange={(e) => {
															handleImageUpload(
																e,
																true
															);
															if (
																errors.thumbnail
															) {
																setErrors(
																	(prev) => {
																		const newErrors =
																			{
																				...prev,
																			};
																		delete newErrors.thumbnail;
																		return newErrors;
																	}
																);
															}
														}}
														disabled={
															uploadingImages
														}
														className='hidden'
													/>
												</label>
												{formData.thumbnail && (
													<div className='relative w-full sm:w-32 h-32 sm:h-32 rounded-xl overflow-hidden border-2 border-emerald-200 shadow-lg group'>
														<img
															src={
																formData.thumbnail ||
																"/placeholder.svg"
															}
															alt='Thumbnail'
															className='w-full h-full object-cover'
														/>
														<button
															type='button'
															onClick={
																removeThumbnail
															}
															className='absolute -top-2 -right-2 bg-rose-500 rounded-full p-1.5 hover:bg-rose-600 shadow-lg transition-all hover:scale-110'>
															<X className='w-4 h-4 text-white' />
														</button>
													</div>
												)}
											</div>
										</div>

										{/* Additional Images Upload */}
										<div>
											<Label className='text-slate-700 font-semibold text-sm mb-3 flex items-center gap-2'>
												<ImageIcon
													size={16}
													className='text-slate-500'
												/>
												Additional Images (up to 6)
											</Label>
											<label
												className={cn(
													"flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 md:p-8 transition-all duration-200 min-h-[120px]",
													uploadingImages
														? "border-sky-500 bg-sky-50 cursor-not-allowed"
														: formData.images
																.length >= 6
														? "border-slate-300 bg-slate-50 cursor-not-allowed"
														: "border-slate-300 bg-slate-50 cursor-pointer hover:border-sky-400 hover:bg-sky-50/30"
												)}>
												<div className='text-center'>
													{uploadingImages ? (
														<>
															<Loader2 className='w-8 h-8 text-sky-600 mx-auto mb-3 animate-spin' />
															<span className='text-sm text-sky-700 font-semibold'>
																Uploading...
															</span>
														</>
													) : formData.images
															.length >= 6 ? (
														<>
															<Check className='w-8 h-8 text-emerald-600 mx-auto mb-2' />
															<span className='text-sm text-emerald-700 font-semibold'>
																Maximum images
																reached
															</span>
														</>
													) : (
														<>
															<div className='w-12 h-12 rounded-xl bg-linear-to-br from-sky-500 to-blue-500 flex items-center justify-center mb-3 shadow-lg'>
																<Upload className='w-6 h-6 text-white' />
															</div>
															<span className='text-sm text-slate-700 font-semibold block mb-1'>
																Click to upload
																images
															</span>
															<span className='text-xs text-slate-500'>
																{
																	formData
																		.images
																		.length
																}
																/6 uploaded
															</span>
														</>
													)}
												</div>
												<input
													type='file'
													accept='image/*'
													multiple
													onChange={(e) =>
														handleImageUpload(
															e,
															false
														)
													}
													disabled={
														uploadingImages ||
														formData.images
															.length >= 6
													}
													className='hidden'
												/>
											</label>

											{/* Image Preview Grid */}
											{formData.images.length > 0 && (
												<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 mt-4'>
													{formData.images.map(
														(image, index) => (
															<div
																key={index}
																className='relative group rounded-xl overflow-hidden border-2 border-slate-200 shadow-md hover:shadow-lg transition-all'>
																<img
																	src={
																		image ||
																		"/placeholder.svg"
																	}
																	alt={`Image ${
																		index +
																		1
																	}`}
																	className='w-full h-32 md:h-40 object-cover group-hover:scale-105 transition-transform duration-300'
																/>
																<button
																	type='button'
																	onClick={() =>
																		removeImage(
																			index
																		)
																	}
																	className='absolute top-2 right-2 bg-rose-500 rounded-full p-1.5 hover:bg-rose-600 shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110'>
																	<X className='w-4 h-4 text-white' />
																</button>
																<div className='absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs font-semibold px-2 py-1 text-center'>
																	Image{" "}
																	{index + 1}
																</div>
															</div>
														)
													)}
												</div>
											)}
										</div>
									</div>
								</div>
							)}

							{/* Step 4: Metrics */}
							{currentStep === 4 && (
								<div className='space-y-6'>
									<div className='text-center md:text-left'>
										<h2 className='text-2xl md:text-3xl font-bold text-slate-900 mb-2 flex items-center gap-2 justify-center md:justify-start'>
											<TrendingUp
												size={28}
												className='text-sky-600'
											/>
											Metrics
										</h2>
										<p className='text-slate-600 text-sm md:text-base'>
											Provide performance metrics for your
											digital asset
										</p>
									</div>

									<div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5'>
										<div>
											<Label
												htmlFor='monthlyRevenue'
												className='text-slate-700 font-semibold text-sm mb-2 flex items-center gap-2'>
												<DollarSign
													size={16}
													className='text-emerald-500'
												/>
												Monthly Revenue ($)
											</Label>
											<Input
												id='monthlyRevenue'
												name='monthlyRevenue'
												type='number'
												min='0'
												value={
													formData.metrics
														.monthlyRevenue
												}
												onChange={handleMetricsChange}
												placeholder='0'
												className='h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-sky-500/20'
											/>
										</div>

										<div>
											<Label
												htmlFor='monthlyTraffic'
												className='text-slate-700 font-semibold text-sm mb-2 flex items-center gap-2'>
												<Eye
													size={16}
													className='text-blue-500'
												/>
												Monthly Traffic/Reach
											</Label>
											<Input
												id='monthlyTraffic'
												name='monthlyTraffic'
												type='number'
												min='0'
												value={
													formData.metrics
														.monthlyTraffic
												}
												onChange={handleMetricsChange}
												placeholder='0'
												className='h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-sky-500/20'
											/>
										</div>

										{hasFollowers() && (
											<div>
												<Label
													htmlFor='followers'
													className='text-slate-700 font-semibold text-sm mb-2 flex items-center gap-2'>
													<Users
														size={16}
														className='text-purple-500'
													/>
													Followers/Subscribers
												</Label>
												<Input
													id='followers'
													name='followers'
													type='number'
													min='0'
													value={
														formData.metrics
															.followers
													}
													onChange={
														handleMetricsChange
													}
													placeholder='0'
													className='h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-sky-500/20'
												/>
											</div>
										)}

										<div>
											<Label
												htmlFor='age'
												className='text-slate-700 font-semibold text-sm mb-2 flex items-center gap-2'>
												<Calendar
													size={16}
													className='text-orange-500'
												/>
												Age (months)
											</Label>
											<Input
												id='age'
												name='age'
												type='number'
												min='0'
												value={formData.metrics.age}
												onChange={handleMetricsChange}
												placeholder='0'
												className='h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-sky-500/20'
											/>
										</div>

										<div>
											<Label
												htmlFor='niche'
												className='text-slate-700 font-semibold text-sm mb-2 flex items-center gap-2'>
												<Tag
													size={16}
													className='text-slate-500'
												/>
												Niche
											</Label>
											<Input
												id='niche'
												name='niche'
												value={formData.details.niche}
												onChange={handleDetailsChange}
												placeholder='e.g., Technology, Finance'
												className='h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-sky-500/20'
											/>
										</div>

										<div>
											<Label
												htmlFor='monetization'
												className='text-slate-700 font-semibold text-sm mb-2 flex items-center gap-2'>
												<CreditCard
													size={16}
													className='text-slate-500'
												/>
												Monetization
											</Label>
											<Input
												id='monetization'
												name='monetization'
												value={
													formData.details
														.monetization
												}
												onChange={handleDetailsChange}
												placeholder='e.g., AdSense, Sponsorships'
												className='h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-sky-500/20'
											/>
										</div>

										<div>
											<Label
												htmlFor='trafficSource'
												className='text-slate-700 font-semibold text-sm mb-2 flex items-center gap-2'>
												<Globe
													size={16}
													className='text-slate-500'
												/>
												Traffic Source
											</Label>
											<Input
												id='trafficSource'
												name='trafficSource'
												value={
													formData.details
														.trafficSource
												}
												onChange={handleDetailsChange}
												placeholder='e.g., Organic, Paid'
												className='h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-sky-500/20'
											/>
										</div>

										<div>
											<Label
												htmlFor='growthPotential'
												className='text-slate-700 font-semibold text-sm mb-2 flex items-center gap-2'>
												<TrendingUp
													size={16}
													className='text-slate-500'
												/>
												Growth Potential
											</Label>
											<Input
												id='growthPotential'
												name='growthPotential'
												value={
													formData.details
														.growthPotential
												}
												onChange={handleDetailsChange}
												placeholder='e.g., High, Medium, Low'
												className='h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-sky-500/20'
											/>
										</div>
									</div>
								</div>
							)}

							{/* Step 5: Pricing */}
							{currentStep === 5 && (
								<div className='space-y-6'>
									<div className='text-center md:text-left'>
										<h2 className='text-xl md:text-3xl font-bold text-slate-900 mb-2 flex items-center gap-2 justify-center md:justify-start'>
											<DollarSign
												size={28}
												className='text-emerald-600'
											/>
											Pricing & Additional Details
										</h2>
										<p className='text-slate-600 text-sm md:text-base'>
											Set your price and provide
											additional information
										</p>
									</div>

									<div className='space-y-5 md:space-y-6'>
										<div>
											<Label
												htmlFor='price'
												className='text-slate-700 font-semibold text-sm mb-2 flex items-center gap-2'>
												<DollarSign
													size={16}
													className='text-emerald-600'
												/>
												Asking Price ($){" "}
												<span className='text-rose-500'>
													*
												</span>
											</Label>
											<Input
												id='price'
												name='price'
												type='number'
												min='0'
												step='0.01'
												value={formData.price}
												onChange={handleChange}
												placeholder='0.00'
												className={cn(
													"h-12 text-lg bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20",
													errors.price &&
														"border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
												)}
												required
											/>
											{errors.price && (
												<p className='text-rose-600 text-xs mt-1.5 flex items-center gap-1'>
													<AlertCircle size={14} />
													{errors.price}
												</p>
											)}
											<p className='text-slate-500 text-xs mt-1.5 flex items-center gap-1'>
												<Info size={12} />
												Platform fee of 5% will be
												deducted upon sale
											</p>
										</div>

										<div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5'>
											<div>
												<Label
													htmlFor='paymentReceived'
													className='text-slate-700 font-semibold text-sm mb-2 flex items-center gap-2'>
													<CreditCard
														size={16}
														className='text-slate-500'
													/>
													Payment Received
												</Label>
												<Input
													id='paymentReceived'
													name='paymentReceived'
													value={
														formData.details
															.paymentReceived
													}
													onChange={
														handleDetailsChange
													}
													placeholder='e.g., 1, 2, 3'
													className='h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-sky-500/20'
												/>
											</div>
											<div>
												<Label
													htmlFor='adManager'
													className='text-slate-700 font-semibold text-sm mb-2 flex items-center gap-2'>
													<ShoppingBag
														size={16}
														className='text-slate-500'
													/>
													Ad Manager Used
												</Label>
												<Input
													id='adManager'
													name='adManager'
													value={
														formData.details
															.adManager
													}
													onChange={
														handleDetailsChange
													}
													placeholder='e.g., Yes/No'
													className='h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-sky-500/20'
												/>
											</div>
											<div>
												<Label
													htmlFor='domainProvider'
													className='text-slate-700 font-semibold text-sm mb-2 flex items-center gap-2'>
													<Globe
														size={16}
														className='text-slate-500'
													/>
													Domain Provider
												</Label>
												<Input
													id='domainProvider'
													name='domainProvider'
													value={
														formData.details
															.domainProvider
													}
													onChange={
														handleDetailsChange
													}
													placeholder='e.g., GoDaddy, Namecheap'
													className='h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-sky-500/20'
												/>
											</div>
											<div>
												<Label
													htmlFor='domainExpiry'
													className='text-slate-700 font-semibold text-sm mb-2 flex items-center gap-2'>
													<Calendar
														size={16}
														className='text-slate-500'
													/>
													Domain Expiry
												</Label>
												<Input
													id='domainExpiry'
													name='domainExpiry'
													value={
														formData.details
															.domainExpiry
													}
													onChange={
														handleDetailsChange
													}
													placeholder='e.g., 2025-12-31'
													className='h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-sky-500/20'
												/>
											</div>
											<div>
												<Label
													htmlFor='platform'
													className='text-slate-700 font-semibold text-sm mb-2 flex items-center gap-2'>
													<Globe
														size={16}
														className='text-slate-500'
													/>
													Platform
												</Label>
												<Input
													id='platform'
													name='platform'
													value={
														formData.details
															.platform
													}
													onChange={
														handleDetailsChange
													}
													placeholder='e.g., WordPress, Blogger'
													className='h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-sky-500/20'
												/>
											</div>
											<div>
												<Label
													htmlFor='issue'
													className='text-slate-700 font-semibold text-sm mb-2 flex items-center gap-2'>
													<AlertCircle
														size={16}
														className='text-amber-500'
													/>
													Any Issues (Optional)
												</Label>
												<Input
													id='issue'
													name='issue'
													value={
														formData.details.issue
													}
													onChange={
														handleDetailsChange
													}
													placeholder='e.g., Limit, Policy Issue'
													className='h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-sky-500/20'
												/>
											</div>
										</div>
									</div>
								</div>
							)}

							{/* Navigation Buttons */}
							<div className='flex justify-between gap-3 pt-6 md:pt-8 border-t border-slate-200'>
								<Button
									type='button'
									variant='outline'
									onClick={prevStep}
									disabled={
										currentStep === 1 ||
										saving ||
										uploadingImages
									}
									className='border-slate-300 text-slate-700 hover:bg-slate-100 gap-2 disabled:opacity-50 disabled:cursor-not-allowed'>
									<ArrowLeft size={18} />
									Previous
								</Button>
								{currentStep < steps.length ? (
									<Button
										type='button'
										onClick={nextStep}
										disabled={saving || uploadingImages}
										className='bg-linear-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white shadow-lg shadow-sky-500/20 gap-2 disabled:opacity-50 disabled:cursor-not-allowed'>
										Next
										<ArrowRight size={18} />
									</Button>
								) : (
									<Button
										type='submit'
										onClick={() => {
											submitButtonClicked.current = true;
										}}
										disabled={saving || uploadingImages}
										className='bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/20 gap-2 disabled:opacity-50 disabled:cursor-not-allowed'>
										{saving ? (
											<>
												<Loader2
													size={18}
													className='animate-spin'
												/>
												Updating Listing...
											</>
										) : uploadingImages ? (
											<>
												<Loader2
													size={18}
													className='animate-spin'
												/>
												Uploading Images...
											</>
										) : (
											<>
												<Check size={18} />
												Update Listing
											</>
										)}
									</Button>
								)}
							</div>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
