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
	DollarSign,
	FileText,
	Star,
	X,
	Save,
} from "lucide-react";
import AdminSidebar from "@/components/admin-sidebar";
import { userContext } from "@/context/userContext";
import { toast } from "sonner";
import axios from "axios";

export default function AdminUsersPage() {
	const { user } = userContext();
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [editingUser, setEditingUser] = useState<any>(null);

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				if (!user) {
					return;
				}
				const response = await fetch(
					`/api/admin/users?adminId=${user?._id}`
				);
				const data = await response.json();
				setUsers(data);
			} catch (error) {
				console.error("Failed to fetch users:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchUsers();
	}, [user]);

	const filteredUsers = users.filter(
		(user: any) =>
			user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const [editFormData, setEditFormData] = useState({
		name: "",
		email: "",
		phone: "",
		bio: "",
	});

	const handleEditUser = (targetUser: any) => {
		setEditingUser(targetUser);
		setEditFormData({
			name: targetUser.name || "",
			email: targetUser.email || "",
			phone: targetUser.phone || "",
			bio: targetUser.bio || "",
		});
	};

	const handleSaveEdit = async () => {
		if (!user || !editingUser) return;
		try {
			const response = await axios.put("/api/admin/users", {
				userId: editingUser._id,
				action: "update",
				adminId: user._id,
				updates: editFormData,
			});
			if (response.data.success) {
				setUsers((prev: any) =>
					prev.map((u: any) =>
						u._id === editingUser._id
							? { ...u, ...editFormData }
							: u
					)
				);
				setEditingUser(null);
				toast.success("User updated successfully");
			} else {
				toast.error("Failed to update user");
			}
		} catch (err) {
			console.error("Failed to update user:", err);
			toast.error("Failed to update user");
		}
	};

	// HANDLERS FOR ACTION BUTTONS
	const handleVerifyUser = async (targetUser: any, verify: boolean) => {
		if (!user) return;
		try {
			const response = await axios.put("/api/admin/users", {
				userId: targetUser._id,
				action: verify ? "verify" : "unverify",
				adminId: user._id,
			});
			if (response.data.success) {
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
			}
		} catch (err) {
			toast.error("Failed to update verification status");
		}
	};

	const handleBlockUser = async (targetUser: any, block: boolean) => {
		if (!user) return;
		try {
			const response = await axios.put("/api/admin/users", {
				userId: targetUser._id,
				action: block ? "block" : "unblock",
				adminId: user._id,
			});
			if (response.data.success) {
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
			}
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
			const response = await axios.delete(
				`/api/admin/users?adminId=${user._id}&userId=${targetUser._id}`
			);
			if (response.data.success) {
				setUsers((prev: any) =>
					prev.filter((u: any) => u._id !== targetUser._id)
				);
				toast.success("User deleted successfully");
			}
		} catch (err) {
			toast.error("Failed to delete user");
		}
	};

	const blockedUsers = users.filter((u: any) => u.isBlocked).length;
	const verifiedUsers = users.filter((u: any) => u.verified).length;
	const unverifiedUsers = users.filter((u: any) => !u.verified).length;

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

				{/* Stats */}
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8'>
					<Card className='bg-linear-to-br from-white to-blue-50/30 border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1'>
						<CardContent className='p-6'>
							<div className='flex items-center justify-between'>
								<div className='flex-1'>
									<p className='text-slate-600 text-sm font-medium mb-1'>
										Total Users
									</p>
									<p className='text-3xl font-bold text-slate-900 mb-1'>
										{users.length}
									</p>
									<div className='flex items-center gap-1 text-xs text-slate-500'>
										<Users size={12} />
										<span>Registered</span>
									</div>
								</div>
								<div className='w-14 h-14 rounded-xl bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20'>
									<Users size={24} className='text-white' />
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className='bg-linear-to-br from-white to-emerald-50/30 border border-emerald-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1'>
						<CardContent className='p-6'>
							<div className='flex items-center justify-between'>
								<div className='flex-1'>
									<p className='text-slate-600 text-sm font-medium mb-1'>
										Verified Users
									</p>
									<p className='text-3xl font-bold text-emerald-600 mb-1'>
										{verifiedUsers}
									</p>
									<div className='flex items-center gap-1 text-xs text-slate-500'>
										<CheckCircle size={12} />
										<span>Verified</span>
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
										Unverified Users
									</p>
									<p className='text-3xl font-bold text-amber-600 mb-1'>
										{unverifiedUsers}
									</p>
									<div className='flex items-center gap-1 text-xs text-slate-500'>
										<XCircle size={12} />
										<span>Pending</span>
									</div>
								</div>
								<div className='w-14 h-14 rounded-xl bg-linear-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20'>
									<XCircle size={24} className='text-white' />
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className='bg-linear-to-br from-white to-rose-50/30 border border-rose-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1'>
						<CardContent className='p-6'>
							<div className='flex items-center justify-between'>
								<div className='flex-1'>
									<p className='text-slate-600 text-sm font-medium mb-1'>
										Blocked Users
									</p>
									<p className='text-3xl font-bold text-rose-600 mb-1'>
										{blockedUsers}
									</p>
									<div className='flex items-center gap-1 text-xs text-slate-500'>
										<Ban size={12} />
										<span>Blocked</span>
									</div>
								</div>
								<div className='w-14 h-14 rounded-xl bg-linear-to-br from-rose-400 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/20'>
									<Ban size={24} className='text-white' />
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Users Table */}
				<div className='overflow-x-auto'>
					<Card className='bg-white border border-slate-200 shadow-lg'>
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
								<div className='w-[360px] md:w-full overflow-x-auto'>
									<table className='w-full'>
										<thead>
											<tr className='border-b border-slate-200 bg-linear-to-r from-slate-50 to-slate-100/50'>
												<th className='px-6 py-4 text-left text-sm font-semibold text-slate-700'>
													User
												</th>
												<th className='px-6 py-4 text-left text-sm font-semibold text-slate-700'>
													Contact
												</th>
												<th className='px-6 py-4 text-left text-sm font-semibold text-slate-700'>
													Stats
												</th>
												<th className='px-6 py-4 text-left text-sm font-semibold text-slate-700'>
													Status
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
															<div className='flex items-center gap-3'>
																<div className='relative'>
																	<div className='w-12 h-12 rounded-full bg-linear-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-md'>
																		{userItem.name
																			?.charAt(
																				0
																			)
																			.toUpperCase() ||
																			"U"}
																	</div>
																	{userItem.verified && (
																		<div className='absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm'>
																			<CheckCircle
																				size={
																					12
																				}
																				className='text-white'
																			/>
																		</div>
																	)}
																	{userItem.isBlocked && (
																		<div className='absolute -bottom-1 -right-1 w-5 h-5 bg-rose-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm'>
																			<Ban
																				size={
																					12
																				}
																				className='text-white'
																			/>
																		</div>
																	)}
																</div>
																<div>
																	<p className='text-sm font-bold text-slate-900'>
																		{userItem.name ||
																			"Unknown"}
																	</p>
																	{userItem.bio && (
																		<p className='text-xs text-slate-500 line-clamp-1 mt-0.5'>
																			{
																				userItem.bio
																			}
																		</p>
																	)}
																</div>
															</div>
														</td>
														<td className='px-6 py-4'>
															<div className='space-y-1.5'>
																<div className='flex items-center gap-2 text-sm text-slate-700'>
																	<Mail
																		size={
																			14
																		}
																		className='text-slate-400'
																	/>
																	<span className='text-xs'>
																		{
																			userItem.email
																		}
																	</span>
																</div>
																{userItem.phone && (
																	<div className='flex items-center gap-2 text-sm text-slate-700'>
																		<Phone
																			size={
																				14
																			}
																			className='text-slate-400'
																		/>
																		<span className='text-xs'>
																			{
																				userItem.phone
																			}
																		</span>
																	</div>
																)}
															</div>
														</td>
														<td className='px-6 py-4'>
															<div className='grid grid-cols-2 gap-3'>
																<div className='bg-slate-50 rounded-lg p-2 border border-slate-100'>
																	<p className='text-xs text-slate-500 mb-0.5'>
																		Listings
																	</p>
																	<p className='text-sm font-bold text-slate-900 flex items-center gap-1'>
																		<FileText
																			size={
																				12
																			}
																		/>
																		{userItem
																			.listings
																			?.length ||
																			0}
																	</p>
																</div>
																<div className='bg-slate-50 rounded-lg p-2 border border-slate-100'>
																	<p className='text-xs text-slate-500 mb-0.5'>
																		Rating
																	</p>
																	<p className='text-sm font-bold text-slate-900 flex items-center gap-1'>
																		<Star
																			size={
																				12
																			}
																			className='text-amber-500 fill-amber-500'
																		/>
																		{(
																			userItem.rating ||
																			0
																		).toFixed(
																			1
																		)}
																	</p>
																</div>
																{userItem.totalSales !==
																	undefined && (
																	<div className='bg-emerald-50 rounded-lg p-2 border border-emerald-100'>
																		<p className='text-xs text-slate-600 mb-0.5'>
																			Sales
																		</p>
																		<p className='text-sm font-bold text-emerald-700 flex items-center gap-1'>
																			<DollarSign
																				size={
																					12
																				}
																			/>
																			{userItem.totalSales ||
																				0}
																		</p>
																	</div>
																)}
															</div>
														</td>
														<td className='px-6 py-4'>
															<div className='flex flex-col gap-1.5'>
																{userItem.verified ? (
																	<span className='inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold w-fit border border-emerald-200'>
																		<CheckCircle
																			size={
																				12
																			}
																		/>
																		Verified
																	</span>
																) : (
																	<span className='inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold w-fit border border-amber-200'>
																		<XCircle
																			size={
																				12
																			}
																		/>
																		Unverified
																	</span>
																)}
																{userItem.isBlocked && (
																	<span className='inline-flex items-center gap-1 px-2 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-semibold w-fit border border-rose-200'>
																		<Ban
																			size={
																				12
																			}
																		/>
																		Blocked
																	</span>
																)}
																{userItem.role ===
																	"admin" && (
																	<span className='inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold w-fit border border-blue-200'>
																		<Shield
																			size={
																				12
																			}
																		/>
																		Admin
																	</span>
																)}
															</div>
														</td>
														<td className='px-6 py-4'>
															<div className='flex items-center gap-2 text-sm text-slate-700'>
																<Calendar
																	size={14}
																	className='text-slate-400'
																/>
																<span className='text-xs'>
																	{userItem.createdAt
																		? new Date(
																				userItem.createdAt
																		  ).toLocaleDateString()
																		: "N/A"}
																</span>
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

								<div className='space-y-4'>
									<div>
										<label className='block text-sm font-medium text-slate-700 mb-2'>
											Name
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
											className='w-full'
											placeholder='Enter name'
										/>
									</div>

									<div>
										<label className='block text-sm font-medium text-slate-700 mb-2'>
											Email
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
											className='w-full'
											placeholder='Enter email'
										/>
									</div>

									<div>
										<label className='block text-sm font-medium text-slate-700 mb-2'>
											Phone
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
											className='w-full'
											placeholder='Enter phone number'
										/>
									</div>

									<div>
										<label className='block text-sm font-medium text-slate-700 mb-2'>
											Bio
										</label>
										<textarea
											value={editFormData.bio}
											onChange={(e) =>
												setEditFormData({
													...editFormData,
													bio: e.target.value,
												})
											}
											className='w-full min-h-[100px] px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500'
											placeholder='Enter bio'
										/>
									</div>

									<div className='flex gap-3 pt-4'>
										<Button
											onClick={handleSaveEdit}
											className='flex-1 bg-linear-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white gap-2 shadow-lg shadow-sky-500/20'>
											<Save size={18} />
											Save Changes
										</Button>
										<Button
											variant='outline'
											onClick={() => setEditingUser(null)}
											className='flex-1 border-slate-200'>
											Cancel
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				)}
			</main>
		</div>
	);
}
