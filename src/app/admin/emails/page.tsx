"use client";

import type { ChangeEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdminSidebar from "@/components/admin-sidebar";
import { userContext } from "@/context/userContext";
import axios from "axios";
import { toast } from "sonner";
import {
	Mail,
	Send,
	Filter,
	RefreshCw,
	Search,
	CheckCircle,
	XCircle,
	Clock,
	FileText,
	Loader2,
	AlertCircle,
	Eye,
	Users,
	Calendar,
} from "lucide-react";

type Listing = {
	_id: string;
	title: string;
	description?: string;
	status: string;
	slug?: string;
	updatedAt?: string;
	createdAt?: string;
	seller?: {
		name?: string;
		email?: string;
		contactEmail?: string;
	};
};

type TemplateKey = "stale" | "pending_update" | "rejected_feedback" | "custom";

const templates: Record<
	TemplateKey,
	{ label: string; subject: string; body: string }
> = {
	stale: {
		label: "Follow-up: Listing inactive",
		subject: "Quick follow-up on your listing: {listingTitle}",
		body: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Follow-up on Your Listing</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8fafc; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Deelzo Marketplace</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 24px; font-weight: 600;">Hi {sellerName},</h2>
                            
                            <p style="margin: 0 0 20px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                                We noticed your listing <strong style="color: #0ea5e9;">"{listingTitle}"</strong> hasn't been updated in a while.
                            </p>
                            
                            <div style="background-color: #f1f5f9; border-left: 4px solid #0ea5e9; padding: 20px; margin: 25px 0; border-radius: 6px;">
                                <p style="margin: 0; color: #334155; font-size: 15px; line-height: 1.6;">
                                    If anything has changed (pricing, metrics, or details), you can update it to attract more buyers and increase your chances of a successful sale.
                                </p>
                            </div>
                            
                            <p style="margin: 20px 0; color: #475569; font-size: 16px; line-height: 1.6;">
Need help or have questions? Reply to this email and our team will assist you.
                            </p>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="https://deelzo.com/dashboard" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Update Your Listing</a>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0 0 10px 0; color: #64748b; font-size: 14px;">
                                Thanks,<br>
                                <strong style="color: #1e293b;">Deelzo Support Team</strong>
                            </p>
                            <p style="margin: 10px 0 0 0; color: #94a3b8; font-size: 12px;">
                                © ${new Date().getFullYear()} Deelzo. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`,
	},
	pending_update: {
		label: "Action needed: Pending updates",
		subject: "Action needed on your listing: {listingTitle}",
		body: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Action Needed on Your Listing</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8fafc; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Action Required</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 24px; font-weight: 600;">Hi {sellerName},</h2>
                            
                            <p style="margin: 0 0 20px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                                Your listing <strong style="color: #f59e0b;">"{listingTitle}"</strong> is still pending updates.
                            </p>
                            
                            <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 6px;">
                                <p style="margin: 0 0 10px 0; color: #92400e; font-size: 15px; font-weight: 600;">⚠️ Action Required</p>
                                <p style="margin: 0; color: #78350f; font-size: 15px; line-height: 1.6;">
                                    Please add the requested details so we can approve and feature it sooner. This will help your listing get more visibility and attract potential buyers.
                                </p>
                            </div>
                            
                            <p style="margin: 20px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                                If you're unsure what to change, reply here and we'll guide you through the process step by step.
                            </p>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="https://deelzo.com/dashboard" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Complete Your Listing</a>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0 0 10px 0; color: #64748b; font-size: 14px;">
                                Thanks,<br>
                                <strong style="color: #1e293b;">Deelzo Support Team</strong>
                            </p>
                            <p style="margin: 10px 0 0 0; color: #94a3b8; font-size: 12px;">
                                © ${new Date().getFullYear()} Deelzo. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`,
	},
	rejected_feedback: {
		label: "We need a quick revision",
		subject: "Help us relist: {listingTitle}",
		body: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Listing Revision Needed</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8fafc; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Revision Needed</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 24px; font-weight: 600;">Hi {sellerName},</h2>
                            
                            <p style="margin: 0 0 20px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                                We paused your listing <strong style="color: #ef4444;">"{listingTitle}"</strong> because we need a quick revision.
                            </p>
                            
                            <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 25px 0; border-radius: 6px;">
                                <p style="margin: 0 0 10px 0; color: #991b1b; font-size: 15px; font-weight: 600;">📝 Next Steps</p>
                                <p style="margin: 0; color: #7f1d1d; font-size: 15px; line-height: 1.6;">
                                    Please review the feedback in your dashboard and re-submit when ready. We're here to help you get your listing approved quickly.
                                </p>
                            </div>
                            
                            <p style="margin: 20px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                                If you prefer, reply to this email and we can make the change for you. Our team is ready to assist!
                            </p>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="https://deelzo.com/dashboard" style="display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Review & Resubmit</a>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0 0 10px 0; color: #64748b; font-size: 14px;">
                                Thanks,<br>
                                <strong style="color: #1e293b;">Deelzo Support Team</strong>
                            </p>
                            <p style="margin: 10px 0 0 0; color: #94a3b8; font-size: 12px;">
                                © ${new Date().getFullYear()} Deelzo. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`,
	},
	custom: {
		label: "Custom message",
		subject: "",
		body: "",
	},
};

export default function AdminEmails() {
	const { user } = userContext();
	const [listings, setListings] = useState<Listing[]>([]);
	const [filter, setFilter] = useState<string>("all");
	const [loading, setLoading] = useState<boolean>(true);
	const [sending, setSending] = useState<boolean>(false);
	const [selectedListingId, setSelectedListingId] = useState<string>("");
	const [selectedTemplate, setSelectedTemplate] =
		useState<TemplateKey>("stale");
	const [toEmail, setToEmail] = useState<string>("");
	const [subject, setSubject] = useState<string>("");
	const [body, setBody] = useState<string>("");
	const [search, setSearch] = useState<string>("");

	const fetchListings = async () => {
		if (!user?._id) return;
		setLoading(true);
		try {
			const res = await axios.get(
				`/api/admin/all-listings?adminId=${user._id}`
			);
			setListings(res.data || []);
		} catch (err) {
			console.error("Failed to load listings", err);
			toast.error("Could not load listings");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchListings();
	}, [user?._id]);

	const filteredListings = useMemo(() => {
		const byStatus =
			filter === "all"
				? listings
				: listings.filter(
						(listing) =>
							listing.status?.toLowerCase() ===
							filter.toLowerCase()
				  );

		if (!search.trim()) return byStatus;
		const term = search.toLowerCase();
		return byStatus.filter(
			(l) =>
				l.title.toLowerCase().includes(term) ||
				l.status?.toLowerCase().includes(term) ||
				l.seller?.name?.toLowerCase().includes(term)
		);
	}, [filter, listings, search]);

	const selectedListing: any = useMemo(
		() =>
			filteredListings.find((l) => l._id === selectedListingId) ||
			filteredListings[0],
		[filteredListings, selectedListingId]
	);

	useEffect(() => {
		if (!selectedListing) return;
		setSelectedListingId(selectedListing._id);

		const template = templates[selectedTemplate];
		const sellerName = selectedListing.seller?.name || "there";
		const listingTitle = selectedListing.title || "your listing";

		const nextSubject =
			selectedTemplate === "custom"
				? subject
				: template.subject
						.replace(/{sellerName}/g, sellerName)
						.replace(/{listingTitle}/g, listingTitle);

		const nextBody =
			selectedTemplate === "custom"
				? body
				: template.body
						.replace(/{sellerName}/g, sellerName)
						.replace(/{listingTitle}/g, listingTitle);

		setSubject(nextSubject);
		setBody(nextBody);
		setToEmail(
			selectedListing.seller?.email ||
				selectedListing.seller?.contactEmail ||
				""
		);
	}, [selectedListing?._id, selectedTemplate]);

	const handleSend = async () => {
		if (!user?._id) {
			toast.error("You must be logged in as admin");
			return;
		}

		if (!toEmail || !subject || !body) {
			toast.error("To, subject, and body are required");
			return;
		}

		setSending(true);
		try {
			await axios.post("/api/admin/emails", {
				adminId: user._id,
				to: toEmail,
				subject,
				html: body,
				listingId: selectedListing?._id,
				template: selectedTemplate,
			});
			toast.success("Email sent");
		} catch (err) {
			console.error("Failed to send email", err);
			toast.error("Failed to send email");
		} finally {
			setSending(false);
		}
	};

	const totalListings = listings.length;
	const activeListings = listings.filter((l) => l.status === "active").length;
	const pendingListings = listings.filter(
		(l) => l.status === "pending"
	).length;
	const rejectedListings = listings.filter(
		(l) => l.status === "rejected"
	).length;

	return (
		<div className='flex min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100'>
			<AdminSidebar />

			<main className='flex-1 md:ml-64 p-4 md:p-6 lg:p-8'>
				{/* Header */}
				<div className='mb-8 mt-16 md:mt-0'>
					<div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6'>
						<div>
							<h1 className='text-3xl md:text-4xl font-bold bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent mb-2'>
								Email Sellers
							</h1>
							<p className='text-slate-600 text-sm md:text-base'>
								Send beautiful HTML emails to sellers based on
								listing status or activity
							</p>
						</div>
					</div>
				</div>

				{/* Stats */}
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8'>
					<Card className='bg-linear-to-br from-white to-blue-50/30 border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1'>
						<CardContent className='p-6'>
							<div className='flex items-center justify-between'>
								<div className='flex-1'>
									<p className='text-slate-600 text-sm font-medium mb-1'>
										Total Listings
									</p>
									<p className='text-3xl font-bold text-slate-900 mb-1'>
										{totalListings}
									</p>
									<div className='flex items-center gap-1 text-xs text-slate-500'>
										<FileText size={12} />
										<span>Available</span>
									</div>
								</div>
								<div className='w-14 h-14 rounded-xl bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20'>
									<FileText
										size={24}
										className='text-white'
									/>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className='bg-linear-to-br from-white to-emerald-50/30 border border-emerald-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1'>
						<CardContent className='p-6'>
							<div className='flex items-center justify-between'>
								<div className='flex-1'>
									<p className='text-slate-600 text-sm font-medium mb-1'>
										Active Listings
									</p>
									<p className='text-3xl font-bold text-emerald-600 mb-1'>
										{activeListings}
									</p>
									<div className='flex items-center gap-1 text-xs text-slate-500'>
										<CheckCircle size={12} />
										<span>Published</span>
									</div>
								</div>
								<div className='w-14 h-14 rounded-xl bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20'>
									<CheckCircle
										size={24}
										className='text-white'
									/>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className='bg-linear-to-br from-white to-amber-50/30 border border-amber-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1'>
						<CardContent className='p-6'>
							<div className='flex items-center justify-between'>
								<div className='flex-1'>
									<p className='text-slate-600 text-sm font-medium mb-1'>
										Pending Review
									</p>
									<p className='text-3xl font-bold text-amber-600 mb-1'>
										{pendingListings}
									</p>
									<div className='flex items-center gap-1 text-xs text-slate-500'>
										<Clock size={12} />
										<span>Awaiting</span>
									</div>
								</div>
								<div className='w-14 h-14 rounded-xl bg-linear-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20'>
									<Clock size={24} className='text-white' />
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className='bg-linear-to-br from-white to-rose-50/30 border border-rose-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1'>
						<CardContent className='p-6'>
							<div className='flex items-center justify-between'>
								<div className='flex-1'>
									<p className='text-slate-600 text-sm font-medium mb-1'>
										Rejected
									</p>
									<p className='text-3xl font-bold text-rose-600 mb-1'>
										{rejectedListings}
									</p>
									<div className='flex items-center gap-1 text-xs text-slate-500'>
										<XCircle size={12} />
										<span>Rejected</span>
									</div>
								</div>
								<div className='w-14 h-14 rounded-xl bg-linear-to-br from-rose-400 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/20'>
									<XCircle size={24} className='text-white' />
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				<div className='grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8'>
					<Card className='bg-white border border-slate-200 shadow-lg lg:col-span-2'>
						<CardContent className='p-6 space-y-4'>
							<div className='flex items-center justify-between mb-4'>
								<h2 className='text-xl font-bold text-slate-900 flex items-center gap-2'>
									<Filter size={20} />
									Select Listing
								</h2>
								<Button
									variant='outline'
									size='sm'
									className='cursor-pointer border-slate-200 hover:bg-slate-50'
									onClick={fetchListings}
									disabled={loading}>
									<RefreshCw
										size={16}
										className={
											loading ? "animate-spin" : ""
										}
									/>
									Refresh
								</Button>
							</div>

							<div className='flex flex-col gap-4'>
								{/* Filter Tabs */}
								<div className='flex items-center gap-2 flex-wrap'>
									{[
										"all",
										"active",
										"pending",
										"rejected",
									].map((s) => {
										const count =
											s === "all"
												? listings.length
												: listings.filter(
														(l) => l.status === s
												  ).length;
										return (
											<Button
												key={s}
												variant='ghost'
												size='sm'
												className={`relative cursor-pointer transition-all duration-200 gap-2 h-9 px-3 ${
													filter === s
														? "bg-linear-to-r from-sky-500 to-blue-500 text-white shadow-lg shadow-sky-500/30 hover:from-sky-600 hover:to-blue-600"
														: "border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300"
												}`}
												onClick={() => setFilter(s)}>
												<span className='font-medium text-xs'>
													{s[0].toUpperCase() +
														s.slice(1)}
												</span>
												{filter === s && (
													<span className='ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs font-semibold'>
														{count}
													</span>
												)}
											</Button>
										);
									})}
								</div>

								{/* Search */}
								<div className='relative'>
									<Search
										className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400'
										size={18}
									/>
									<Input
										placeholder='Search by title or seller...'
										value={search}
										onChange={(e) =>
											setSearch(e.target.value)
										}
										className='pl-10 pr-4 h-10 bg-white border-slate-200 focus:border-sky-500 focus:ring-sky-500/20'
									/>
								</div>

								{/* Listings List */}
								<div className='max-h-[410px] overflow-auto border border-slate-200 rounded-lg divide-y divide-slate-100 bg-slate-50/50'>
									{loading ? (
										<div className='p-8 text-center'>
											<Loader2
												className='animate-spin mx-auto mb-3 text-sky-500'
												size={24}
											/>
											<p className='text-slate-600 text-sm'>
												Loading listings...
											</p>
										</div>
									) : filteredListings.length ? (
										filteredListings.map((listing) => {
											const statusConfig: any = {
												active: {
													bg: "bg-emerald-100 text-emerald-700",
													icon: CheckCircle,
												},
												pending: {
													bg: "bg-amber-100 text-amber-700",
													icon: Clock,
												},
												rejected: {
													bg: "bg-rose-100 text-rose-700",
													icon: XCircle,
												},
											};
											const config = statusConfig[
												listing.status
											] || {
												bg: "bg-slate-100 text-slate-700",
												icon: FileText,
											};
											const StatusIcon = config.icon;
											return (
												<button
													key={listing._id}
													onClick={() =>
														setSelectedListingId(
															listing._id
														)
													}
													className={`w-full text-left cursor-pointer p-4 hover:bg-white transition-colors ${
														selectedListingId ===
														listing._id
															? "bg-white border-l-4 border-sky-500"
															: ""
													}`}>
													<div className='flex items-start justify-between gap-2'>
														<div className='flex-1 min-w-0'>
															<p className='font-semibold text-slate-900 line-clamp-1 mb-1'>
																{listing.title}
															</p>
															<div className='flex items-center gap-3 flex-wrap'>
																<span
																	className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${config.bg}`}>
																	<StatusIcon
																		size={
																			12
																		}
																	/>
																	{
																		listing.status
																	}
																</span>
																{listing.seller
																	?.name && (
																	<span className='text-xs text-slate-600 flex items-center gap-1'>
																		<Users
																			size={
																				12
																			}
																		/>
																		{
																			listing
																				.seller
																				.name
																		}
																	</span>
																)}
																{listing.updatedAt && (
																	<span className='text-xs text-slate-500 flex items-center gap-1'>
																		<Calendar
																			size={
																				12
																			}
																		/>
																		{new Date(
																			listing.updatedAt
																		).toLocaleDateString()}
																	</span>
																)}
															</div>
														</div>
													</div>
												</button>
											);
										})
									) : (
										<div className='p-8 text-center'>
											<AlertCircle
												className='mx-auto mb-3 text-slate-400'
												size={32}
											/>
											<p className='text-slate-600 text-sm'>
												No listings found
											</p>
										</div>
									)}
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className='bg-white border border-slate-200 shadow-lg lg:col-span-3'>
						<CardContent className='p-6 space-y-6'>
							<div className='flex items-center justify-between'>
								<h2 className='text-xl font-bold text-slate-900 flex items-center gap-2'>
									<Mail size={20} />
									Compose Email
								</h2>
								<div className='flex gap-2'>
									<select
										value={selectedTemplate}
										onChange={(e) =>
											setSelectedTemplate(
												e.target.value as TemplateKey
											)
										}
										className='border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500 shadow-sm'>
										{Object.entries(templates).map(
											([key, value]) => (
												<option key={key} value={key}>
													{value.label}
												</option>
											)
										)}
									</select>
								</div>
							</div>

							{selectedListing && (
								<div className='bg-linear-to-br from-sky-50 to-blue-50/30 rounded-xl p-4 border border-sky-100'>
									<p className='text-xs text-slate-600 mb-1 font-medium'>
										Selected Listing
									</p>
									<p className='text-sm font-bold text-slate-900'>
										{selectedListing.title}
									</p>
									{selectedListing.seller?.name && (
										<p className='text-xs text-slate-600 mt-1'>
											Seller:{" "}
											{selectedListing.seller.name}
										</p>
									)}
								</div>
							)}

							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div className='space-y-2'>
									<label className='text-sm font-medium text-slate-700 flex items-center gap-2'>
										<Mail size={14} />
										To
									</label>
									<Input
										value={toEmail}
										onChange={(e) =>
											setToEmail(e.target.value)
										}
										placeholder='seller@example.com'
										className='bg-white border-slate-200 focus:border-sky-500 focus:ring-sky-500/20'
									/>
								</div>
								<div className='space-y-2'>
									<label className='text-sm font-medium text-slate-700'>
										Subject
									</label>
									<Input
										value={subject}
										onChange={(e) =>
											setSubject(e.target.value)
										}
										placeholder='Email subject line'
										className='bg-white border-slate-200 focus:border-sky-500 focus:ring-sky-500/20'
									/>
								</div>
							</div>

							<div className='space-y-2'>
								<div className='flex items-center justify-between'>
									<label className='text-sm font-medium text-slate-700'>
										HTML Email Body
									</label>
									<Button
										variant='ghost'
										size='sm'
										className='text-xs text-slate-600 hover:text-slate-900'
										onClick={() => {
											const previewWindow = window.open(
												"",
												"_blank"
											);
											if (previewWindow) {
												previewWindow.document.write(
													body
												);
												previewWindow.document.close();
											}
										}}>
										<Eye size={14} className='mr-1' />
										Preview
									</Button>
								</div>
								<textarea
									value={body}
									onChange={(
										e: ChangeEvent<HTMLTextAreaElement>
									) => setBody(e.target.value)}
									rows={6}
									className='w-full rounded-lg border border-slate-200 bg-white px-4 py-3 font-mono text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500 resize-none'
									placeholder='HTML email content will appear here when you select a template...'
								/>
								<p className='text-xs text-slate-500'>
									💡 Tip: The templates are pre-formatted HTML
									emails that will look beautiful in
									recipients' inboxes
								</p>
							</div>

							<div className='flex justify-end gap-3 pt-4 border-t border-slate-200'>
								<Button
									variant='outline'
									className='cursor-pointer border-slate-200 hover:bg-slate-50'
									onClick={() => {
										setSelectedTemplate("custom");
										setSubject("");
										setBody("");
									}}>
									Clear
								</Button>
								<Button
									onClick={handleSend}
									disabled={
										sending ||
										loading ||
										!toEmail ||
										!subject ||
										!body
									}
									className='bg-linear-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white cursor-pointer shadow-lg shadow-sky-500/20 gap-2'>
									{sending ? (
										<>
											<RefreshCw
												size={16}
												className='animate-spin'
											/>
											Sending...
										</>
									) : (
										<>
											<Send size={16} />
											Send Email
										</>
									)}
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			</main>
		</div>
	);
}
