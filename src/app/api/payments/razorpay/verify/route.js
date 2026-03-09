import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/admin";
import { getDataFromToken } from "@/lib/auth";
import crypto from "crypto";

export async function POST(request) {
	try {
		const userId = await getDataFromToken(request);
		
		if (!userId) {
			return NextResponse.json(
				{ success: false, message: "Unauthorized" },
				{ status: 401 }
			);
		}

		const body = await request.json();
		const { 
			razorpay_order_id, 
			razorpay_payment_id, 
			razorpay_signature,
			orderId 
		} = body;
		
		if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
			return NextResponse.json(
				{ success: false, message: "Missing payment details" },
				{ status: 400 }
			);
		}

		let orderDoc = null;
		if (orderId) {
			const doc = await db.collection("orders").doc(orderId).get();
			if (doc.exists && doc.data().user === userId) {
				orderDoc = { _id: doc.id, ...doc.data() };
			}
		} 
		
		if (!orderDoc) {
			const snapshot = await db.collection("orders")
				.where("razorpay.orderId", "==", razorpay_order_id)
				.where("user", "==", userId)
				.limit(1)
				.get();
			if (!snapshot.empty) {
				orderDoc = { _id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
			}
		}
		
		if (!orderDoc) {
			return NextResponse.json(
				{ success: false, message: "Order not found" },
				{ status: 404 }
			);
		}
		
		const generatedSignature = crypto
			.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
			.update(`${razorpay_order_id}|${razorpay_payment_id}`)
			.digest("hex");
		
		const isSignatureValid = generatedSignature === razorpay_signature;
		
		if (!isSignatureValid) {
			await db.collection("orders").doc(orderDoc._id).update({
				paymentStatus: "failed",
				status: "cancelled",
				updatedAt: new Date()
			});
			
			return NextResponse.json(
				{ success: false, message: "Invalid payment signature" },
				{ status: 400 }
			);
		}
		
		const downloadExpiry = new Date();
		downloadExpiry.setDate(downloadExpiry.getDate() + 7);
		
		await db.collection("orders").doc(orderDoc._id).update({
			"razorpay.paymentId": razorpay_payment_id,
			"razorpay.signature": razorpay_signature,
			paymentStatus: "completed",
			status: "completed",
			deliveryStatus: "delivered",
			paidAt: new Date(),
			deliveredAt: new Date(),
			downloadExpiry,
			updatedAt: new Date()
		});

		// Update product sales count and stock
		if (orderDoc.product) {
			const productRef = db.collection("products").doc(orderDoc.product);
			const productDoc = await productRef.get();
			
			if (productDoc.exists) {
				const productUpdates = { salesCount: (productDoc.data().salesCount || 0) + 1 };
				
				if (productDoc.data().stock !== undefined && productDoc.data().stock > 0) {
					productUpdates.stock = productDoc.data().stock - 1;
				}
				
				await productRef.update(productUpdates);
			}
		}
		
		const updatedOrderDoc = await db.collection("orders").doc(orderDoc._id).get();
		
		return NextResponse.json({
			success: true,
			message: "Payment verified successfully",
			order: {
				id: updatedOrderDoc.id,
				orderId: updatedOrderDoc.data().orderId,
				status: updatedOrderDoc.data().status,
				paymentStatus: updatedOrderDoc.data().paymentStatus,
				downloadExpiry: updatedOrderDoc.data().downloadExpiry?.toDate(),
			},
		});
	} catch (error) {
		console.error("Error verifying payment:", error);
		return NextResponse.json(
			{ success: false, message: error.message || "Failed to verify payment" },
			{ status: 500 }
		);
	}
}
