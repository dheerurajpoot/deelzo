import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Listing from "@/models/Listing";
import User from "@/models/User";
import mongoose from "mongoose";
import { getDataFromToken } from "@/lib/auth";


function extractParamFromRequest(request) {
	const url = new URL(request.url, process.env.NEXT_PUBLIC_APP_URL);
	const pathParts = url.pathname.split("/");
	return decodeURIComponent(pathParts[pathParts.length - 1]);
}

export async function GET(request) {
	try {
		await connectDB();
		const slug = extractParamFromRequest(request);
		let listing;
		if (mongoose.isValidObjectId(slug)) {
			listing = await Listing.findById(slug)
				.populate("seller")
				.populate({
					path: "bids",
					populate: {
						path: "bidder",
						select: "name email phone",
					},
				});
			return NextResponse.json(listing);
		}

		listing = await Listing.findOne({ slug })
			.populate("seller")
			.populate({
				path: "bids",
				populate: {
					path: "bidder",
					select: "name email phone",
				},
			});

		if (!listing) {
			return NextResponse.json(
				{ message: "Listing not found" },
				{ status: 404 }
			);
		}

		await Listing.findByIdAndUpdate(listing._id, {
			$inc: { views: 1 },
		});

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

		await connectDB();
		const user = await User.findById(userId);
		let listing;
		if (mongoose.isValidObjectId(slug)) {
			listing = await Listing.findById(slug);
		} else {
			listing = await Listing.findOne({ slug });
		}

		if (
			!listing &&
			(listing.seller.toString() !== userId || user.role !== "admin")
		) {
			return NextResponse.json(
				{ message: "Unauthorized" },
				{ status: 401 }
			);
		}

		const updated = await Listing.findByIdAndUpdate(
			listing._id,
			updateData,
			{
				new: true,
			}
		);
		if (updated.status === "sold") {
			const user = await User.findById(userId);
			user.totalSales += listing.price;
			await user.save();
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

		await connectDB();

		const user = await User.findById(userId);
		const listing = await Listing.findById(slug);
		if (
			(!listing && listing.seller.toString() !== userId) ||
			user.role !== "admin"
		) {
			return NextResponse.json(
				{ message: "Unauthorized" },
				{ status: 401 }
			);
		}

		await Listing.findByIdAndDelete(listing._id);
		await User.findByIdAndUpdate(userId, {
			$pull: { listings: listing._id },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Listing deletion error:", error);
		return NextResponse.json(
			{ message: "Failed to delete listing" },
			{ status: 500 }
		);
	}
}
