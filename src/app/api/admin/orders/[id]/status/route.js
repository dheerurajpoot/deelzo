import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import { getDataFromToken } from "@/lib/auth";

// PATCH /api/admin/orders/[id]/status - Update order status (admin only)
export async function PATCH(request, { params }) {
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

		const { id } = await params;
		
		// Get the new status from request body
		const body = await request.json();
		const { status } = body;
		
		// Validate status
		const validStatuses = ["pending", "processing", "completed", "cancelled", "refunded"];
		if (!validStatuses.includes(status)) {
			return NextResponse.json(
				{ success: false, message: "Invalid status" },
				{ status: 400 }
			);
		}

		// Find the order
		const order = await Order.findById(id);
		if (!order) {
			return NextResponse.json(
				{ success: false, message: "Order not found" },
				{ status: 404 }
			);
		}

		// Update the order status
		order.status = status;
		
		// Update payment status based on order status
		if (status === "completed") {
			order.paymentStatus = "completed";
			order.deliveryStatus = "delivered";
			if (!order.deliveredAt) {
				order.deliveredAt = new Date();
			}
			if (!order.paidAt) {
				order.paidAt = new Date();
			}
		} else if (status === "cancelled") {
			order.paymentStatus = "cancelled";
		} else if (status === "refunded") {
			order.paymentStatus = "refunded";
			order.refundedAt = new Date();
		} else if (status === "processing") {
			if (order.paymentStatus === "pending") {
				order.paymentStatus = "completed"; // Assume payment is verified when moved to processing
			}
		}
		
		// If status is cancelled or refunded, you might want to handle payment refund logic here
		// For now, we'll just update the status
		
		await order.save();

		return NextResponse.json({
			success: true,
			message: "Order status updated successfully",
			order: {
				_id: order._id,
				orderId: order.orderId,
				status: order.status,
				deliveredAt: order.deliveredAt
			}
		});
	} catch (error) {
		console.error("Error updating order status:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to update order status" },
			{ status: 500 }
		);
	}
}