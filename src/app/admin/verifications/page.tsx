"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle, XCircle } from "lucide-react";
import AdminSidebar from "@/components/admin-sidebar";

export default function AdminVerificationsPage() {
	const [transactions, setTransactions] = useState([]);
	const [loading, setLoading] = useState(true);

	const fetchTransactions = async () => {
		try {
			const res = await fetch("/api/admin/verify-transaction");
			const data = await res.json();
			if (data.success) {
				setTransactions(data.transactions);
			}
		} catch (error) {
			console.error("Failed to fetch transactions:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchTransactions();
	}, []);

	const handleVerify = async (transactionId: string, status: string) => {
		try {
			const res = await fetch("/api/admin/verify-transaction", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ transactionId, status }),
			});
			const data = await res.json();
			if (data.success) {
				toast.success(`Transaction ${status} successfully`);
				fetchTransactions();
			} else {
				toast.error(data.message || "Failed to verify transaction");
			}
		} catch (error) {
			toast.error("An error occurred");
		}
	};

	// if (loading)
	// 	return (
	// 		<div className='flex justify-center p-8'>
	// 			<Loader2 className='animate-spin' />
	// 		</div>
	// 	);

	return (
		<div className='flex min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100'>
			<AdminSidebar />
			<div className='flex-1 md:ml-64 p-4 md:p-6 lg:p-8'>
				<h1 className='text-3xl font-bold text-slate-900'>
					Payment Verifications
				</h1>

				<div className='grid gap-4 mt-3'>
					{transactions.map((tx: any) => (
						<Card key={tx._id} className='overflow-hidden'>
							<CardContent className='p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
								<div>
									<h3 className='font-semibold text-lg'>
										Plan: {tx.plan.toUpperCase()}
									</h3>
									<div className='text-sm text-slate-500 space-y-1'>
										<p>
											User: {tx.user?.name} (
											{tx.user?.email})
										</p>
										<p>
											Amount: {tx.amount} {tx.currency}
										</p>
										<p>Method: {tx.paymentMethod}</p>
										<p>
											Transaction ID:{" "}
											<span className='font-mono bg-slate-100 px-1 rounded'>
												{tx.transactionId}
											</span>
										</p>
										<p>
											Date:{" "}
											{new Date(
												tx.createdAt
											).toLocaleDateString()}
										</p>
									</div>
								</div>

								<div className='flex items-center gap-4'>
									<div
										className={`px-3 py-1 rounded-full text-sm font-medium ${
											tx.status === "approved"
												? "bg-green-100 text-green-800"
												: tx.status === "rejected"
												? "bg-red-100 text-red-800"
												: "bg-yellow-100 text-yellow-800"
										}`}>
										{tx.status.toUpperCase()}
									</div>

									{tx.status === "pending" && (
										<div className='flex gap-2'>
											<Button
												size='sm'
												className='bg-green-600 hover:bg-green-700'
												onClick={() =>
													handleVerify(
														tx._id,
														"approved"
													)
												}>
												<CheckCircle
													size={16}
													className='mr-1'
												/>{" "}
												Approve
											</Button>
											<Button
												size='sm'
												variant='destructive'
												onClick={() =>
													handleVerify(
														tx._id,
														"rejected"
													)
												}>
												<XCircle
													size={16}
													className='mr-1'
												/>{" "}
												Reject
											</Button>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					))}
					{transactions.length === 0 && (
						<p className='text-center text-slate-500 py-8'>
							No transactions found.
						</p>
					)}
				</div>
			</div>
		</div>
	);
}
