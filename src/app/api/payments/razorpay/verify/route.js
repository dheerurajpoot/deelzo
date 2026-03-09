import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { getDataFromToken } from "@/lib/auth";
import crypto from "crypto";

// POST /api/payments/razorpay/verify - Verify Razorpay payment
export async function POST(request) {
	try {
		const userId = getDataFromToken(request);
		
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

		await connectDB();
		
		// Find the order
		const order = await Order.findOne({
			$or: [
				{ _id: orderId },
				{ "razorpay.orderId": razorpay_order_id }
			],
			user: userId,
		});
		
		if (!order) {
			return NextResponse.json(
				{ success: false, message: "Order not found" },
				{ status: 404 }
			);
		}
		
		// Verify signature
		const generatedSignature = crypto
			.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
			.update(`${razorpay_order_id}|${razorpay_payment_id}`)
			.digest("hex");
		
		const isSignatureValid = generatedSignature === razorpay_signature;
		
		if (!isSignatureValid) {
			// Update order as failed
			order.paymentStatus = "failed";
			order.status = "cancelled";
			await order.save();
			
			return NextResponse.json(
				{ success: false, message: "Invalid payment signature" },
				{ status: 400 }
			);
		}
		
		// Payment successful - update order
		order.razorpay.paymentId = razorpay_payment_id;
		order.razorpay.signature = razorpay_signature;
		order.paymentStatus = "completed";
		order.status = "completed";
		order.deliveryStatus = "delivered";
		order.paidAt = new Date();
		order.deliveredAt = new Date();
		
		// Generate download URL (valid for 7 days)
		const downloadExpiry = new Date();
		downloadExpiry.setDate(downloadExpiry.getDate() + 7);
		order.downloadExpiry = downloadExpiry;
		
		await order.save();
		
		// Update product sales count
		await Product.findByIdAndUpdate(order.product, {
			$inc: { salesCount: 1 },
		});
		
		// Decrease stock if limited
		const product = await Product.findById(order.product);
		if (product && product.stock > 0) {
			product.stock -= 1;
			await product.save();
		}
		
		return NextResponse.json({
			success: true,
			message: "Payment verified successfully",
			order: {
				id: order._id,
				orderId: order.orderId,
				status: order.status,
				paymentStatus: order.paymentStatus,
				downloadExpiry: order.downloadExpiry,
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
