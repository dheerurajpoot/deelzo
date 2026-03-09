import { connectDB } from "@/lib/mongodb";
import Bid from "@/models/Bid";
import Listing from "@/models/Listing";
import User from "@/models/User";
import { sendEmail } from "@/lib/emails";
import { generateNewBidEmail } from "@/lib/emails";

export async function POST(request) {
	try {
		await connectDB();

		const { listingId, bidderId, amount, message } = await request.json();

		// Create bid
		const bid = await Bid.create({
			listing: listingId,
			bidder: bidderId,
			amount,
			message,
		});

		// Add bid to listing and get the updated listing with seller info
		const listing = await Listing.findByIdAndUpdate(
			listingId,
			{
				$push: { bids: bid._id },
			},
			{ new: true }
		).populate("seller", "email name");

		// Get bidder info for the email
		const bidder = await User.findById(bidderId, "name");

		// Send email notification to seller if it's not their own bid
		if (listing.seller._id.toString() !== bidderId) {
			const listingLink = `${process.env.NEXT_PUBLIC_APP_URL}/listing/${listing.slug || listingId}`;
			const emailContent = generateNewBidEmail(
				listing.title,
				amount,
				bidder.name,
				listingLink
			);

			await sendEmail({
				to: listing.seller.email,
				subject: `New Bid on Your Listing: ${listing.title}`,
				html: emailContent,
			});
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
		await connectDB();

		const { searchParams } = new URL(request.url);
		const listingId = searchParams.get("listingId");

		const bids = await Bid.find({ listing: listingId })
			.populate("bidder", "name avatar rating")
			.sort({ createdAt: -1 });

		return Response.json(bids);
	} catch (error) {
		console.error("Fetch bids error:", error);
		return Response.json(
			{ success: false, message: "Failed to fetch bids" },
			{ status: 500 }
		);
	}
}
