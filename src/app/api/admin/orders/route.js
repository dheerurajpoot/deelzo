import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import { getDataFromToken } from "@/lib/auth";

// GET /api/admin/orders - Get all orders (admin only)
export async function GET(request) {
	try {
		const userId = getDataFromToken(request);
		
		if (!userId) {
			return NextResponse.json(
				{ success: false, message: "Unauthorized" },
				{ status: 401 }
			);
		}

		await connectDB();
		
		// Check if user is admin
		const user = await User.findById(userId);
		if (!user || user.role !== "admin") {
			return NextResponse.json(
				{ success: false, message: "Admin access required" },
				{ status: 403 }
			);
		}
		
		const { searchParams } = new URL(request.url);
		const status = searchParams.get("status");
		const paymentStatus = searchParams.get("paymentStatus");
		const page = parseInt(searchParams.get("page")) || 1;
		const limit = parseInt(searchParams.get("limit")) || 20;
		const search = searchParams.get("search");
		
		// Build query
		const query = {};
		if (status) query.status = status;
		if (paymentStatus) query.paymentStatus = paymentStatus;
		
		if (search) {
			query.$or = [
				{ orderId: { $regex: search, $options: "i" } },
				{ "productSnapshot.title": { $regex: search, $options: "i" } },
			];
		}
		
		const skip = (page - 1) * limit;
		
		const [orders, total] = await Promise.all([
			Order.find(query)
				.populate("user", "name email")
				.populate("product", "title thumbnail slug")
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit)
				.lean(),
			Order.countDocuments(query),
		]);
		
		// Calculate stats
		const stats = await Order.aggregate([
			{
				$group: {
					_id: null,
					totalRevenue: {
						$sum: {
							$cond: [{ $eq: ["$paymentStatus", "completed"] }, "$finalAmount", 0]
						}
					},
					totalOrders: { $sum: 1 },
					completedOrders: {
						$sum: { $cond: [{ $eq: ["$paymentStatus", "completed"] }, 1, 0] }
					},
					pendingOrders: {
						$sum: { $cond: [{ $eq: ["$paymentStatus", "pending"] }, 1, 0] }
					},
					failedOrders: {
						$sum: { $cond: [{ $eq: ["$paymentStatus", "failed"] }, 1, 0] }
					},
				},
			},
		]);
		
		return NextResponse.json({
			success: true,
			orders,
			stats: stats[0] || {
				totalRevenue: 0,
				totalOrders: 0,
				completedOrders: 0,
				pendingOrders: 0,
				failedOrders: 0,
			},
			pagination: {
				page,
				limit,
				total,
				pages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		console.error("Error fetching orders:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to fetch orders" },
			{ status: 500 }
		);
	}
}
