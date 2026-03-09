import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/admin";
import { getUserById, updateUser } from "@/lib/db/users";
import { sendEmail, generateListingStatusUpdate } from "@/lib/emails";

export async function GET(request) {
	try {
		const { searchParams } = new URL(request.url);
		const adminId = searchParams.get("adminId");
		const status = searchParams.get("status");

		const admin = await getUserById(adminId);
		if (!admin || admin.role !== "admin") {
			return NextResponse.json(
				{ message: "Unauthorized" },
				{ status: 401 }
			);
		}

		let listingsRef = db.collection("listings");
		if (status) {
			listingsRef = db.collection("listings").where("status", "==", status);
		}

		const snapshot = await listingsRef.get();
		let listings = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));

		listings.sort((a, b) => {
			const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
			const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
			return timeB - timeA;
		});

		// Populate seller
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
						usersMap[doc.id] = { _id: doc.id, name: data.name, email: data.email };
					});
				}
			}

			listings = listings.map(listing => ({
				...listing,
				seller: usersMap[listing.seller] || { _id: listing.seller, name: "Unknown" }
			}));
		}

		return NextResponse.json(listings);
	} catch (error) {
		console.error("Admin all listings fetch error:", error);
		return NextResponse.json(
			{ message: "Failed to fetch listings" },
			{ status: 500 }
		);
	}
}

export async function PUT(request) {
	try {
		const { listingId, action, adminId } = await request.json();

		const adminNote = "Have an issue, contact to admin on +917755089819";

		const admin = await getUserById(adminId);
		if (!admin || admin.role !== "admin") {
			return NextResponse.json(
				{ MessageChannel: "Unauthorized" },
				{ status: 401 }
			);
		}

		await db.collection("listings").doc(listingId).update({ status: action, updatedAt: new Date() });
		
		const listingDoc = await db.collection("listings").doc(listingId).get();
		const listing = { _id: listingDoc.id, ...listingDoc.data() };
		
		const seller = await getUserById(listing.seller);
		listing.seller = seller;

		if (["pending", "active", "sold", "rejected", "draft"].includes(action)) {
			if (action === "sold") {
				const currentTotalSales = seller.totalSales || 0;
				await updateUser(seller._id, { totalSales: currentTotalSales + listing.price });
			}

			const emailContent = generateListingStatusUpdate(
				listing.title,
				action,
				adminNote
			);

			await sendEmail({
				to: listing.seller.email,
				subject: `Your Listing Status: ${
					action.charAt(0).toUpperCase() + action.slice(1)
				} - ${listing.title}`,
				html: emailContent,
			});
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Admin listing action error:", error);
		return NextResponse.json(
			{ message: "Failed to perform action" },
			{ status: 500 }
		);
	}
}
