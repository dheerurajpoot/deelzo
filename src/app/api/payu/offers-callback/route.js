import { NextResponse } from "next/server";
import crypto from "crypto";
import { sendEmail } from "@/lib/emails";

export async function POST(request) {
	try {
		// PayU sends data as URL-encoded form data
		const formData = await request.formData();
		
		const status = formData.get("status");
		const firstname = formData.get("firstname");
		const amount = formData.get("amount");
		const txnid = formData.get("txnid");
		const hash = formData.get("hash");
		const key = formData.get("key");
		const productinfo = formData.get("productinfo");
		const email = formData.get("email");
		
		const udf1 = formData.get("udf1"); // userId
		const udf2 = formData.get("udf2"); // productId
		const udf3 = formData.get("udf3"); // JSON order context
		const udf4 = formData.get("udf4");
		const udf5 = formData.get("udf5");
		
		const additionalCharges = formData.get("additionalCharges") || "";

		const salt = process.env.PAYU_MERCHANT_SALT;

		if (!salt) {
			console.error("PayU Salt is missing");
			return NextResponse.redirect(new URL("/offers?payment=error", request.url));
		}

		// Calculate reverse hash to verify authenticity
		let reverseHashString = "";
		if (additionalCharges) {
			reverseHashString = `${additionalCharges}|${salt}|${status}||||||${udf5 || ""}|${udf4 || ""}|${udf3 || ""}|${udf2 || ""}|${udf1 || ""}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
		} else {
			reverseHashString = `${salt}|${status}||||||${udf5 || ""}|${udf4 || ""}|${udf3 || ""}|${udf2 || ""}|${udf1 || ""}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
		}
		
		const calculatedHash = crypto.createHash("sha512").update(reverseHashString).digest("hex");

		if (calculatedHash !== hash) {
			console.error("PayU Hash mismatch in offers callback", { received: hash, calculated: calculatedHash });
			return NextResponse.redirect(new URL("/offers?payment=failed-hash", request.url));
		}

		// Check if transaction was successful
		if (status === "success") {
			// Instead of creating a database order, immediately send the delivery email and redirect.
			try {
				if (email) {
					const baseUrl = new URL(request.url).origin;
					await sendEmail({
						to: email,
						subject: `Your 1000+ Hindi E-Books Combo is Ready! 🎉`,
						html: `
						<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
							<h2 style="color: #e11d48; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">Payment Successful!</h2>
							<p>Hi ${firstname || 'there'},</p>
							<p>Thank you for purchasing the <strong>1000+ Hindi E-Books and Audio Books Combo</strong>. Your secure lifetime access has been successfully unlocked.</p>
							<p>You can instantly view, listen, and download all your books by accessing your private dashboard link below:</p>
							<div style="text-align: center; margin: 35px 0;">
								<a href="${baseUrl}/offers/success" style="background-color: #e11d48; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Access My Books Now -></a>
							</div>
							<p><strong>Important:</strong> We recommend adding a shortcut of the Google Drive folders to your own Drive so it's always easy to find.</p>
							<p>If you experience any issues, simply reply to this email for premium support.</p>
							<p>Happy Reading & Listening,<br/><strong>The Knowledge Team</strong></p>
						</div>
						`
					});
				}
			} catch (emailError) {
				console.error("Failed to send offers delivery email:", emailError);
			}

			if(udf2 === "adsense_course_299") {
				return NextResponse.redirect(new URL("/google-adsense/success", request.url), { status: 303 });
			}
			
			// Redirect user to the success dashboard using 303 See Other
			return NextResponse.redirect(new URL("/offers/success", request.url), { status: 303 });
		} else {
			// Payment failed or is pending
			console.log(`PayU Offers Payment ${status} for txnid: ${txnid}`);
			return NextResponse.redirect(new URL(`/offers?payment=failed`, request.url), { status: 303 });
		}

	} catch (error) {
		console.error("Error processing PayU offers callback:", error);
		return NextResponse.redirect(new URL("/offers?payment=failed-system", request.url), { status: 303 });
	}
}
