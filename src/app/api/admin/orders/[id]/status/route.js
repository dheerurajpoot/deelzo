import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/admin";
import { getDataFromToken } from "@/lib/auth";
import { getUserById } from "@/lib/db/users";
import { getOrderById, updateOrder } from "@/lib/db/orders";

export async function PATCH(request, { params }) {
	try {
		const userId = await getDataFromToken(request);
		
		if (!userId) {
			return NextResponse.json(
				{ success: false, message: "Unauthorized" },
				{ status: 401 }
			);
		}

		const user = await getUserById(userId);
		if (!user || user.role !== "admin") {
			return NextResponse.json(
				{ success: false, message: "Admin access required" },
				{ status: 403 }
			);
		}

		const { id } = await params;
		const { status } = await request.json();
		
		const validStatuses = ["pending", "processing", "completed", "cancelled", "refunded"];
		if (!validStatuses.includes(status)) {
			return NextResponse.json(
				{ success: false, message: "Invalid status" },
				{ status: 400 }
			);
		}

		const order = await getOrderById(id);
		if (!order) {
			return NextResponse.json(
				{ success: false, message: "Order not found" },
				{ status: 404 }
			);
		}

		const updateData = { status, updatedAt: new Date() };

		if (status === "completed") {
			updateData.paymentStatus = "completed";
			updateData.deliveryStatus = "delivered";
			if (!order.deliveredAt) updateData.deliveredAt = new Date();
			if (!order.paidAt) updateData.paidAt = new Date();
		} else if (status === "cancelled") {
			updateData.paymentStatus = "cancelled";
		} else if (status === "refunded") {
			updateData.paymentStatus = "refunded";
			updateData.refundedAt = new Date();
		} else if (status === "processing") {
			if (order.paymentStatus === "pending") {
				updateData.paymentStatus = "completed";
			}
		}
		
		const updatedOrder = await updateOrder(id, updateData);

		return NextResponse.json({
			success: true,
			message: "Order status updated successfully",
			order: {
				_id: updatedOrder._id,
				orderId: updatedOrder.orderId,
				status: updatedOrder.status,
				deliveredAt: updatedOrder.deliveredAt
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