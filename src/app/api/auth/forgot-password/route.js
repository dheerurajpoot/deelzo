import { getUserByEmail, updateUser } from "@/lib/db/users";
import { sendEmail, generatePasswordResetEmail } from "@/lib/emails";
import crypto from "crypto";

export async function POST(request) {
	try {
		const { email } = await request.json();
		const user = await getUserByEmail(email);
		if (user) {
			const token = crypto.randomBytes(32).toString("hex");
			const tokenHash = crypto
				.createHash("sha256")
				.update(token)
				.digest("hex");
			
			const passwordResetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
			await updateUser(user._id, {
				passwordResetToken: tokenHash,
				passwordResetExpiry
			});

			const resetLink = `${
				process.env.NEXT_PUBLIC_APP_URL
			}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
			const html = generatePasswordResetEmail(resetLink);
			await sendEmail({
				to: email,
				subject: `Reset Your Password - ${process.env.COMPANY_NAME}`,
				html,
			});
		}
		// Always return success to avoid leaking info
		return Response.json({
			success: true,
			message:
				"If an account with that email exists, you will receive password reset instructions.",
		});
	} catch (error) {
		return Response.json(
			{ success: false, message: "Server error." },
			{ status: 500 }
		);
	}
}
