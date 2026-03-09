import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			unique: true,
		},
		postLimit: {
			type: Number,
			required: true,
		},
		frequency: {
			type: String, // 'weekly', 'daily'
			required: true,
		},
		price: {
			type: Number,
			required: true,
		},
		description: {
			type: String,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{ timestamps: true }
);

export default mongoose.models.Plan || mongoose.model("Plan", planSchema);
