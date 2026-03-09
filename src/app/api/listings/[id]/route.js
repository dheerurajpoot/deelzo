import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/admin";
import { getListingByIdOrSlug, updateListing, deleteListing, incrementListingViews } from "@/lib/db/listings";
import { getUserById, removeListingFromUser, updateUser } from "@/lib/db/users";
import { getDataFromToken } from "@/lib/auth";

function extractParamFromRequest(request) {
	const url = new URL(request.url, process.env.NEXT_PUBLIC_APP_URL);
	const pathParts = url.pathname.split("/");
	return decodeURIComponent(pathParts[pathParts.length - 1]);
}

export async function GET(request) {
	try {
		const slug = extractParamFromRequest(request);
		let listing = await getListingByIdOrSlug(slug);

		if (!listing) {
			return NextResponse.json(
				{ message: "Listing not found" },
				{ status: 404 }
			);
		}

		// Increment views
		await incrementListingViews(listing._id);

		// Populate seller
		if (listing.seller) {
			const seller = await getUserById(listing.seller);
			if (seller) {
				listing.seller = {
					_id: seller._id,
					name: seller.name,
					avatar: seller.avatar,
					rating: seller.rating,
					createdAt: seller.createdAt
				};
			}
		}

		// Populate bids (fetch from bids collection)
		const bidsSnapshot = await db.collection("bids").where("listing", "==", listing._id).get();
		let bids = bidsSnapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
		
		// Populate bidders for bids
		if (bids.length > 0) {
			const rawBidderIds = [...new Set(bids.map(b => b.bidder))];
			const bidderIds = rawBidderIds.map(id => typeof id === 'string' ? id : (id._id || id.id || id.toString())).filter(Boolean);
			
			const biddersMap = {};
			for (let i = 0; i < bidderIds.length; i += 10) {
				const batch = bidderIds.slice(i, i + 10);
				if (batch.length > 0) {
					const biddersSnapshot = await db.collection("users").where("__name__", "in", batch).get();
					biddersSnapshot.forEach(doc => {
						const data = doc.data();
						biddersMap[doc.id] = { _id: doc.id, name: data.name, email: data.email, phone: data.phone };
					});
				}
			}

			bids = bids.map(bid => ({
				...bid,
				bidder: biddersMap[bid.bidder] || { _id: bid.bidder, name: "Unknown" }
			}));
		}

		listing.bids = bids;

		return NextResponse.json(listing);
	} catch (error) {
		console.error("Listing fetch error:", error);
		return NextResponse.json(
			{ message: "Failed to fetch listing" },
			{ status: 500 }
		);
	}
}

export async function PUT(request) {
	try {
		const {  ...updateData } = await request.json();
		const userId = await getDataFromToken(request);
		const slug = extractParamFromRequest(request);

		if (!userId) {
			return NextResponse.json(
				{ message: "Unauthorized" },
				{ status: 401 }
			);
		}

		const user = await getUserById(userId);
		let listing = await getListingByIdOrSlug(slug);

		if (
			!listing &&
			(listing.seller !== userId || user.role !== "admin")
		) {
			return NextResponse.json(
				{ message: "Unauthorized" },
				{ status: 401 }
			);
		}

		const updated = await updateListing(listing._id, updateData);

		if (updated.status === "sold") {
			const currentTotalSales = user.totalSales || 0;
			await updateUser(userId, {
				totalSales: currentTotalSales + updated.price
			});
		}

		return NextResponse.json({ success: true, listing: updated });
	} catch (error) {
		console.error("Listing update error:", error);
		return NextResponse.json(
			{ message: "Failed to update listing" },
			{ status: 500 }
		);
	}
}

export async function DELETE(request) {
	try {
		const slug = extractParamFromRequest(request);
		const { userId } = await request.json();

		if (!userId) {
			return NextResponse.json(
				{ message: "Unauthorized" },
				{ status: 401 }
			);
		}

		const user = await getUserById(userId);
		const listing = await getListingByIdOrSlug(slug);
		
		if (!listing || (listing.seller !== userId && user.role !== "admin")) {
			return NextResponse.json(
				{ message: "Unauthorized" },
				{ status: 401 }
			);
		}

		await deleteListing(listing._id);
		await removeListingFromUser(userId, listing._id);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Listing deletion error:", error);
		return NextResponse.json(
			{ message: "Failed to delete listing" },
			{ status: 500 }
		);
	}
}
