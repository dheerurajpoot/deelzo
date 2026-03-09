import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request) {
	try {
		await connectDB();
		const { email, otp } = await request.json();
		const user = await User.findOne({ email });
		if (!user)
			return Response.json(
				{ success: false, message: "User not found." },
				{ status: 404 }
			);
		if (!user.emailVerificationOtp || !user.emailVerificationExpiry)
			return Response.json(
				{ success: false, message: "No OTP set for this user." },
				{ status: 422 }
			);
		if (user.emailVerificationExpiry < new Date())
			return Response.json(
				{ success: false, message: "Code expired." },
				{ status: 422 }
			);
		if (user.emailVerificationOtp !== otp)
			return Response.json(
				{ success: false, message: "Incorrect verification code." },
				{ status: 400 }
			);
		user.isEmailVerified = true;
		user.emailVerificationOtp = undefined;
		user.emailVerificationExpiry = undefined;
		await user.save();
		return Response.json({
			success: true,
			message: "Account verified. You can now log in.",
		});
	} catch (error) {
		return Response.json(
			{ success: false, message: "Server error." },
			{ status: 500 }
		);
	}
}
