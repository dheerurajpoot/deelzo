"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import AdminSidebar from "@/components/admin-sidebar";

export default function AdminPlansPage() {
	const [plans, setPlans] = useState([]);
	const [loading, setLoading] = useState(true);

	const fetchPlans = async () => {
		try {
			const res = await fetch("/api/plans");
			const data = await res.json();
			if (data.success) {
				setPlans(data.plans);
			}
		} catch (error) {
			console.error("Failed to fetch plans:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchPlans();
	}, []);

	const handleUpdate = async (e: any, plan: any) => {
		e.preventDefault();
		try {
			const res = await fetch("/api/plans", {
				method: "POST", // Using POST for create/update as implemented
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(plan),
			});
			const data = await res.json();
			if (data.success) {
				toast.success(`Plan updated successfully`);
				fetchPlans();
			} else {
				toast.error(data.message || "Failed to update plan");
			}
		} catch (error) {
			toast.error("An error occurred");
		}
	};

	const handleChange = (index: number, field: string, value: any) => {
		const newPlans = [...plans];
		(newPlans[index] as any)[field] = value;
		setPlans(newPlans);
	};

	return (
		<div className='flex min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100'>
			<AdminSidebar />
			<div className='flex-1 md:ml-64 p-4 md:p-6 lg:p-8'>
				<h1 className='text-3xl font-bold text-slate-900'>
					Plan Management
				</h1>

				<div className='mt-3 grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
					{plans.map((plan: any, index) => (
						<Card
							key={plan._id || index}
							className='overflow-hidden'>
							<CardHeader>
								<CardTitle>{plan.name}</CardTitle>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div className='space-y-2'>
									<Label>Post Limit</Label>
									<Input
										type='number'
										value={plan.postLimit}
										onChange={(e) =>
											handleChange(
												index,
												"postLimit",
												parseInt(e.target.value)
											)
										}
									/>
								</div>
								<div className='space-y-2'>
									<Label>Price</Label>
									<Input
										type='number'
										value={plan.price}
										onChange={(e) =>
											handleChange(
												index,
												"price",
												parseInt(e.target.value)
											)
										}
									/>
								</div>
								<div className='space-y-2'>
									<Label>Description</Label>
									<Input
										value={plan.description}
										onChange={(e) =>
											handleChange(
												index,
												"description",
												e.target.value
											)
										}
									/>
								</div>
								<Button
									className='w-full'
									onClick={(e) => handleUpdate(e, plan)}>
									<Save className='w-4 h-4 mr-2' /> Save
									Changes
								</Button>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</div>
	);
}
