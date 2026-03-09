import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/admin";
import { getDataFromToken } from "@/lib/auth";
import { getUserById } from "@/lib/db/users";
import { getProductByIdOrSlug } from "@/lib/db/products";

export async function POST(request, { params }) {
	try {
		const userId = await getDataFromToken(request);
		
		if (!userId) {
			return NextResponse.json(
				{ success: false, message: "Unauthorized" },
				{ status: 401 }
			);
		}

		const { id } = await params;
		const { rating, comment } = await request.json();
		
		if (!rating || rating < 1 || rating > 5) {
			return NextResponse.json(
				{ success: false, message: "Rating must be between 1 and 5" },
				{ status: 400 }
			);
		}
		
		if (!comment || comment.trim().length < 5) {
			return NextResponse.json(
				{ success: false, message: "Comment must be at least 5 characters long" },
				{ status: 400 }
			);
		}

		const product = await getProductByIdOrSlug(id);
		if (!product) {
			return NextResponse.json(
				{ success: false, message: "Product not found" },
				{ status: 404 }
			);
		}

		// Check if user already reviewed
		const existingReviews = product.reviews || [];
		if (existingReviews.some(r => r.user === userId)) {
			return NextResponse.json(
				{ success: false, message: "You have already reviewed this product" },
				{ status: 400 }
			);
		}

		const newReview = {
			user: userId,
			rating,
			comment,
			createdAt: new Date(),
		};

		const updatedReviews = [...existingReviews, newReview];
		const ratings = updatedReviews.map(r => r.rating);
		const averageRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;

		await db.collection("products").doc(product._id).update({
			reviews: updatedReviews,
			rating: {
				average: averageRating,
				count: ratings.length,
			}
		});

		// Fetch updated product with expanded references
		const updatedProductDoc = await db.collection("products").doc(product._id).get();
		const updatedProduct = { _id: updatedProductDoc.id, ...updatedProductDoc.data() };

		if (updatedProduct.seller) {
			const seller = await getUserById(updatedProduct.seller);
			updatedProduct.seller = seller ? { name: seller.name, email: seller.email } : { name: "Unknown" };
		}

		if (updatedProduct.reviews) {
			for (let i = 0; i < updatedProduct.reviews.length; i++) {
				const rUser = await getUserById(updatedProduct.reviews[i].user);
				updatedProduct.reviews[i].user = rUser ? { name: rUser.name, avatar: rUser.avatar, email: rUser.email } : { name: "Unknown" };
			}
		}

		return NextResponse.json({
			success: true,
			message: "Review added successfully",
			product: updatedProduct
		});
	} catch (error) {
		console.error("Error adding review:", error);
		return NextResponse.json(
			{ success: false, message: error.message || "Failed to add review" },
			{ status: 500 }
		);
	}
}