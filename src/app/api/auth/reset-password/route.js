import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(request) {
	try {
		await connectDB();
		const { email, token, password } = await request.json();
		const tokenHash = crypto
			.createHash("sha256")
			.update(token)
			.digest("hex");
		const user = await User.findOne({
			email,
			passwordResetToken: tokenHash,
		});
		if (
			!user ||
			!user.passwordResetExpiry ||
			user.passwordResetExpiry < new Date()
		) {
			return Response.json(
				{
					success: false,
					message: "Reset link is invalid or expired.",
				},
				{ status: 400 }
			);
		}
		user.password = await bcrypt.hash(password, 10);
		user.passwordResetToken = undefined;
		user.passwordResetExpiry = undefined;
		await user.save();
		return Response.json({
			success: true,
			message: "Password reset. You can now log in.",
		});
	} catch {
		return Response.json(
			{ success: false, message: "Server error." },
			{ status: 500 }
		);
	}
}
