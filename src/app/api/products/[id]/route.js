import { NextResponse } from "next/server";
import Product from "@/models/Product";
import { connectDB } from "@/lib/mongodb";
import { getDataFromToken } from "@/lib/auth";



// GET /api/products/[id] - Get single product
export async function GET(request, { params }) {
	try {
		const { id } = await params;
		
		await connectDB();
		
		const product = await Product.findById(id)
			.populate("seller", "name email")
            .populate("reviews.user", "name avatar email")
			.lean();
		
		if (!product) {
			return NextResponse.json(
				{ success: false, message: "Product not found" },
				{ status: 404 }
			);
		}
		
		return NextResponse.json({
			success: true,
			product,
		});
	} catch (error) {
		console.error("Error fetching product:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to fetch product" },
			{ status: 500 }
		);
	}
}

// PUT /api/products/[id] - Update product (admin only)
export async function PUT(request, { params }) {
	try {
		const userId = getDataFromToken(request);
		
		if (!userId) {
			return NextResponse.json(
				{ success: false, message: "Unauthorized" },
				{ status: 401 }
			);
		}

		const { id } = await params;
		const body = await request.json();
		
		await connectDB();
		
		const product = await Product.findByIdAndUpdate(
			id,
			{ $set: body },
			{ new: true, runValidators: true }
		);
		
		if (!product) {
			return NextResponse.json(
				{ success: false, message: "Product not found" },
				{ status: 404 }
			);
		}
		
		return NextResponse.json({
			success: true,
			product,
			message: "Product updated successfully",
		});
	} catch (error) {
		console.error("Error updating product:", error);
		return NextResponse.json(
			{ success: false, message: error.message || "Failed to update product" },
			{ status: 500 }
		);
	}
}

// DELETE /api/products/[id] - Delete product (admin only)
export async function DELETE(request, { params }) {
	try {
		const userId = getDataFromToken(request);
		if (!userId) {
			return NextResponse.json(
				{ success: false, message: "Unauthorized" },
				{ status: 401 }
			);
		}

		const { id } = await params;
		
		await connectDB();
		
		const product = await Product.findByIdAndDelete(id);
		
		if (!product) {
			return NextResponse.json(
				{ success: false, message: "Product not found" },
				{ status: 404 }
			);
		}
		
		return NextResponse.json({
			success: true,
			message: "Product deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting product:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to delete product" },
			{ status: 500 }
		);
	}
}
