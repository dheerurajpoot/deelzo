import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { generateOTPEmail, sendEmail } from "@/lib/emails";

export async function POST(request) {
	try {
		await connectDB();

		const { name, email, password, phone } = await request.json();

		// Check if user exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return Response.json(
				{ success: false, message: "Email already registered" },
				{ status: 400 }
			);
		}

		// Validate phone number
		if (
			!phone ||
			typeof phone !== "string" ||
			!phone.startsWith("+") ||
			phone.length < 10
		) {
			return Response.json(
				{
					success: false,
					message:
						"Please provide a valid phone number with country code, e.g. +917897315148",
				},
				{ status: 400 }
			);
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create user
		const user = await User.create({
			name,
			email,
			password: hashedPassword,
			phone,
		});

		function generateOTP() {
			return Math.floor(100000 + Math.random() * 900000).toString();
		}

		const otp = generateOTP();
		const emailVerificationExpiry = new Date(Date.now() + 3600000);
		await User.updateOne(
			{ _id: user._id },
			{ emailVerificationOtp: otp, emailVerificationExpiry }
		);
		const emailHtml = generateOTPEmail(otp);
		await sendEmail({
			to: email,
			subject: `Verify Your Email - ${process.env.COMPANY_NAME}`,
			html: emailHtml,
		});

		return Response.json({
			success: true,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
			},
			next: "verify-otp",
		});
	} catch (error) {
		console.error("Signup error:", error);
		return Response.json(
			{ success: false, message: "Signup failed" },
			{ status: 500 }
		);
	}
}
