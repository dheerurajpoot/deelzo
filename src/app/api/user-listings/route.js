import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/admin";
import { getDataFromToken } from "@/lib/auth";

export async function GET(request) {
	try {
		const userId = await getDataFromToken(request);
		
		if (!userId) {
			return NextResponse.json(
				{ success: false, message: "Unauthorized" },
				{ status: 401 }
			);
		}

		// Fetch all listings for the authenticated user
		const snapshot = await db.collection("listings")
			.where("seller", "==", userId)
			.get();

		const listings = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));

		listings.sort((a, b) => {
			const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
			const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
			return timeB - timeA;
		});

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