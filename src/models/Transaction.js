import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		plan: {
			type: String,
			enum: ["premium", "daily"], // Free plan doesn't need transaction
			required: true,
		},
		amount: {
			type: Number,
			required: true,
		},
		currency: {
			type: String,
			default: "USD",
		},
		transactionId: {
			type: String,
			required: true,
			unique: true,
		},
		paymentMethod: {
			type: String,
			enum: ["binance", "qr"],
			required: true,
		},
		status: {
			type: String,
			enum: ["pending", "approved", "rejected"],
			default: "pending",
		},
	},
	{ timestamps: true }
);

export default mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema);
