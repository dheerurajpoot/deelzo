import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { getDataFromToken } from "@/lib/auth";
import { sendEmail } from "@/lib/emails";
import { EMAIL } from "@/lib/constant"

// GET /api/orders - Get user's orders
export async function GET(request) {
	try {
		const userId = getDataFromToken(request);
		
		if (!userId) {
			return NextResponse.json(
				{ success: false, message: "Unauthorized" },
				{ status: 401 }
			);
		}

		await connectDB();
		
		const { searchParams } = new URL(request.url);
		const status = searchParams.get("status");
		const page = parseInt(searchParams.get("page")) || 1;
		const limit = parseInt(searchParams.get("limit")) || 10;
		
		// Build query
		const query = { user: userId };
		if (status) {
			query.status = status;
		}
		
		const skip = (page - 1) * limit;
		
		const [orders, total] = await Promise.all([
			Order.find(query)
				.populate("product", "title thumbnail slug")
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit)
				.lean(),
			Order.countDocuments(query),
		]);
		
		return NextResponse.json({
			success: true,
			orders,
			pagination: {
				page,
				limit,
				total,
				pages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		console.error("Error fetching orders:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to fetch orders" },
			{ status: 500 }
		);
	}
}

// POST /api/orders - Create a new order
export async function POST(request) {
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
		const { productId, productSnapshot, amount, finalAmount, currency, paymentMethod, couponCode, paymentStatus, status, deliveryStatus } = await request.json();

		// Validate required fields
		if (!productId || !finalAmount || !currency) {
			return NextResponse.json(
				{ success: false, message: "Missing required fields" },
				{ status: 400 }
			);
		}
		
		// If amount is not provided, use finalAmount
		const orderAmount = amount || finalAmount;

		// Verify product exists
		const product = await Product.findById(productId);
		if (!product) {
			return NextResponse.json(
				{ success: false, message: "Product not found" },
				{ status: 404 }
			);
		}

		// Generate order ID
		const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

		// Create order
		const newOrder = new Order({
			orderId,
			user: userId,
			product: productId,
			productSnapshot: productSnapshot || {
				title: product.title,
				price: product.price,
				comparePrice: product.comparePrice,
				thumbnail: product.thumbnail,
				category: product.category,
			},
			amount: orderAmount,
			finalAmount,
			currency,
			paymentMethod,
			paymentStatus: paymentStatus || "processing",
			status: status || "processing",
			deliveryStatus: deliveryStatus,
			couponCode: couponCode || null,
			createdAt: new Date(),
		});

		await Product.findByIdAndUpdate(productId, { $inc: { salesCount: 1 } });

		// send confirmation email to admin and customer 
		
		await sendEmail({
			to: EMAIL,
			subject: `New Order: ${product.title}`,
			html: "<p>There is a new order for your product.</p><p>Order ID: " + orderId + "</p><p>Product: " + product.title + "</p><p>Amount: " + finalAmount + " " + currency + "</p>",
		})

		await newOrder.save();

		return NextResponse.json({
			success: true,
			message: "Order created successfully",
			order: {
				_id: newOrder._id,
				orderId: newOrder.orderId,
				status: newOrder.status,
				paymentStatus: newOrder.paymentStatus,
			}
		});
	} catch (error) {
		console.error("Error creating order:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to create order" },
			{ status: 500 }
		);
	}
}
