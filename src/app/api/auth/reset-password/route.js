import { getUserByEmail, updateUser } from "@/lib/db/users";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(request) {
	try {
		const { email, token, password } = await request.json();
		const tokenHash = crypto
			.createHash("sha256")
			.update(token)
			.digest("hex");
		const user = await getUserByEmail(email);
		
		if (
			!user ||
			user.passwordResetToken !== tokenHash ||
			!user.passwordResetExpiry ||
			new Date(user.passwordResetExpiry.toDate ? user.passwordResetExpiry.toDate() : user.passwordResetExpiry) < new Date()
		) {
			return Response.json(
				{
					success: false,
					message: "Reset link is invalid or expired.",
				},
				{ status: 400 }
			);
		}
		const newPassword = await bcrypt.hash(password, 10);
		
		await updateUser(user._id, {
			password: newPassword,
			passwordResetToken: null,
			passwordResetExpiry: null,
		});

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
