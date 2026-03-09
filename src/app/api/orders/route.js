import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/admin";
import { createOrder } from "@/lib/db/orders";
import { getProductByIdOrSlug } from "@/lib/db/products";
import { getDataFromToken } from "@/lib/auth";
import { sendEmail } from "@/lib/emails";
import { EMAIL } from "@/lib/constant";

// GET /api/orders - Get user's orders
export async function GET(request) {
	try {
		const userId = await getDataFromToken(request);
		
		if (!userId) {
			return NextResponse.json(
				{ success: false, message: "Unauthorized" },
				{ status: 401 }
			);
		}
		
		const { searchParams } = new URL(request.url);
		const status = searchParams.get("status");
		const page = parseInt(searchParams.get("page")) || 1;
		const limit = parseInt(searchParams.get("limit")) || 10;
		const skip = (page - 1) * limit;
		
		let ordersRef = db.collection("orders").where("user", "==", userId);
		if (status) {
			ordersRef = ordersRef.where("status", "==", status);
		}
		
		const snapshot = await ordersRef.get();
		let allOrders = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
		
		allOrders.sort((a, b) => {
			const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
			const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
			return timeB - timeA;
		});
		
		const total = allOrders.length;
		let paginatedOrders = allOrders.slice(skip, skip + limit);
		
		// Populate products
		const rawProductIds = [...new Set(paginatedOrders.map(o => o.product))];
		const productIds = rawProductIds.map(id => typeof id === 'string' ? id : (id._id || id.id || id.toString())).filter(Boolean);
		if (productIds.length > 0) {
			const productsMap = {};
			for (let i = 0; i < productIds.length; i += 10) {
				const batch = productIds.slice(i, i + 10);
				if (batch.length > 0) {
					const productsSnapshot = await db.collection("products").where("__name__", "in", batch).get();
					productsSnapshot.forEach(doc => {
						const data = doc.data();
						productsMap[doc.id] = { _id: doc.id, title: data.title, thumbnail: data.thumbnail, slug: data.slug };
					});
				}
			}

			for (let i = 0; i < paginatedOrders.length; i++) {
				const pId = paginatedOrders[i].product;
				paginatedOrders[i].product = productsMap[pId] || { _id: pId, title: "Unknown" };
			}
		}

		return NextResponse.json({
			success: true,
			orders: paginatedOrders,
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
		const userId = await getDataFromToken(request);
		
		if (!userId) {
			return NextResponse.json(
				{ success: false, message: "Unauthorized" },
				{ status: 401 }
			);
		}

		const { productId, productSnapshot, amount, finalAmount, currency, paymentMethod, couponCode, paymentStatus, status, deliveryStatus } = await request.json();

		if (!productId || !finalAmount || !currency) {
			return NextResponse.json(
				{ success: false, message: "Missing required fields" },
				{ status: 400 }
			);
		}
		
		const orderAmount = amount || finalAmount;

		const product = await getProductByIdOrSlug(productId);
		if (!product) {
			return NextResponse.json(
				{ success: false, message: "Product not found" },
				{ status: 404 }
			);
		}

		const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

		const newOrder = await createOrder({
			orderId,
			user: userId,
			product: product._id,
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
			deliveryStatus: deliveryStatus || "processing",
			couponCode: couponCode || null,
		});

		// Increment product salesCount
		const { FieldValue } = require("firebase-admin/firestore");
		await db.collection("products").doc(product._id).update({
			salesCount: FieldValue.increment(1)
		});

		await sendEmail({
			to: EMAIL,
			subject: `New Order: ${product.title}`,
			html: "<p>There is a new order for your product.</p><p>Order ID: " + orderId + "</p><p>Product: " + product.title + "</p><p>Amount: " + finalAmount + " " + currency + "</p>",
		}).catch(err => console.error("Email send warning: ", err));

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
