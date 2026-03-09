"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
	User,
	Mail,
	Phone,
	Calendar,
	Shield,
	Star,
	Package,
	DollarSign,
	Camera,
	Loader2,
	Save,
	CheckCircle,
	AlertCircle,
	Edit3,
	MapPin,
	Briefcase,
} from "lucide-react";
import { userContext } from "@/context/userContext";
import { toast } from "sonner";
import axios from "axios";
import Image from "next/image";
import AdminSidebar from "@/components/admin-sidebar";

export default function ProfilePage() {
	const { user, setUser } = userContext();
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);


	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		bio: "",
		avatar: "",
		location: "",
		company: "",
	});

	useEffect(() => {
		if (user) {
			setFormData({
				name: user.name || "",
				email: user.email || "",
				phone: user.phone || "",
				bio: (user as any).bio || "",
				avatar: user.avatar || "",
				location: (user as any).location || "",
				company: (user as any).company || "",
			});
			setLoading(false);
		}
	}, [user]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user) return;

		setSaving(true);
		try {
			const response = await axios.put(`/api/users/${user._id}`, {
				userId: user._id,
				name: formData.name,
				phone: formData.phone,
				bio: formData.bio,
				avatar: formData.avatar,
				location: formData.location,
				company: formData.company,
			});

			if (response.data.success) {
				setUser(response.data.user);
				toast.success("Profile updated successfully");
				setIsEditing(false);
			}
		} catch (error) {
			toast.error("Failed to update profile");
		} finally {
			setSaving(false);
		}
	};

	const handleAvatarClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file || !user) return;

		setUploading(true);
		try {
			const formData = new FormData();
			formData.append("file", file);

			const response = await axios.post("/api/upload", formData, {
				headers: { "Content-Type": "multipart/form-data" },
			});

			if (response.data.url) {
				setFormData((prev) => ({ ...prev, avatar: response.data.url }));
				toast.success("Avatar uploaded successfully");
			}
		} catch (error) {
			toast.error("Failed to upload avatar");
		} finally {
			setUploading(false);
		}
	};

	const getPlanBadgeColor = (plan?: string) => {
		switch (plan) {
			case "premium":
				return "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0";
			case "daily":
				return "bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0";
			default:
				return "bg-slate-100 text-slate-700 border-slate-200";
		}
	};

	if (loading) {
		return (
			<div className="flex min-h-[calc(100vh-85px)] bg-gradient-to-br from-slate-50 via-white to-slate-100">
				<AdminSidebar role="user" />
				<main className="flex-1 md:ml-64 flex items-center justify-center">
					<Loader2 className="animate-spin w-12 h-12 text-emerald-500" />
				</main>
			</div>
		);
	}

	return (
		<div className="flex min-h-[calc(100vh-85px)] bg-gradient-to-br from-slate-50 via-white to-slate-100">
			<AdminSidebar role="user" />

			<main className="flex-1 md:ml-64 p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
				{/* Header */}
				<div className="mb-8 mt-5 md:mt-0">
					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
						<div>
							<h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent mb-2">
								My Profile
							</h1>
							<p className="text-slate-600 text-sm md:text-base">
								Manage your personal information and account settings
							</p>
						</div>
						<Button
							onClick={() => setIsEditing(!isEditing)}
							className={`gap-2 ${
								isEditing
									? "bg-slate-100 text-slate-700 hover:bg-slate-200"
									: "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
							}`}
						>
							{isEditing ? (
								<>
									<AlertCircle size={18} />
									Cancel
								</>
							) : (
								<>
									<Edit3 size={18} />
									Edit Profile
								</>
							)}
						</Button>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Left Column - Profile Card */}
					<div className="lg:col-span-1 space-y-6">
						{/* Profile Card */}
						<Card className="bg-white border-0 shadow-xl overflow-hidden p-0">
							<div className="h-32 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
							<CardContent className="p-6 -mt-16">
								<div className="flex flex-col items-center">
									<div
										className="relative w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden cursor-pointer group"
										onClick={handleAvatarClick}
									>
										{formData.avatar ? (
											<Image
												src={formData.avatar}
												alt={formData.name}
												fill
												className="object-cover"
											/>
										) : (
											<div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
												<span className="text-4xl font-bold text-white">
													{formData.name?.charAt(0).toUpperCase() || "U"}
												</span>
											</div>
										)}
										<div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
											{uploading ? (
												<Loader2 className="animate-spin text-white" size={24} />
											) : (
												<Camera className="text-white" size={24} />
											)}
										</div>
									</div>
									<input
										ref={fileInputRef}
										type="file"
										accept="image/*"
										className="hidden"
										onChange={handleFileChange}
									/>

									<h2 className="mt-4 text-2xl font-bold text-slate-900">{formData.name}</h2>
									<p className="text-slate-500 text-sm">{formData.email}</p>

									<div className="mt-4 flex items-center gap-2">
										<Badge className={getPlanBadgeColor(user?.currentPlan)}>
											{(user?.currentPlan ? user.currentPlan.charAt(0).toUpperCase() + user.currentPlan.slice(1) : "Free")} Plan
										</Badge>
										{user?.isEmailVerified && (
											<Badge variant="outline" className="border-emerald-200 text-emerald-600 bg-emerald-50">
												<CheckCircle size={12} className="mr-1" />
												Verified
											</Badge>
										)}
									</div>
								</div>

								<Separator className="my-6" />

								<div className="space-y-4">
									<div className="flex items-center gap-3 text-sm">
										<div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
											<Calendar className="text-emerald-600" size={20} />
										</div>
										<div>
											<p className="text-slate-500">Member Since</p>
											<p className="font-medium text-slate-900">
												{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
											</p>
										</div>
									</div>

									<div className="flex items-center gap-3 text-sm">
										<div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
											<Star className="text-amber-600" size={20} />
										</div>
										<div>
											<p className="text-slate-500">Rating</p>
											<p className="font-medium text-slate-900">
												{(user as any)?.rating?.toFixed(1) || "0.0"} / 5.0
											</p>
										</div>
									</div>

									<div className="flex items-center gap-3 text-sm">
										<div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
											<Package className="text-blue-600" size={20} />
										</div>
										<div>
											<p className="text-slate-500">Total Listings</p>
											<p className="font-medium text-slate-900">{user?.totalListings || 0}</p>
										</div>
									</div>

									<div className="flex items-center gap-3 text-sm">
										<div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
											<DollarSign className="text-purple-600" size={20} />
										</div>
										<div>
											<p className="text-slate-500">Total Sales</p>
											<p className="font-medium text-slate-900">${(user as any)?.totalSales?.toLocaleString() || 0}</p>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Right Column - Edit Form */}
					<div className="lg:col-span-2">
						<Card className="bg-white border-0 shadow-xl">
							<CardHeader>
								<CardTitle className="text-xl font-bold text-slate-900">Profile Information</CardTitle>
								<CardDescription>Update your personal details and public profile</CardDescription>
							</CardHeader>
							<CardContent>
								<form onSubmit={handleSubmit} className="space-y-6">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										{/* Full Name */}
										<div className="space-y-2">
											<Label htmlFor="name" className="text-slate-700 font-medium">
												< User size={16} className="inline mr-2 text-emerald-500" />
												Full Name
											</Label>
											<Input
												id="name"
												name="name"
												value={formData.name}
												onChange={handleChange}
												disabled={!isEditing}
												className="h-11 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
												placeholder="Enter your full name"
											/>
										</div>

										{/* Email */}
										<div className="space-y-2">
											<Label htmlFor="email" className="text-slate-700 font-medium">
												<Mail size={16} className="inline mr-2 text-emerald-500" />
												Email Address
											</Label>
											<Input
												id="email"
												name="email"
												type="email"
												value={formData.email}
												disabled
												className="h-11 border-slate-200 bg-slate-50"
											/>
											<p className="text-xs text-slate-500">Email cannot be changed</p>
										</div>

										{/* Phone */}
										<div className="space-y-2">
											<Label htmlFor="phone" className="text-slate-700 font-medium">
												<Phone size={16} className="inline mr-2 text-emerald-500" />
												Phone Number
											</Label>
											<Input
												id="phone"
												name="phone"
												value={formData.phone}
												onChange={handleChange}
												disabled={!isEditing}
												className="h-11 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
												placeholder="Enter your phone number"
											/>
										</div>

										{/* Company */}
										<div className="space-y-2">
											<Label htmlFor="company" className="text-slate-700 font-medium">
												<Briefcase size={16} className="inline mr-2 text-emerald-500" />
												Company
											</Label>
											<Input
												id="company"
												name="company"
												value={formData.company}
												onChange={handleChange}
												disabled={!isEditing}
												className="h-11 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
												placeholder="Enter your company name"
											/>
										</div>

										{/* Location */}
										<div className="space-y-2">
											<Label htmlFor="location" className="text-slate-700 font-medium">
												<MapPin size={16} className="inline mr-2 text-emerald-500" />
												Location
											</Label>
											<Input
												id="location"
												name="location"
												value={formData.location}
												onChange={handleChange}
												disabled={!isEditing}
												className="h-11 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
												placeholder="Enter your location"
											/>
										</div>

										{/* Role */}
										<div className="space-y-2">
											<Label htmlFor="role" className="text-slate-700 font-medium">
												<Shield size={16} className="inline mr-2 text-emerald-500" />
												Account Type
											</Label>
											<Input
												id="role"
												value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "User"}
												disabled
												className="h-11 border-slate-200 bg-slate-50 capitalize"
											/>
										</div>
									</div>

									{/* Bio */}
									<div className="space-y-2">
										<Label htmlFor="bio" className="text-slate-700 font-medium">
											Bio
										</Label>
										<Textarea
											id="bio"
											name="bio"
											value={formData.bio}
											onChange={handleChange}
											disabled={!isEditing}
											rows={4}
											className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 resize-none"
											placeholder="Tell us a little about yourself..."
										/>
									</div>

									{/* Save Button */}
									{isEditing && (
										<div className="flex justify-end pt-4">
											<Button
												type="submit"
												disabled={saving}
												className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white gap-2 h-11 px-6"
											>
												{saving ? (
													<>
														<Loader2 size={18} className="animate-spin" />
														Saving...
													</>
												) : (
													<>
														<Save size={18} />
														Save Changes
													</>
												)}
											</Button>
										</div>
									)}
								</form>
							</CardContent>
						</Card>
					</div>
				</div>
			</main>
		</div>
	);
}
