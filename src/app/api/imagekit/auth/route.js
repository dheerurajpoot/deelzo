import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET() {
	try {
		const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
		const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
		const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

		if (!publicKey || !privateKey || !urlEndpoint) {
			return NextResponse.json(
				{ error: "ImageKit environment variables are not configured" },
				{ status: 500 }
			);
		}

		const token = crypto.randomBytes(16).toString("hex");
		const expire = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes
		const signature = crypto
			.createHmac("sha1", privateKey)
			.update(`${token}${expire}`)
			.digest("hex");

		return NextResponse.json({
			token,
			expire,
			signature,
			publicKey,
			urlEndpoint,
		});
	} catch (error) {
		console.error("ImageKit auth error:", error);
		return NextResponse.json(
			{ error: "Failed to generate ImageKit auth" },
			{ status: 500 }
		);
	}
}
