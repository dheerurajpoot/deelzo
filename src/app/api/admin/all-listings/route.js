import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Listing from "@/models/Listing";
import User from "@/models/User";
import { sendEmail } from "@/lib/emails";
import { generateListingStatusUpdate } from "@/lib/emails";

export async function GET(request) {
	try {
		const { searchParams } = new URL(request.url);
		const adminId = searchParams.get("adminId");
		const status = searchParams.get("status");

		await connectDB();

		const admin = await User.findById(adminId);
		if (!admin || admin.role !== "admin") {
			return NextResponse.json(
				{ message: "Unauthorized" },
				{ status: 401 }
			);
		}

		const query = status ? { status } : {};
		const listings = await Listing.find(query)
			.populate("seller")
			.sort({ createdAt: -1 });

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

		await connectDB();
		const adminNote = "Have an issue, contact to admin on +917755089819";

		const admin = await User.findById(adminId);
		if (!admin || admin.role !== "admin") {
			return NextResponse.json(
				{ MessageChannel: "Unauthorized" },
				{ status: 401 }
			);
		}

		if (action === "pending") {
			const listing = await Listing.findByIdAndUpdate(listingId, {
				status: "pending",
			}).populate("seller", "name email");
			// Send email notification to seller about status update
			const emailContent = generateListingStatusUpdate(
				listing.title,
				"pending",
				adminNote
			);

			await sendEmail({
				to: listing.seller.email,
				subject: `Your Listing Status: ${
					"pending".charAt(0).toUpperCase() + "pending".slice(1)
				} - ${listing.title}`,
				html: emailContent,
			});
		} else if (action === "active") {
			const listing = await Listing.findByIdAndUpdate(listingId, {
				status: "active",
			}).populate("seller", "name email");
			// Send email notification to seller about status update
			const emailContent = generateListingStatusUpdate(
				listing.title,
				"active",
				adminNote
			);

			await sendEmail({
				to: listing.seller.email,
				subject: `Your Listing Status: ${
					"active".charAt(0).toUpperCase() + "active".slice(1)
				} - ${listing.title}`,
				html: emailContent,
			});
		} else if (action === "sold") {
			const listing = await Listing.findByIdAndUpdate(listingId, {
				status: "sold",
			}).populate("seller", "name email");
			const user = await User.findById(listing.seller._id);
			user.totalSales += listing.price;
			await user.save();
			// Send email notification to seller about status update
			const emailContent = generateListingStatusUpdate(
				listing.title,
				"sold",
				adminNote
			);

			await sendEmail({
				to: listing.seller.email,
				subject: `Your Listing Status: ${
					"sold".charAt(0).toUpperCase() + "sold".slice(1)
				} - ${listing.title}`,
				html: emailContent,
			});
		} else if (action === "rejected") {
			const listing = await Listing.findByIdAndUpdate(listingId, {
				status: "rejected",
			}).populate("seller", "name email");
			// Send email notification to seller about status update
			const emailContent = generateListingStatusUpdate(
				listing.title,
				"rejected",
				adminNote
			);

			await sendEmail({
				to: listing.seller.email,
				subject: `Your Listing Status: ${
					"rejected".charAt(0).toUpperCase() + "rejected".slice(1)
				} - ${listing.title}`,
				html: emailContent,
			});
		} else if (action === "draft") {
			const listing = await Listing.findByIdAndUpdate(listingId, {
				status: "draft",
			}).populate("seller", "name email");
			// Send email notification to seller about status update
			const emailContent = generateListingStatusUpdate(
				listing.title,
				"draft",
				adminNote
			);

			await sendEmail({
				to: listing.seller.email,
				subject: `Your Listing Status: ${
					"draft".charAt(0).toUpperCase() + "draft".slice(1)
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
