import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/admin";
import { createProduct } from "@/lib/db/products";
import { getUserById } from "@/lib/db/users";
import { getDataFromToken } from "@/lib/auth";

export async function GET(request) {
	try {
		const { searchParams } = new URL(request.url);
		const page = parseInt(searchParams.get("page")) || 1;
		const limit = parseInt(searchParams.get("limit")) || 12;
		const skip = (page - 1) * limit;
		const category = searchParams.get("category");
		const status = searchParams.get("status") || "active";
		const search = searchParams.get("search");
		const minPrice = searchParams.get("minPrice");
		const maxPrice = searchParams.get("maxPrice");
		const sortBy = searchParams.get("sortBy") || "createdAt";
		const sortOrder = searchParams.get("sortOrder") || "desc";
		const featured = searchParams.get("featured");

		let productsRef = db.collection("products");
		if (status) productsRef = productsRef.where("status", "==", status);
		if (category) productsRef = productsRef.where("category", "==", category);
		if (featured === "true") productsRef = productsRef.where("isFeatured", "==", true);
		
		// Note on Firebase indices: using .where() alongside .orderBy() on different fields often requires compound indexes.
		// For simplicity/compatibility missing those indexes in development, we'll sort them in-memory, or only order by createdAt desc.
		
		const snapshot = await productsRef.get();
		let allProducts = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));

		const sortField = sortBy === "createdAt" ? "createdAt" : sortBy;
		allProducts.sort((a, b) => {
			let valA = a[sortField];
			let valB = b[sortField];
			if (valA?.toDate) valA = valA.toDate().getTime();
			else if (valA && typeof valA === 'string' && sortField === 'createdAt') valA = new Date(valA).getTime();
			
			if (valB?.toDate) valB = valB.toDate().getTime();
			else if (valB && typeof valB === 'string' && sortField === 'createdAt') valB = new Date(valB).getTime();
			
			if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
			if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
			return 0;
		});

		// Filtering things not easily supported via native Firebase queries without complex indexes:
		allProducts = allProducts.filter(p => {
			let priceMatch = true;
			if (minPrice && p.price < parseFloat(minPrice)) priceMatch = false;
			if (maxPrice && p.price > parseFloat(maxPrice)) priceMatch = false;
			
			let searchMatch = true;
			if (search) {
				const s = search.toLowerCase();
				searchMatch = (p.title && p.title.toLowerCase().includes(s)) ||
							  (p.description && p.description.toLowerCase().includes(s));
			}
			return priceMatch && searchMatch;
		});

		const total = allProducts.length;
		const paginatedProducts = allProducts.slice(skip, skip + limit);

		// Populate sellers
		const rawSellerIds = [...new Set(paginatedProducts.map(p => p.seller))];
		const sellerIds = rawSellerIds.map(id => typeof id === 'string' ? id : (id._id || id.id || id.toString())).filter(Boolean);
		if (sellerIds.length > 0) {
			const usersMap = {};
			for (let i = 0; i < sellerIds.length; i += 10) {
				const batch = sellerIds.slice(i, i + 10);
				if (batch.length > 0) {
					const usersSnapshot = await db.collection("users").where("__name__", "in", batch).get();
					usersSnapshot.forEach(doc => {
						const data = doc.data();
						usersMap[doc.id] = { _id: doc.id, name: data.name, email: data.email };
					});
				}
			}

			for (let i = 0; i < paginatedProducts.length; i++) {
				const sellerId = paginatedProducts[i].seller;
				paginatedProducts[i].seller = usersMap[sellerId] || { _id: sellerId, name: "Unknown" };
			}
		}

		return NextResponse.json({
			success: true,
			products: paginatedProducts,
			pagination: {
				page,
				limit,
				total,
				pages: Math.ceil(total / limit),
				hasMore: skip + limit < total,
			},
		});

	} catch (error) {
		console.error("Error fetching products:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to fetch products" },
			{ status: 500 }
		);
	}
}

export async function POST(request) {
	try {
		const userId = await getDataFromToken(request);
		const user = await getUserById(userId);
		
		if (!user || user.role !== "admin") {
			return NextResponse.json(
				{ success: false, message: "Unauthorized" },
				{ status: 401 }
			);
		}

		const body = await request.json();
		
		body.seller = userId;
		
		const product = await createProduct(body);
		
		return NextResponse.json({
			success: true,
			product,
			message: "Product created successfully",
		});
	} catch (error) {
		console.error("Error creating product:", error);
		return NextResponse.json(
			{ success: false, message: error.message || "Failed to create product" },
			{ status: 500 }
		);
	}
}
