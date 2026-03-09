import { NextResponse } from "next/server";
import { getProductByIdOrSlug } from "@/lib/db/products";
import { getDataFromToken } from "@/lib/auth";

export async function GET(request, { params }) {
	try {
		const userId = await getDataFromToken(request);
		
		if (!userId) {
			return NextResponse.json(
				{ success: false, message: "Unauthorized" },
				{ status: 401 }
			);
		}
		
		const { id } = await params;
		
		const product = await getProductByIdOrSlug(id);
		
		if (!product) {
			return NextResponse.json(
				{ success: false, message: "Product not found" },
				{ status: 404 }
			);
		}
		
		if (!product.downloadOptions) {
			return NextResponse.json(
				{ success: false, message: "No download available for this product" },
				{ status: 404 }
			);
		}
		
		let downloadUrl = null;
		
		if (product.downloadOptions.type === "upload" && product.downloadOptions.file?.url) {
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