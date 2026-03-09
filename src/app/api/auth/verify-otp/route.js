import { getUserByEmail, updateUser } from "@/lib/db/users";

export async function POST(request) {
	try {
		const { email, otp } = await request.json();
		const user = await getUserByEmail(email);
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
		
		const expiryDate = user.emailVerificationExpiry.toDate ? user.emailVerificationExpiry.toDate() : new Date(user.emailVerificationExpiry);
		
		if (expiryDate < new Date())
			return Response.json(
				{ success: false, message: "Code expired." },
				{ status: 422 }
			);
		if (user.emailVerificationOtp !== otp)
			return Response.json(
				{ success: false, message: "Incorrect verification code." },
				{ status: 400 }
			);
		
		await updateUser(user._id, {
			isEmailVerified: true,
			emailVerificationOtp: null,
			emailVerificationExpiry: null
		});

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
