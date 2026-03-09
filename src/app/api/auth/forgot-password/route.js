import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { sendEmail, generatePasswordResetEmail } from "@/lib/emails";
import crypto from "crypto";

export async function POST(request) {
	try {
		await connectDB();
		const { email } = await request.json();
		const user = await User.findOne({ email });
		if (user) {
			const token = crypto.randomBytes(32).toString("hex");
			const tokenHash = crypto
				.createHash("sha256")
				.update(token)
				.digest("hex");
			user.passwordResetToken = tokenHash;
			user.passwordResetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
			await user.save();
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
