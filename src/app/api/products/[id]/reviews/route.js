import { NextResponse } from "next/server";
import Product from "@/models/Product";
import User from "@/models/User";
import { connectDB } from "@/lib/mongodb";
import { getDataFromToken } from "@/lib/auth";

// POST /api/products/[id]/reviews - Submit a review for a product
export async function POST(request, { params }) {
	try {
		const userId = getDataFromToken(request);
		
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

		await connectDB();

		// Check if user already reviewed this product
		const existingReview = await Product.findOne({
			_id: id,
			"reviews.user": userId
		});

		if (existingReview) {
			return NextResponse.json(
				{ success: false, message: "You have already reviewed this product" },
				{ status: 400 }
			);
		}

		// Get user details
		const user = await User.findById(userId).select("name email");

		// Add review to product
		const updatedProduct = await Product.findByIdAndUpdate(
			id,
			{
				$push: {
					reviews: {
						user: userId,
						rating,
						comment,
						createdAt: new Date(),
					},
				},
			},
			{ new: true, runValidators: true }
		);

		if (!updatedProduct) {
			return NextResponse.json(
				{ success: false, message: "Product not found" },
				{ status: 404 }
			);
		}

		// Recalculate average rating
		const ratings = updatedProduct.reviews.map(r => r.rating);
		const averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;

		// Update product rating
		await Product.findByIdAndUpdate(id, {
			$set: {
				"rating.average": averageRating,
				"rating.count": ratings.length,
			},
		});

		// Fetch the updated product with populated user data
		const productWithReviews = await Product.findById(id)
			.populate("seller", "name email")
			.populate("reviews.user", "name avatar email")
			.lean();

		return NextResponse.json({
			success: true,
			message: "Review added successfully",
			product: productWithReviews
		});
	} catch (error) {
		console.error("Error adding review:", error);
		return NextResponse.json(
			{ success: false, message: error.message || "Failed to add review" },
			{ status: 500 }
		);
	}
}