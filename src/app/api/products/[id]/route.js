import { NextResponse } from "next/server";
import { getProductByIdOrSlug, updateProduct, deleteProduct } from "@/lib/db/products";
import { getUserById } from "@/lib/db/users";
import { getDataFromToken } from "@/lib/auth";

export async function GET(request, { params }) {
	try {
		const { id } = await params;
		
		let product = await getProductByIdOrSlug(id);
		
		if (!product) {
			return NextResponse.json(
				{ success: false, message: "Product not found" },
				{ status: 404 }
			);
		}
		
		if (product.seller) {
			const seller = await getUserById(product.seller);
			if (seller) {
				product.seller = { _id: seller._id, name: seller.name, email: seller.email };
			}
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

export async function PUT(request, { params }) {
	try {
		const userId = await getDataFromToken(request);
		
		if (!userId) {
			return NextResponse.json(
				{ success: false, message: "Unauthorized" },
				{ status: 401 }
			);
		}

		const { id } = await params;
		const body = await request.json();
		
		const productParams = await getProductByIdOrSlug(id);

		if (!productParams) {
			return NextResponse.json(
				{ success: false, message: "Product not found" },
				{ status: 404 }
			);
		}

		const updatedProduct = await updateProduct(productParams._id, body);
		
		return NextResponse.json({
			success: true,
			product: updatedProduct,
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

export async function DELETE(request, { params }) {
	try {
		const userId = await getDataFromToken(request);
		if (!userId) {
			return NextResponse.json(
				{ success: false, message: "Unauthorized" },
				{ status: 401 }
			);
		}

		const { id } = await params;
		const productParams = await getProductByIdOrSlug(id);
		
		if (!productParams) {
			return NextResponse.json(
				{ success: false, message: "Product not found" },
				{ status: 404 }
			);
		}

		await deleteProduct(productParams._id);
		
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
