import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Listing from "@/models/Listing";
import { getDataFromToken } from "@/lib/auth";

export async function GET(request) {
	try {
		const userId = getDataFromToken(request);
		
		if (!userId) {
			return NextResponse.json(
				{ success: false, message: "Unauthorized" },
				{ status: 401 }
			);
		}

		await connectDB();

		// Fetch all listings for the authenticated user
		const listings = await Listing.find({ seller: userId })
			.sort({ createdAt: -1 }) // Sort by newest first
			.lean(); // Use lean() for better performance

		return NextResponse.json({
			success: true,
			listings,
		});
	} catch (error) {
		console.error("Error fetching user listings:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to fetch listings" },
			{ status: 500 }
		);
	}
}