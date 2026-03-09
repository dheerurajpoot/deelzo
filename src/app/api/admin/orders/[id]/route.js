import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import { getDataFromToken } from "@/lib/auth";

// DELETE /api/admin/orders/[id] - Delete an order (admin only)
export async function DELETE(request, { params }) {
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

		// Find and delete the order
		const order = await Order.findById(id);
		if (!order) {
			return NextResponse.json(
				{ success: false, message: "Order not found" },
				{ status: 404 }
			);
		}

		await Order.findByIdAndDelete(id);

		return NextResponse.json({
			success: true,
			message: "Order deleted successfully"
		});
	} catch (error) {
		console.error("Error deleting order:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to delete order" },
			{ status: 500 }
		);
	}
}