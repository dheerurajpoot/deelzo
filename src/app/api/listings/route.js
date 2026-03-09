import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/admin";
import { createListing } from "@/lib/db/listings";
import { getUserById, addListingToUser } from "@/lib/db/users";
import { sendEmail, generateNewListingNotification } from "@/lib/emails";

export async function GET(request) {
	try {
		const { searchParams } = new URL(request.url);
		const category = searchParams.get("category");
		const page = Number.parseInt(searchParams.get("page")) || 1;
		const limit = 12;
		const skip = (page - 1) * limit;

		const userId = searchParams.get("userId");

		let listingsRef = db.collection("listings");
		let countRef = db.collection("listings");

		if (userId) {
			listingsRef = listingsRef.where("seller", "==", userId);
			countRef = countRef.where("seller", "==", userId);
		} else {
			listingsRef = listingsRef.where("status", "in", ["active", "sold"]);
			countRef = countRef.where("status", "in", ["active", "sold"]);
			if (category) {
				listingsRef = listingsRef.where("category", "==", category);
				countRef = countRef.where("category", "==", category);
			}
		}

		// Fetch all documents matching filters
		const snapshot = await listingsRef.get();
		let listings = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
		
		listings.sort((a, b) => {
			const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
			const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
			return timeB - timeA;
		});

		const total = listings.length;
		listings = listings.slice(skip, skip + limit);

		// Custom sort: active first, then sold (only for public view)
		if (!userId) {
			listings.sort((a, b) => {
				if (a.status === "active" && b.status !== "active") return -1;
				if (a.status !== "active" && b.status === "active") return 1;
				return 0; // Maintain createdAt order for same status
			});
		}

		// Populate sellers
		const rawSellerIds = [...new Set(listings.map(l => l.seller))];
		const sellerIds = rawSellerIds.map(id => typeof id === 'string' ? id : (id._id || id.id || id.toString())).filter(Boolean);
		if (sellerIds.length > 0) {
			const usersMap = {};
			for (let i = 0; i < sellerIds.length; i += 10) {
				const batch = sellerIds.slice(i, i + 10);
				if (batch.length > 0) {
					const usersSnapshot = await db.collection("users").where("__name__", "in", batch).get();
					usersSnapshot.forEach(doc => {
						const data = doc.data();
						usersMap[doc.id] = { _id: doc.id, name: data.name, avatar: data.avatar, rating: data.rating };
					});
				}
			}

			listings = listings.map(listing => ({
				...listing,
				seller: usersMap[listing.seller] || { _id: listing.seller, name: "Unknown" }
			}));
		}

		return NextResponse.json({
			listings,
			pagination: {
				total,
				pages: Math.ceil(total / limit),
				current: page,
			},
		});
	} catch (error) {
		console.error("Listings fetch error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch listings" },
			{ status: 500 }
		);
	}
}

export async function POST(request) {
	try {
		const {
			title,
			description,
			category,
			price,
			metrics,
			details,
			images,
			thumbnail,
			userId,
		} = await request.json();

		if (!userId) {
			return NextResponse.json(
				{ message: "Unauthorized" },
				{ status: 401 }
			);
		}

		const user = await getUserById(userId);
		if (!user) {
			return NextResponse.json(
				{ message: "User not found" },
				{ status: 404 }
			);
		}

		const listing = await createListing({
			title,
			description,
			category,
			price,
			metrics,
			details,
			images,
			thumbnail: thumbnail || images?.[0],
			seller: userId,
		});

		// Add listing to user's listings
		await addListingToUser(userId, listing._id);

		// Send email notification to admin
		try {
			const adminsSnapshot = await db.collection("users").where("role", "==", "admin").get();
			
			if (!adminsSnapshot.empty) {
				const listingLink = `${
					process.env.NEXT_PUBLIC_APP_URL
				}/listing/${listing.slug || listing._id}`;
				const emailContent = generateNewListingNotification(
					listing.title,
					user.name,
					listingLink
				);

				const adminEmails = [];
				adminsSnapshot.forEach(doc => adminEmails.push(doc.data().email));

				await Promise.all(
					adminEmails.map((email) =>
						sendEmail({
							to: email,
							subject: `New Listing Requires Review: ${listing.title}`,
							html: emailContent,
						})
					)
				);
			}
		} catch (emailError) {
			console.error(
				"Failed to send new listing notification:",
				emailError
			);
		}

		return NextResponse.json({ success: true, listing }, { status: 201 });
	} catch (error) {
		console.error("Listing creation error:", error);
		return NextResponse.json(
			{ error: "Failed to create listing" },
			{ status: 500 }
		);
	}
}
