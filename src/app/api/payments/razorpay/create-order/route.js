import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Order from "@/models/Order";
import { getDataFromToken } from "@/lib/auth";
import Razorpay from "razorpay";

// Initialize Razorpay
const razorpay = new Razorpay({
	key_id: process.env.RAZORPAY_KEY_ID,
	key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payments/razorpay/create-order - Create Razorpay order
export async function POST(request) {
	try {
		const userId = getDataFromToken(request);
		
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

		await connectDB();
		
		// Get product details
		const product = await Product.findById(productId);
		
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
		
		// Check stock
		if (product.stock !== -1 && product.stock <= 0) {
			return NextResponse.json(
				{ success: false, message: "Product is out of stock" },
				{ status: 400 }
			);
		}
		
		// Calculate final amount
		let finalAmount = product.price;
		let discountApplied = 0;
		
		if (product.comparePrice && product.comparePrice > product.price) {
			discountApplied = product.comparePrice - product.price;
		}
		
		// Convert to paise (Razorpay uses smallest currency unit)
		const amountInPaise = Math.round(finalAmount * 100);
		
		// Create Razorpay order
		const razorpayOrder = await razorpay.orders.create({
			amount: amountInPaise,
			currency: currency || product.currency, // Use user's currency if provided, otherwise use product currency
			receipt: `receipt_${Date.now()}`,
			notes: {
				productId: product._id.toString(),
				userId: userId,
			},
		});
		
		// Create order in database
		const order = await Order.create({
			user: userId,
			product: product._id,
			productSnapshot: {
				title: product.title,
				price: product.price,
				comparePrice: product.comparePrice,
				currency: currency || product.currency,
				category: product.category,
				thumbnail: product.thumbnail,
			},
			amount: product.price,
			currency: currency || product.currency,
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
				currency: product.currency,
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
