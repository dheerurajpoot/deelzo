import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { getDataFromToken } from "@/lib/auth";

// GET /api/products/[id]/download - Get download URL for a product
export async function GET(request, { params }) {
	try {
		const userId = getDataFromToken(request);
		
		if (!userId) {
			return NextResponse.json(
				{ success: false, message: "Unauthorized" },
				{ status: 401 }
			);
		}

		await connectDB();
		
		const { id } = await params;
		
		// Find the product
		const product = await Product.findById(id);
		
		if (!product) {
			return NextResponse.json(
				{ success: false, message: "Product not found" },
				{ status: 404 }
			);
		}
		
		// Check if product has download options
		if (!product.downloadOptions) {
			return NextResponse.json(
				{ success: false, message: "No download available for this product" },
				{ status: 404 }
			);
		}
		
		// Return appropriate download URL based on type
		let downloadUrl = null;
		
		if (product.downloadOptions.type === "upload" && product.downloadOptions.file?.url) {
			// Use the direct URL from ImageKit
			downloadUrl = product.downloadOptions.file.url;
		} else if (product.downloadOptions.type === "link" && product.downloadOptions.link) {
			downloadUrl = product.downloadOptions.link;
		}
		
		if (!downloadUrl) {
			return NextResponse.json(
				{ success: false, message: "Download URL not available" },
				{ status: 404 }
			);
		}
		
		return NextResponse.json({
			success: true,
			downloadUrl,
			type: product.downloadOptions.type,
			fileName: product.downloadOptions.file?.name || null
		});
	} catch (error) {
		console.error("Error getting download URL:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to get download URL" },
			{ status: 500 }
		);
	}
}