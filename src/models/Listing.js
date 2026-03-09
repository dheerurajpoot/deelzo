import mongoose from "mongoose";
import "./Bid.js";
import "./User.js";

const slugifyTitle = (title) =>
	title
		?.toString()
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-");

const listingSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		category: {
			type: String,
			enum: [
				"Website",
				"YouTube Channel",
				"Facebook Page",
				"Instagram Page",
				"TikTok Account",
				"Twitter Account",
				"Play Console",
				"AdSense Dashboard",
				"Shopify Store",
				"Dropshipping Store",
				"SaaS",
				"Mobile App",
				"Other",
			],
			required: true,
		},
		price: {
			type: Number,
			required: true,
			min: 0,
		},
		seller: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		images: [String],
		thumbnail: String,
		status: {
			type: String,
			enum: ["active", "sold", "draft", "pending", "rejected"],
			default: "pending",
		},
		metrics: {
			assetLink: String,
			country: String,
			monthlyRevenue: Number,
			monthlyTraffic: Number,
			followers: Number,
			subscribers: Number,
			engagement: Number,
			age: Number,
		},
		details: {
			niche: String,
			monetization: String,
			trafficSource: String,
			growthPotential: String,
			paymentReceived: String,
			adManager: String,
			domainProvider: String,
			domainExpiry: String,
			platform: String,
			issue: String,
		},

		views: {
			type: Number,
			default: 0,
		},
		favorites: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		],
		featured: {
			type: Boolean,
			default: false,
		},
		slug: {
			type: String,
			unique: true,
			index: true,
			sparse: true,
		},
		bids: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Bid",
			},
		],
		allowBidding: {
			type: Boolean,
			default: true,
		},
		minBidAmount: {
			type: Number,
			default: 0,
		},
	},
	{ timestamps: true }
);

listingSchema.pre("save", function (next) {
	if (!this.isModified("title") && this.slug) {
		return next();
	}

	const baseSlug = slugifyTitle(this.title);
	this.slug = baseSlug || this.slug;
	next();
});

listingSchema.pre("findOneAndUpdate", function (next) {
	const update = this.getUpdate() || {};
	const title = update.title || update.$set?.title;

	if (title) {
		const newSlug = slugifyTitle(title);
		if (update.$set) {
			update.$set.slug = newSlug;
		} else {
			update.slug = newSlug;
		}
		this.setUpdate(update);
	}

	next();
});

export default mongoose.models.Listing ||
	mongoose.model("Listing", listingSchema);
