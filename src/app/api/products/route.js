import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import User from "@/models/User";
import { getDataFromToken } from "@/lib/auth";

// GET /api/products - Get all products with filters
export async function GET(request) {
	try {
		await connectDB();
		
		const { searchParams } = new URL(request.url);
		const page = parseInt(searchParams.get("page")) || 1;
		const limit = parseInt(searchParams.get("limit")) || 12;
		const category = searchParams.get("category");
		const status = searchParams.get("status") || "active";
		const search = searchParams.get("search");
		const minPrice = searchParams.get("minPrice");
		const maxPrice = searchParams.get("maxPrice");
		const sortBy = searchParams.get("sortBy") || "createdAt";
		const sortOrder = searchParams.get("sortOrder") || "desc";
		const featured = searchParams.get("featured");

		// Build query
		const query = {};
		
		if (status) query.status = status;
		if (category) query.category = category;
		if (featured === "true") query.isFeatured = true;
		
		if (search) {
			query.$text = { $search: search };
		}
		
		if (minPrice || maxPrice) {
			query.price = {};
			if (minPrice) query.price.$gte = parseFloat(minPrice);
			if (maxPrice) query.price.$lte = parseFloat(maxPrice);
		}

		// Build sort
		const sort = {};
		sort[sortBy] = sortOrder === "asc" ? 1 : -1;

		// Execute query
		const skip = (page - 1) * limit;
		const [products, total] = await Promise.all([
			Product.find(query)
				.sort(sort)
				.skip(skip)
				.limit(limit)
				.populate("seller", "name email")
				.populate("reviews.user", "name avatar email")
				.lean(),
			Product.countDocuments(query),
		]);

		return NextResponse.json({
			success: true,
			products,
			pagination: {
				page,
				limit,
				total,
				pages: Math.ceil(total / limit),
				hasMore: page * limit < total,
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

// POST /api/products - Create new product (admin only)
export async function POST(request) {
	try {
		const userId = getDataFromToken(request);

        const user = await User.findById(userId);
		
		if (!user || user.role !== "admin") {
			return NextResponse.json(
				{ success: false, message: "Unauthorized" },
				{ status: 401 }
			);
		}

		await connectDB();
		
		const body = await request.json();
		
		// Set seller to current admin
		body.seller = userId;
		
		const product = await Product.create(body);
		
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
