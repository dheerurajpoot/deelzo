import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/admin";
import { getDataFromToken } from "@/lib/auth";

export async function PATCH(request) {
	try {
		const userId = await getDataFromToken(request);
		
		if (!userId) {
			return NextResponse.json(
				{ success: false, message: "Unauthorized" },
				{ status: 401 }
			);
		}

		const { transactionId, paymentMethod } = await request.json();

		if (!transactionId || !paymentMethod) {
			return NextResponse.json(
				{ success: false, message: "Missing required fields" },
				{ status: 400 }
			);
		}

		// Find the most recent pending order for this user in last 24h
		const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
		
		const snapshot = await db.collection("orders")
			.where("user", "==", userId)
			.where("status", "==", "pending")
			.get();

		if (snapshot.empty) {
			return NextResponse.json(
				{ success: false, message: "No pending order found" },
				{ status: 404 }
			);
		}
		
		let orders = snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }));
		orders.sort((a, b) => {
			const timeA = a.data.createdAt?.toDate ? a.data.createdAt.toDate().getTime() : (a.data.createdAt ? new Date(a.data.createdAt).getTime() : 0);
			const timeB = b.data.createdAt?.toDate ? b.data.createdAt.toDate().getTime() : (b.data.createdAt ? new Date(b.data.createdAt).getTime() : 0);
			return timeB - timeA;
		});

		const orderDoc = orders[0];
		const orderData = orderDoc.data;
		
		const createdAt = orderData.createdAt?.toDate ? orderData.createdAt.toDate() : new Date(orderData.createdAt);
		if (createdAt < oneDayAgo) {
			return NextResponse.json(
				{ success: false, message: "No pending order found within the last 24 hours" },
				{ status: 404 }
			);
		}

		// Update order with transaction details
		await db.collection("orders").doc(orderDoc.id).update({
			transactionId,
			paymentMethod,
			paymentStatus: "pending", // Payment submitted, awaiting admin verification
			updatedAt: new Date()
		});

		const updatedOrder = await db.collection("orders").doc(orderDoc.id).get();

		return NextResponse.json({
			success: true,
			message: "Order payment details updated successfully",
			order: {
				_id: updatedOrder.id,
				orderId: updatedOrder.data().orderId,
				status: updatedOrder.data().status,
				paymentStatus: updatedOrder.data().paymentStatus,
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