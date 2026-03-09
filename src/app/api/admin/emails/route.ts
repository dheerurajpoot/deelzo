"use server";

import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/emails";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const {
			adminId,
			to,
			subject,
			html,
			listingId,
			template,
		}: {
			adminId?: string;
			to?: string;
			subject?: string;
			html?: string;
			listingId?: string;
			template?: string;
		} = body || {};

		if (!adminId) {
			return NextResponse.json(
				{ success: false, error: "adminId is required" },
				{ status: 400 }
			);
		}

		if (!to || !subject || !html) {
			return NextResponse.json(
				{ success: false, error: "to, subject and html are required" },
				{ status: 400 }
			);
		}

		const result = await sendEmail({ to, subject, html });

		if (!result.success) {
			return NextResponse.json(
				{ success: false, error: "Failed to send email" },
				{ status: 500 }
			);
		}

		return NextResponse.json({
			success: true,
			listingId,
			template,
		});
	} catch (error) {
		console.error("Admin email send failed:", error);
		return NextResponse.json(
			{ success: false, error: "Internal server error" },
			{ status: 500 }
		);
	}
}
