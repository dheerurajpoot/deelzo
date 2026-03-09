import mongoose from "mongoose";
import "./Listing.js";

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
		},
		password: {
			type: String,
		},
		avatar: String,
		bio: String,
		phone: String,
		location: String,
		company: String,
		role: {
			type: String,
			enum: ["user", "admin"],
			default: "user",
		},
		verified: {
			type: Boolean,
			default: false,
		},
		isEmailVerified: {
			type: Boolean,
			default: false,
		},
		isBlocked: {
			type: Boolean,
			default: false,
		},
		totalSales: {
			type: Number,
			default: 0,
		},

		rating: {
			type: Number,
			default: 0,
			min: 0,
			max: 5,
		},
		reviews: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Review",
			},
		],
		listings: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Listing",
			},
		],

		emailVerificationOtp: String,
		emailVerificationExpiry: Date,
		passwordResetToken: String,
		passwordResetExpiry: Date,
		currentPlan: {
			type: String,
			enum: ["free", "premium", "daily"],
			default: "free",
		},
		planExpiry: Date,
		postCount: {
			type: Number,
			default: 0,
		},
		lastPostDate: Date,
		periodStartDate: {
			type: Date,
			default: Date.now,
		},
	},
	{ timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
