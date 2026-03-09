import { NextResponse } from "next/server";
import { getUserById, updateUser } from "@/lib/db/users";
import { db } from "@/lib/firebase/admin";

function extractIdFromRequest(request) {
	const url = new URL(request.url, process.env.NEXT_PUBLIC_APP_URL);
	const pathParts = url.pathname.split("/");
	return pathParts[pathParts.length - 1];
}

export async function GET(request) {
	try {
		const id = extractIdFromRequest(request);

		const user = await getUserById(id);

		if (!user) {
			return NextResponse.json(
				{ message: "User not found" },
				{ status: 404 }
			);
		}

		// Remove sensitive data equivalent to select("-password")
		delete user.password;
		delete user.passwordResetToken;
		delete user.passwordResetExpiry;
		delete user.emailVerificationOtp;
		delete user.emailVerificationExpiry;

		// Populate listings (if any)
		if (user.listings && user.listings.length > 0) {
			const validListingIds = user.listings.map(l => typeof l === 'string' ? l : (l._id || l.id || l.toString())).filter(Boolean);
			
			let listingsArray = [];
			// Firestore 'in' queries are limited to 10 items per batch
			for (let i = 0; i < validListingIds.length; i += 10) {
				const batch = validListingIds.slice(i, i + 10);
				if (batch.length > 0) {
					const listingsSnapshot = await db.collection("listings").where("__name__", "in", batch).get();
					listingsSnapshot.forEach(doc => {
						listingsArray.push({ _id: doc.id, ...doc.data() });
					});
				}
			}
			user.listings = listingsArray;
		} else {
			user.listings = [];
		}

		return NextResponse.json(user);
	} catch (error) {
		console.error("User fetch error:", error);
		return NextResponse.json(
			{ message: "Failed to fetch user" },
			{ status: 500 }
		);
	}
}

export async function PUT(request) {
	try {
		const id = extractIdFromRequest(request);
		const { userId, ...updateData } = await request.json();

		if (userId !== id) {
			return NextResponse.json(
				{ message: "Unauthorized" },
				{ status: 401 }
			);
		}

		const user = await updateUser(id, updateData);

		return NextResponse.json({ success: true, user });
	} catch (error) {
		console.error("User update error:", error);
		return NextResponse.json(
			{ message: "Failed to update user" },
			{ status: 500 }
		);
	}
}
