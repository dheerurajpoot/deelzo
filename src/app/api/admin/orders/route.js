import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/admin";
import { getDataFromToken } from "@/lib/auth";
import { getUserById } from "@/lib/db/users";

export async function GET(request) {
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
		
		const { searchParams } = new URL(request.url);
		const status = searchParams.get("status");
		const paymentStatus = searchParams.get("paymentStatus");
		const page = parseInt(searchParams.get("page")) || 1;
		const limit = parseInt(searchParams.get("limit")) || 20;
		const search = searchParams.get("search");
		
		let ordersRef = db.collection("orders");
		if (status) ordersRef = ordersRef.where("status", "==", status);
		if (paymentStatus) ordersRef = ordersRef.where("paymentStatus", "==", paymentStatus);
		const snapshot = await ordersRef.get();
		let allOrders = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
		
		allOrders.sort((a, b) => {
			const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
			const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
			return timeB - timeA;
		});

		if (search) {
			const s = search.toLowerCase();
			allOrders = allOrders.filter(o => 
				(o.orderId && o.orderId.toLowerCase().includes(s)) ||
				(o.productSnapshot?.title && o.productSnapshot.title.toLowerCase().includes(s))
			);
		}

		// Calculate stats
		const stats = {
			totalRevenue: 0,
			totalOrders: allOrders.length,
			completedOrders: 0,
			processingOrders: 0,
			failedOrders: 0,
		};

		allOrders.forEach(o => {
			if (o.paymentStatus === "completed") {
				stats.completedOrders++;
				stats.totalRevenue += (o.finalAmount || 0);
			} else if (o.status === "processing") {
				stats.processingOrders++;
			} else if (o.paymentStatus === "failed") {
				stats.failedOrders++;
			}
		});

		const total = allOrders.length;
		const skip = (page - 1) * limit;
		const paginatedOrders = allOrders.slice(skip, skip + limit);
		
		// Populate users and products
		const rawUserIds = [...new Set(paginatedOrders.map(o => o.user))];
		const userIds = rawUserIds.map(id => typeof id === 'string' ? id : (id._id || id.id || id.toString())).filter(Boolean);
		
		const rawProductIds = [...new Set(paginatedOrders.map(o => o.product))];
		const productIds = rawProductIds.map(id => typeof id === 'string' ? id : (id._id || id.id || id.toString())).filter(Boolean);

		const usersMap = {};
		if (userIds.length > 0) {
			for (let i = 0; i < userIds.length; i += 10) {
				const batch = userIds.slice(i, i + 10);
				if (batch.length > 0) {
					const usersSnapshot = await db.collection("users").where("__name__", "in", batch).get();
					usersSnapshot.forEach(doc => {
						const data = doc.data();
						usersMap[doc.id] = { _id: doc.id, name: data.name, email: data.email };
					});
				}
			}
		}

		const productsMap = {};
		if (productIds.length > 0) {
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
		}

		for (let i = 0; i < paginatedOrders.length; i++) {
			const uId = paginatedOrders[i].user;
			const pId = paginatedOrders[i].product;
			paginatedOrders[i].user = usersMap[uId] || { _id: uId, name: "Unknown" };
			paginatedOrders[i].product = productsMap[pId] || { _id: pId, title: "Unknown" };
		}

		const serializeFirebaseData = (obj) => {
			if (obj === null || obj === undefined) return obj;
			if (typeof obj?.toDate === "function") return obj.toDate().toISOString();
			if (typeof obj === "object" && obj._seconds !== undefined && obj._nanoseconds !== undefined) {
				return new Date(obj._seconds * 1000).toISOString();
			}
			if (obj instanceof Date) return obj.toISOString();
			if (Array.isArray(obj)) return obj.map(serializeFirebaseData);
			if (typeof obj === "object") {
				const res = {};
				for (const key in obj) {
					res[key] = serializeFirebaseData(obj[key]);
				}
				return res;
			}
			return obj;
		};

		return NextResponse.json({
			success: true,
			orders: serializeFirebaseData(paginatedOrders),
			stats,
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
