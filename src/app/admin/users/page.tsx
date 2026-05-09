"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Mail,
	TrendingUp,
	Phone,
	Users,
	CheckCircle,
	XCircle,
	Search,
	Edit,
	Trash2,
	Shield,
	Ban,
	Loader2,
	AlertCircle,
	Calendar,
	Star,
	X,
	Save,
	Copy,
	MapPin,
	Zap,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import AdminSidebar from "@/components/admin-sidebar";
import { userContext } from "@/context/userContext";
import { toast } from "sonner";
import { userService } from "@/services/userService";

export default function AdminUsersPage() {
	const { user } = userContext();
	const [users, setUsers] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterStatus, setFilterStatus] = useState("all");
	const [currentPage, setCurrentPage] = useState(1);
	const [paginationData, setPaginationData] = useState<any>(null);
	const [statsData, setStatsData] = useState<any>(null);
	const [editingUser, setEditingUser] = useState<any>(null);

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				if (!user) return;
				setLoading(true);
                const allUsers = await userService.getAllUsers();
                let filtered = allUsers;
                if (searchTerm) {
                    const term = searchTerm.toLowerCase();
                    filtered = filtered.filter(u => 
                        u.name?.toLowerCase().includes(term) || 
                        u.email?.toLowerCase().includes(term) || 
                        u.phone?.toLowerCase().includes(term)
                    );
                }
                
                if (filterStatus === "premium") {
                    filtered = filtered.filter(u => u.isPremium);
                } else if (filterStatus === "verified") {
                    filtered = filtered.filter(u => u.verified);
                } else if (filterStatus === "blocked") {
                    filtered = filtered.filter(u => u.isBlocked);
                }

                const stats = {
                    totalUsers: allUsers.length,
                    verifiedUsers: allUsers.filter(u => u.verified).length,
                    premiumUsers: allUsers.filter(u => u.isPremium).length,
                    blockedUsers: allUsers.filter(u => u.isBlocked).length,
                    totalActiveListings: 0, // Would need listingService for this
                    totalPlatformSales: 0 // Would need orderService for this
                };

                // 3. Paginate
                const limit = 15;
                const total = filtered.length;
                const totalPages = Math.ceil(total / limit);
                const offset = (currentPage - 1) * limit;
                const paginatedUsers = filtered.slice(offset, offset + limit);

				setUsers(paginatedUsers);
				setPaginationData({
                    totalUsers: total,
                    totalPages: totalPages,
                    currentPage: currentPage
                });
				setStatsData(stats);
			} catch (error) {
				console.error("Failed to fetch users:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchUsers();
	}, [user, currentPage, searchTerm, filterStatus]);

	// Reset to page 1 when search or filter changes
	useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm, filterStatus]);

	// Use users directly as they are already filtered/searched on server
	const filteredUsers = users;

	const [editFormData, setEditFormData] = useState({
		name: "",
		email: "",
		phone: "",
		bio: "",
		location: "",
		company: "",
	});

	const handleEditUser = (targetUser: any) => {
		setEditingUser(targetUser);
		setEditFormData({
			name: targetUser.name || "",
			email: targetUser.email || "",
			phone: targetUser.phone || "",
			bio: targetUser.bio || "",
			location: targetUser.location || "",
			company: targetUser.company || "",
		});
	};

	const handleSaveEdit = async () => {
		if (!user || !editingUser) return;
		try {
            await userService.updateUserProfile(editingUser._id, editFormData);
            setUsers((prev: any) =>
                prev.map((u: any) =>
                    u._id === editingUser._id
                        ? { ...u, ...editFormData }
                        : u
                )
            );
            setEditingUser(null);
            toast.success("User updated successfully");
		} catch (err) {
			console.error("Failed to update user:", err);
			toast.error("Failed to update user");
		}
	};

	// HANDLERS FOR ACTION BUTTONS
	const handleVerifyUser = async (targetUser: any, verify: boolean) => {
		if (!user) return;
		try {
            await userService.updateUserProfile(targetUser._id, { verified: verify });
            setUsers((prev: any) =>
                prev.map((u: any) =>
                    u._id === targetUser._id
                        ? { ...u, verified: verify }
                        : u
                )
            );
            toast.success(
                verify
                    ? "User verified successfully"
                    : "User unverified successfully"
            );
		} catch (err) {
			toast.error("Failed to update verification status");
		}
	};

	const handleBlockUser = async (targetUser: any, block: boolean) => {
		if (!user) return;
		try {
            await userService.updateUserProfile(targetUser._id, { isBlocked: block });
            setUsers((prev: any) =>
                prev.map((u: any) =>
                    u._id === targetUser._id
                        ? { ...u, isBlocked: block }
                        : u
                )
            );
            toast.success(
                block
                    ? "User blocked successfully"
                    : "User unblocked successfully"
            );
		} catch (err) {
			toast.error(
				block ? "Failed to block user" : "Failed to unblock user"
			);
		}
	};

	const handleDeleteUser = async (targetUser: any) => {
		if (!user) return;
		if (
			!confirm(
				"Are you sure you want to delete this user? This cannot be undone."
			)
		)
			return;
		try {
            // Note: In a real app, you might want to use Firebase Admin to delete the Auth account too.
            // But here we just delete the profile.
            const { ref, remove } = await import("firebase/database");
            const { db } = await import("@/lib/firebase");
            await remove(ref(db, `users/${targetUser._id}`));
            
            setUsers((prev: any) =>
                prev.filter((u: any) => u._id !== targetUser._id)
            );
            toast.success("User deleted successfully");
		} catch (err) {
			toast.error("Failed to delete user");
		}
	};

	const blockedUsers = statsData?.blockedUsers || 0;
	const verifiedUsers = statsData?.verifiedUsers || 0;
	const premiumUsers = statsData?.premiumUsers || 0;
	const totalUsers = statsData?.totalUsers || 0;
	const totalActiveListings = statsData?.totalActiveListings || 0;
	const totalPlatformSales = statsData?.totalPlatformSales || 0;

	return (
		<div className='flex min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100'>
			<AdminSidebar />

			{/* Main Content */}
			<main className='flex-1 md:ml-64 p-4 md:p-6 lg:p-8'>
				{/* Header */}
				<div className='mb-8 mt-16 md:mt-0'>
					<div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6'>
						<div>
							<h1 className='text-3xl md:text-4xl font-bold bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent mb-2'>
								Manage Users
							</h1>
							<p className='text-slate-600 text-sm md:text-base'>
								View and manage all registered users
							</p>
						</div>

						{/* Search Bar */}
						<div className='relative w-full md:w-80'>
							<Search
								className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400'
								size={20}
							/>
							<Input
								type='text'
								placeholder='Search by name, email, or phone...'
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className='pl-10 pr-4 h-11 bg-white border-slate-200 focus:border-sky-500 focus:ring-sky-500/20 shadow-sm'
							/>
						</div>
					</div>
				</div>

				{/* Dashboard Stats */}
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8'>
					<Card className='bg-linear-to-br from-slate-900 to-slate-800 border-none shadow-xl relative overflow-hidden group'>
						<div className='absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors' />
						<CardContent className='p-6'>
							<div className='flex items-center justify-between relative z-10'>
								<div className='flex-1'>
									<p className='text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1'>
										Total Users
									</p>
									<p className='text-3xl font-black text-white mb-1'>
										{totalUsers}
									</p>
									<div className='flex items-center gap-1.5 text-xs text-slate-400 font-medium'>
										<Users size={12} />
										<span>Lifetime Registrations</span>
									</div>
								</div>
								<div className='w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform'>
									<Users size={24} className='text-white' />
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className='bg-white border-slate-200 shadow-xl shadow-slate-200/20 hover:shadow-slate-300/30 transition-all duration-300 relative overflow-hidden group'>
						<CardContent className='p-6'>
							<div className='flex items-center justify-between'>
								<div className='flex-1'>
									<p className='text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1'>
										Verified Accounts
									</p>
									<p className='text-3xl font-black text-emerald-600 mb-1'>
										{verifiedUsers}
									</p>
									<div className='flex items-center gap-1.5 text-xs text-emerald-600 font-medium'>
										<CheckCircle size={12} />
										<span>Trusted Users</span>
									</div>
								</div>
								<div className='w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-500 transition-all duration-300'>
									<CheckCircle size={24} className='text-emerald-500 group-hover:text-white transition-colors' />
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className='bg-white border-slate-200 shadow-xl shadow-slate-200/20 hover:shadow-slate-300/30 transition-all duration-300 relative overflow-hidden group'>
						<CardContent className='p-6'>
							<div className='flex items-center justify-between'>
								<div className='flex-1'>
									<p className='text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1'>
										Premium Plans
									</p>
									<p className='text-3xl font-black text-amber-600 mb-1'>
										{premiumUsers}
									</p>
									<div className='flex items-center gap-1.5 text-xs text-amber-600 font-medium'>
										<Zap size={12} className='fill-current' />
										<span>Paid Subscriptions</span>
									</div>
								</div>
								<div className='w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center group-hover:bg-amber-500 transition-all duration-300'>
									<Zap size={24} className='text-amber-500 group-hover:text-white transition-colors fill-current' />
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className='bg-white border-slate-200 shadow-xl shadow-slate-200/20 hover:shadow-slate-300/30 transition-all duration-300 relative overflow-hidden group'>
						<CardContent className='p-6'>
							<div className='flex items-center justify-between'>
								<div className='flex-1'>
									<p className='text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1'>
										Blocked Users
									</p>
									<p className='text-3xl font-black text-rose-600 mb-1'>
										{blockedUsers}
									</p>
									<div className='flex items-center gap-1.5 text-xs text-rose-600 font-medium'>
										<Ban size={12} />
										<span>Restricted Access</span>
									</div>
								</div>
								<div className='w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center group-hover:bg-rose-500 transition-all duration-300'>
									<Ban size={24} className='text-rose-500 group-hover:text-white transition-colors' />
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Filters Row */}
				<div className='flex flex-wrap gap-2 mb-6'>
					{[
						{ id: "all", label: "All Users", icon: Users },
						{ id: "premium", label: "Premium", icon: Zap },
						{ id: "verified", label: "Verified", icon: CheckCircle },
						{ id: "blocked", label: "Blocked", icon: Ban },
					].map((filter) => (
						<button
							key={filter.id}
							onClick={() => setFilterStatus(filter.id)}
							className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
								filterStatus === filter.id
									? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20"
									: "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
							}`}>
							<filter.icon size={14} className={filter.id === "premium" && filterStatus === "premium" ? "fill-current" : ""} />
							{filter.label}
						</button>
					))}
				</div>

				{/* Users Table */}
				<div className='overflow-x-auto'>
					<Card className='bg-white border border-slate-200 shadow-lg p-0'>
						<CardContent className='p-0'>
							{loading ? (
								<div className='p-16 text-center'>
									<Loader2
										className='animate-spin mx-auto mb-4 text-sky-500'
										size={32}
									/>
									<p className='text-slate-600 font-medium'>
										Loading users...
									</p>
								</div>
							) : filteredUsers.length > 0 ? (
								<>
									<div className='w-[360px] md:w-full overflow-x-auto'>
									<table className='w-full'>
										<thead>
											<tr className='border-b border-slate-200 bg-linear-to-r from-slate-50 to-slate-100/50'>
												<th className='px-6 py-4 text-left text-sm font-semibold text-slate-700'>
													User Info
												</th>
												<th className='px-6 py-4 text-left text-sm font-semibold text-slate-700'>
													Account
												</th>
												<th className='px-6 py-4 text-left text-sm font-semibold text-slate-700'>
													Activity
												</th>
												<th className='px-6 py-4 text-left text-sm font-semibold text-slate-700'>
													Blogs
												</th>
												<th className='px-6 py-4 text-left text-sm font-semibold text-slate-700'>
													Business
												</th>
												<th className='px-6 py-4 text-left text-sm font-semibold text-slate-700'>
													Joined
												</th>
												<th className='px-6 py-4 text-left text-sm font-semibold text-slate-700'>
													Actions
												</th>
											</tr>
										</thead>
										<tbody>
											{filteredUsers.map(
												(userItem: any) => (
													<tr
														key={userItem._id}
														className='border-b border-slate-100 hover:bg-slate-50/50 transition-colors group'>
														<td className='px-6 py-4'>
															<div className='flex items-center gap-4'>
																<div className='relative shrink-0'>
																	<div className='w-14 h-14 rounded-2xl bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-bold text-xl shadow-inner border border-white/50 overflow-hidden'>
																		{userItem.avatar ? (
																			<img
																				src={
																					userItem.avatar
																				}
																				alt={
																					userItem.name
																				}
																				className='w-full h-full object-cover'
																			/>
																		) : (
																			userItem.name
																				?.charAt(
																					0
																				)
																				.toUpperCase() ||
																			"U"
																		)}
																	</div>
																	{userItem.role ===
																		"admin" && (
																		<div className='absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-lg border-2 border-white flex items-center justify-center shadow-lg'>
																			<Shield
																				size={
																					12
																				}
																				className='text-white'
																			/>
																		</div>
																	)}
																</div>
																<div className='min-w-0'>
																	<p className='text-sm font-bold text-slate-900 truncate hover:text-sky-600 transition-colors'>
																		{userItem.name ||
																			"Unknown User"}
																	</p>
																	<div className='flex items-center gap-1.5 mt-1'>
																		<button
																			onClick={() => {
																				navigator.clipboard.writeText(
																					userItem.email
																				);
																				toast.success(
																					"Email copied!"
																				);
																			}}
																			className='group/copy flex items-center gap-1.5 text-xs text-slate-500 hover:text-sky-600 transition-colors'>
																			<Mail
																				size={
																					12
																				}
																			/>
																			<span className='truncate max-w-[120px]'>
																				{
																					userItem.email
																				}
																			</span>
																			<Copy
																				size={
																					10
																				}
																				className='opacity-0 group-hover/copy:opacity-100 transition-opacity'
																			/>
																		</button>
																	</div>
																	{userItem.phone && (
																		<div className='flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400'>
																			<Phone
																				size={
																					10
																				}
																			/>
																			<span>
																				{
																					userItem.phone
																				}
																			</span>
																		</div>
																	)}
																</div>
															</div>
														</td>
														<td className='px-6 py-4'>
															<div className='space-y-2'>
																{/* Status Indicators */}
																<div className='flex flex-wrap gap-1.5'>
																	{userItem.isBlocked ? (
																		<span className='inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-700 rounded-md text-[10px] font-bold border border-rose-100'>
																			<Ban size={10} />
																			BLOCKED
																		</span>
																	) : (
																		<span className='inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[10px] font-bold border border-emerald-100'>
																			<CheckCircle size={10} />
																			ACTIVE
																		</span>
																	)}
																	{userItem.verified && (
																		<span className='inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-bold border border-blue-100'>
																			<Shield size={10} />
																			VERIFIED
																		</span>
																	)}
																</div>
															</div>
														</td>
														<td className='px-6 py-4'>
															<div className='flex gap-4'>
																<div className='text-center'>
																	<p className='text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-1'>
																		Listings
																	</p>
																	<div className='inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 text-slate-900 font-bold group-hover:bg-white group-hover:shadow-md transition-all'>
																		{userItem
																			.listings
																			?.length ||
																			0}
																	</div>
																</div>
																<div className='text-center'>
																	<p className='text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-1'>
																		Orders
																	</p>
																	<div className='inline-flex items-center justify-center w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 text-sky-700 font-bold group-hover:bg-white group-hover:shadow-md transition-all'>
																		{userItem.orderCount ||
																			0}
																	</div>
																</div>
															</div>
														</td>
														<td className='px-6 py-4'>
															<div className='text-center'>
																<p className='text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-1'>
																	Blogs
																</p>
																<div className='inline-flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold group-hover:bg-white group-hover:shadow-md transition-all'>
																	{userItem.blogCount || 0}
																</div>
															</div>
														</td>
														<td className='px-6 py-4'>
															<div className='space-y-3'>
																{/* Sales */}
																<div>
																	<div className='flex items-center gap-1.5 text-xs text-slate-500 mb-1'>
																		<TrendingUp
																			size={
																				12
																			}
																			className='text-emerald-500'
																		/>
																		<span>
																			Total
																			Sales
																		</span>
																	</div>
																	<p className='text-sm font-bold text-slate-900'>
																		$
																		{(
																			userItem.totalSales ||
																			0
																		).toLocaleString(
																			"en-IN"
																		)}
																	</p>
																</div>

																{/* Reputation */}
																<div className='flex items-center gap-2'>
																	<div className='flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100'>
																		<Star
																			size={
																				10
																			}
																			className='text-amber-500 fill-amber-500'
																		/>
																		<span className='text-[10px] font-bold text-amber-700'>
																			{(
																				userItem.rating ||
																				0
																			).toFixed(
																				1
																			)}
																		</span>
																	</div>
																	<span className='text-[10px] text-slate-400'>
																		(
																		{userItem
																			.reviews
																			?.length ||
																			0}{" "}
																		reviews)
																	</span>
																</div>
															</div>
														</td>
														<td className='px-6 py-4'>
															<div className='flex flex-col gap-1'>
																<div className='flex items-center gap-1.5 text-xs text-slate-700 font-medium'>
																	<Calendar
																		size={
																			12
																		}
																		className='text-slate-400'
																	/>
																	<span>
																		{userItem.createdAt
																			? new Date(
																					userItem.createdAt
																			  ).toLocaleDateString(
																					"en-IN",
																					{
																						day: "2-digit",
																						month: "short",
																						year: "numeric",
																					}
																			  )
																			: "N/A"}
																	</span>
																</div>
																{userItem.location && (
																	<div className='flex items-center gap-1.5 text-[10px] text-slate-400'>
																		<MapPin
																			size={
																				10
																			}
																		/>
																		<span className='truncate max-w-[100px]'>
																			{
																				userItem.location
																			}
																		</span>
																	</div>
																)}
															</div>
														</td>
														<td className='px-6 py-4'>
															<div className='flex flex-wrap gap-1.5'>
																<Button
																	size='sm'
																	variant='outline'
																	className='border-sky-200 text-sky-700 hover:bg-sky-50 text-xs px-3 cursor-pointer gap-1.5'
																	onClick={() =>
																		handleEditUser(
																			userItem
																		)
																	}>
																	<Edit
																		size={
																			14
																		}
																	/>
																	Edit
																</Button>
																{userItem.verified ? (
																	<Button
																		size='sm'
																		variant='outline'
																		className='border-amber-200 text-amber-700 hover:bg-amber-50 text-xs px-3 cursor-pointer gap-1.5'
																		onClick={() =>
																			handleVerifyUser(
																				userItem,
																				false
																			)
																		}
																		disabled={
																			userItem.isBlocked
																		}>
																		<XCircle
																			size={
																				14
																			}
																		/>
																		Unverify
																	</Button>
																) : (
																	<Button
																		size='sm'
																		variant='outline'
																		className='border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-xs px-3 cursor-pointer gap-1.5'
																		onClick={() =>
																			handleVerifyUser(
																				userItem,
																				true
																			)
																		}
																		disabled={
																			userItem.isBlocked
																		}>
																		<CheckCircle
																			size={
																				14
																			}
																		/>
																		Verify
																	</Button>
																)}
																<Button
																	size='sm'
																	variant='outline'
																	className={`cursor-pointer text-xs px-3 gap-1.5 ${
																		userItem.isBlocked
																			? "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
																			: "border-rose-200 text-rose-700 hover:bg-rose-50"
																	}`}
																	onClick={() =>
																		handleBlockUser(
																			userItem,
																			!userItem.isBlocked
																		)
																	}>
																	<Ban
																		size={
																			14
																		}
																	/>
																	{userItem.isBlocked
																		? "Unblock"
																		: "Block"}
																</Button>
																<Button
																	size='sm'
																	variant='destructive'
																	className='text-xs px-3 bg-linear-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 cursor-pointer border-rose-500 hover:border-rose-600 text-white gap-1.5 shadow-lg shadow-rose-500/20'
																	onClick={() =>
																		handleDeleteUser(
																			userItem
																		)
																	}
																	disabled={
																		userItem.isBlocked
																	}>
																	<Trash2
																		size={
																			14
																		}
																	/>
																	Delete
																</Button>
															</div>
														</td>
													</tr>
												)
											)}
										</tbody>
									</table>
								</div>
								
								{/* Pagination Controls */}
								{paginationData && paginationData.totalPages > 1 && (
									<div className='px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4'>
										<div className='text-xs font-medium text-slate-500'>
											Showing <span className='text-slate-900 font-bold'>{(currentPage - 1) * 15 + 1}</span> to <span className='text-slate-900 font-bold'>{Math.min(currentPage * 15, paginationData.totalUsers)}</span> of <span className='text-slate-900 font-bold'>{paginationData.totalUsers}</span> users
										</div>
										<div className='flex items-center gap-2'>
											<Button
												variant='outline'
												size='sm'
												onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
												disabled={currentPage === 1}
												className='h-9 w-9 p-0 rounded-lg border-slate-200 text-slate-600 disabled:opacity-50 transition-all hover:bg-white hover:shadow-md'
											>
												<ChevronLeft size={16} />
											</Button>
											
											<div className='flex items-center gap-1'>
												{Array.from({ length: Math.min(5, paginationData.totalPages) }, (_, i) => {
													let pageNum;
													if (paginationData.totalPages <= 5) {
														pageNum = i + 1;
													} else {
														if (currentPage <= 3) pageNum = i + 1;
														else if (currentPage >= paginationData.totalPages - 2) pageNum = paginationData.totalPages - 4 + i;
														else pageNum = currentPage - 2 + i;
													}
													
													return (
														<button
															key={pageNum}
															onClick={() => setCurrentPage(pageNum)}
															className={`h-9 w-9 rounded-lg text-xs font-bold transition-all ${
																currentPage === pageNum
																	? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
																	: "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
															}`}
														>
															{pageNum}
														</button>
													);
												})}
											</div>

											<Button
												variant='outline'
												size='sm'
												onClick={() => setCurrentPage(prev => Math.min(paginationData.totalPages, prev + 1))}
												disabled={currentPage === paginationData.totalPages}
												className='h-9 w-9 p-0 rounded-lg border-slate-200 text-slate-600 disabled:opacity-50 transition-all hover:bg-white hover:shadow-md'
											>
												<ChevronRight size={16} />
											</Button>
										</div>
									</div>
								)}
								</>
							) : (
								<div className='p-16 text-center'>
									<AlertCircle
										className='mx-auto mb-4 text-slate-400'
										size={48}
									/>
									<p className='text-slate-600 font-medium text-lg mb-2'>
										No users found
									</p>
									{searchTerm && (
										<p className='text-slate-500 text-sm'>
											Try adjusting your search criteria
										</p>
									)}
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Edit User Modal */}
				{editingUser && (
					<div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
						<Card className='bg-white border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
							<CardContent className='p-6'>
								<div className='flex items-center justify-between mb-6'>
									<div>
										<h2 className='text-2xl font-bold text-slate-900'>
											Edit User
										</h2>
										<p className='text-sm text-slate-600 mt-1'>
											Update user information
										</p>
									</div>
									<Button
										variant='ghost'
										size='icon'
										onClick={() => setEditingUser(null)}
										className='hover:bg-slate-100'>
										<X size={20} />
									</Button>
								</div>

								<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
									<div className='space-y-4'>
										<div>
											<label className='block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1'>
												Full Name
											</label>
											<Input
												type='text'
												value={editFormData.name}
												onChange={(e) =>
													setEditFormData({
														...editFormData,
														name: e.target.value,
													})
												}
												className='h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all'
												placeholder='Enter name'
											/>
										</div>

										<div>
											<label className='block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1'>
												Email Address
											</label>
											<Input
												type='email'
												value={editFormData.email}
												onChange={(e) =>
													setEditFormData({
														...editFormData,
														email: e.target.value,
													})
												}
												className='h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all'
												placeholder='Enter email'
											/>
										</div>

										<div>
											<label className='block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1'>
												Phone Number
											</label>
											<Input
												type='tel'
												value={editFormData.phone}
												onChange={(e) =>
													setEditFormData({
														...editFormData,
														phone: e.target.value,
													})
												}
												className='h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all'
												placeholder='Enter phone number'
											/>
										</div>
									</div>

									<div className='space-y-4'>
										<div>
											<label className='block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1'>
												Location
											</label>
											<Input
												type='text'
												value={editFormData.location}
												onChange={(e) =>
													setEditFormData({
														...editFormData,
														location: e.target.value,
													})
												}
												className='h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all'
												placeholder='e.g. Mumbai, India'
											/>
										</div>

										<div>
											<label className='block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1'>
												Company / Business
											</label>
											<Input
												type='text'
												value={editFormData.company}
												onChange={(e) =>
													setEditFormData({
														...editFormData,
														company: e.target.value,
													})
												}
												className='h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all'
												placeholder='Enter company name'
											/>
										</div>
										<div className='pt-2'>
											<p className='text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-dashed border-slate-200'>
												<Shield
													size={14}
													className='inline mr-2 text-sky-500'
												/>
												These details are visible to
												other users on the platform.
											</p>
										</div>
									</div>
								</div>

								<div className='mt-6'>
									<label className='block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1'>
										Bio / Description
									</label>
									<textarea
										value={editFormData.bio}
										onChange={(e) =>
											setEditFormData({
												...editFormData,
												bio: e.target.value,
											})
										}
										className='w-full min-h-[120px] px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:bg-white transition-all resize-none text-sm'
										placeholder='Tell us about the user...'
									/>
								</div>

								<div className='flex gap-3 mt-8'>
									<Button
										onClick={handleSaveEdit}
										className='flex-1 h-12 bg-linear-to-r from-slate-900 to-slate-800 hover:from-sky-600 hover:to-blue-600 text-white font-bold rounded-xl shadow-xl shadow-slate-900/10 transition-all duration-300 transform active:scale-[0.98]'>
										<Save size={18} className='mr-2' />
										Save Changes
									</Button>
									<Button
										variant='outline'
										onClick={() => setEditingUser(null)}
										className='h-12 px-6 border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-all'>
										Cancel
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				)}
			</main>
		</div>
	);
}
