import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/admin";
import { getDataFromToken } from "@/lib/auth";
import { getUserById } from "@/lib/db/users";
import { deleteOrder } from "@/lib/db/orders";

export async function DELETE(request, { params }) {
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

		const orderDoc = await db.collection("orders").doc(id).get();
		if (!orderDoc.exists) {
			return NextResponse.json(
				{ success: false, message: "Order not found" },
				{ status: 404 }
			);
		}

		await deleteOrder(id);

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