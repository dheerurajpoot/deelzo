import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import { getDataFromToken } from "@/lib/auth";

// PATCH /api/orders/payment-details - Update order payment details for manual verification
export async function PATCH(request) {
	try {
		const userId = getDataFromToken(request);
		
		if (!userId) {
			return NextResponse.json(
				{ success: false, message: "Unauthorized" },
				{ status: 401 }
			);
		}

		await connectDB();
		
		// Parse request body
		const { transactionId, paymentMethod } = await request.json();

		// Validate required fields
		if (!transactionId || !paymentMethod) {
			return NextResponse.json(
				{ success: false, message: "Missing required fields" },
				{ status: 400 }
			);
		}

		// Find the most recent pending order for this user
		const order = await Order.findOne({
			user: userId,
			status: "pending",
			createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
		}).sort({ createdAt: -1 });

		if (!order) {
			return NextResponse.json(
				{ success: false, message: "No pending order found" },
				{ status: 404 }
			);
		}

		// Update order with transaction details
		order.transactionId = transactionId;
		order.paymentMethod = paymentMethod;
		order.paymentStatus = "pending"; // Payment submitted, awaiting admin verification

		await order.save();

		return NextResponse.json({
			success: true,
			message: "Order payment details updated successfully",
			order: {
				_id: order._id,
				orderId: order.orderId,
				status: order.status,
				paymentStatus: order.paymentStatus,
			}
		});
	} catch (error) {
		console.error("Error updating order payment details:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to update order payment details" },
			{ status: 500 }
		);
	}
}