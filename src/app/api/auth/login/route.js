import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(request) {
	try {
		await connectDB();

		const { email, password } = await request.json();

		// Find user
		const user = await User.findOne({ email });
		if (!user) {
			return NextResponse.json(
				{ success: false, message: "User not found" },
				{ status: 401 }
			);
		}
		if (!user.isEmailVerified) {
			return NextResponse.json(
				{
					success: false,
					message:
						"Account not verified. Please check your email for the verification code.",
				},
				{ status: 401 }
			);
		}

		// Check password
		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			return NextResponse.json(
				{ success: false, message: "Wrong Password" },
				{ status: 401 }
			);
		}

		const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
			expiresIn: "30d",
		});

		const response = NextResponse.json({
			success: true,
			user: {
				_id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				token,
			},
			message: "Login successful",
		});

		response.cookies.set("token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			maxAge: 30 * 24 * 60 * 60 * 1000,
		});
		response.cookies.set("userRole", user.role, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			maxAge: 30 * 24 * 60 * 60 * 1000,
		});
		return response;
	} catch (error) {
		console.error("Login error:", error);
		return NextResponse.json(
			{ success: false, message: "Login failed" },
			{ status: 500 }
		);
	}
}
