import { db } from "@/lib/firebase/admin";
import { createBid } from "@/lib/db/bids";
import { getListingByIdOrSlug } from "@/lib/db/listings";
import { getUserById } from "@/lib/db/users";
import { sendEmail, generateNewBidEmail } from "@/lib/emails";

export async function POST(request) {
	try {
		const { listingId, bidderId, amount, message } = await request.json();

		const bid = await createBid({
			listing: listingId,
			bidder: bidderId,
			amount,
			message,
		});

		// Add bid to listing using FieldValue arrayUnion
		const listingParams = await getListingByIdOrSlug(listingId);
		if (listingParams) {
			const { FieldValue } = require("firebase-admin/firestore");
			await db.collection("listings").doc(listingParams._id).update({
				bids: FieldValue.arrayUnion(bid._id)
			});

			const seller = await getUserById(listingParams.seller);
			const bidder = await getUserById(bidderId);

			if (seller && bidder && seller._id !== bidderId) {
				const listingLink = `${process.env.NEXT_PUBLIC_APP_URL}/listing/${listingParams.slug || listingParams._id}`;
				const emailContent = generateNewBidEmail(
					listingParams.title,
					amount,
					bidder.name,
					listingLink
				);

				await sendEmail({
					to: seller.email,
					subject: `New Bid on Your Listing: ${listingParams.title}`,
					html: emailContent,
				});
			}
		}

		return Response.json({ bid, success: true, message: "Bid placed!" });
	} catch (error) {
		console.error("Bid creation error:", error);
		return Response.json(
			{ success: false, message: "Failed to place bid" },
			{ status: 500 }
		);
	}
}

export async function GET(request) {
	try {
		const { searchParams } = new URL(request.url);
		const listingId = searchParams.get("listingId");

		const snapshot = await db.collection("bids")
			.where("listing", "==", listingId)
			.get();

		let bids = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
		
		bids.sort((a, b) => {
			const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime();
			const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime();
			return timeB - timeA;
		});

		const rawBidderIds = [...new Set(bids.map(b => b.bidder))];
		const bidderIds = rawBidderIds.map(id => typeof id === 'string' ? id : (id._id || id.id || id.toString())).filter(Boolean);
		if (bidderIds.length > 0) {
			const usersMap = {};
			for (let i = 0; i < bidderIds.length; i += 10) {
				const batch = bidderIds.slice(i, i + 10);
				if (batch.length > 0) {
					const usersSnapshot = await db.collection("users").where("__name__", "in", batch).get();
					usersSnapshot.forEach(doc => {
						const data = doc.data();
						usersMap[doc.id] = { _id: doc.id, name: data.name, avatar: data.avatar, rating: data.rating };
					});
				}
			}

			bids = bids.map(bid => ({
				...bid,
				bidder: usersMap[bid.bidder] || { _id: bid.bidder, name: "Unknown" }
			}));
		}

		return Response.json(bids);
	} catch (error) {
		console.error("Fetch bids error:", error);
		return Response.json(
			{ success: false, message: "Failed to fetch bids" },
			{ status: 500 }
		);
	}
}
