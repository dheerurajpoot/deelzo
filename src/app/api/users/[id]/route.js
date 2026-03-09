import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

function extractIdFromRequest(request) {
	const url = new URL(request.url, process.env.NEXT_PUBLIC_APP_URL);
	const pathParts = url.pathname.split("/");
	return pathParts[pathParts.length - 1];
}

export async function GET(request) {
	try {
		await connectDB();
		const id = extractIdFromRequest(request);

		const user = await User.findById(id)
			.populate("listings")
			.select("-password");

		if (!user) {
			return NextResponse.json(
				{ message: "User not found" },
				{ status: 404 }
			);
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
		await connectDB();
		const id = extractIdFromRequest(request);
		const { userId, ...updateData } = await request.json();

		if (userId !== id) {
			return NextResponse.json(
				{ message: "Unauthorized" },
				{ status: 401 }
			);
		}

		const user = await User.findByIdAndUpdate(id, updateData, {
			new: true,
		});

		if (!user) {
			return NextResponse.json(
				{ message: "User not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({ success: true, user });
	} catch (error) {
		console.error("User update error:", error);
		return NextResponse.json(
			{ message: "Failed to update user" },
			{ status: 500 }
		);
	}
}
