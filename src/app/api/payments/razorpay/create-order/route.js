import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/admin";
import { getProductByIdOrSlug } from "@/lib/db/products";
import { createOrder } from "@/lib/db/orders";
import { getDataFromToken } from "@/lib/auth";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
	key_id: process.env.RAZORPAY_KEY_ID,
	key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(request) {
	try {
		const userId = await getDataFromToken(request);
		
		if (!userId) {
			return NextResponse.json(
				{ success: false, message: "Please login to purchase" },
				{ status: 401 }
			);
		}

		const body = await request.json();
		const { productId, customerDetails, currency } = body;
		
		if (!productId) {
			return NextResponse.json(
				{ success: false, message: "Product ID is required" },
				{ status: 400 }
			);
		}

		const product = await getProductByIdOrSlug(productId);
		
		if (!product) {
			return NextResponse.json(
				{ success: false, message: "Product not found" },
				{ status: 404 }
			);
		}
		
		if (product.status !== "active") {
			return NextResponse.json(
				{ success: false, message: "Product is not available for purchase" },
				{ status: 400 }
			);
		}
		
		if (product.stock !== -1 && product.stock <= 0) {
			return NextResponse.json(
				{ success: false, message: "Product is out of stock" },
				{ status: 400 }
			);
		}
		
		let finalAmount = product.price;
		let discountApplied = 0;
		
		if (product.comparePrice && product.comparePrice > product.price) {
			discountApplied = product.comparePrice - product.price;
		}
		
		const amountInPaise = Math.round(finalAmount * 100);
		
		const razorpayOrder = await razorpay.orders.create({
			amount: amountInPaise,
			currency: currency || product.currency || 'INR',
			receipt: `receipt_${Date.now()}`,
			notes: {
				productId: product._id.toString(),
				userId: userId.toString(),
			},
		});
		
		const order = await createOrder({
			orderId: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
			user: userId,
			product: product._id,
			productSnapshot: {
				title: product.title,
				price: product.price,
				comparePrice: product.comparePrice,
				currency: currency || product.currency || 'INR',
				category: product.category,
				thumbnail: product.thumbnail,
			},
			amount: product.price,
			currency: currency || product.currency || 'INR',
			discountApplied,
			finalAmount,
			razorpay: {
				orderId: razorpayOrder.id,
			},
			paymentStatus: "pending",
			status: "pending",
			customerDetails: customerDetails || {},
		});
		
		return NextResponse.json({
			success: true,
			order: {
				id: order._id,
				orderId: order.orderId,
				amount: finalAmount,
				currency: product.currency || 'INR',
			},
			razorpay: {
				orderId: razorpayOrder.id,
				amount: amountInPaise,
				currency: razorpayOrder.currency,
				keyId: process.env.RAZORPAY_KEY_ID,
			},
		});
	} catch (error) {
		console.error("Error creating Razorpay order:", error);
		return NextResponse.json(
			{ success: false, message: error.message || "Failed to create order" },
			{ status: 500 }
		);
	}
}
