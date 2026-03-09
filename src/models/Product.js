import mongoose from "mongoose";
import User from "./User";

const productSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: [true, "Title is required"],
			trim: true,
			maxlength: [200, "Title cannot exceed 200 characters"],
		},
		slug: {
			type: String,
			unique: true,
			index: true,
		},
		description: {
			type: String,
			required: [true, "Description is required"],
			maxlength: [5000, "Description cannot exceed 5000 characters"],
		},
		shortDescription: {
			type: String,
			maxlength: [300, "Short description cannot exceed 300 characters"],
		},
		category: {
			type: String,
			required: [true, "Category is required"],
			enum: [
				// Product Types as Categories
				"script",
				"tool",
				"course",
				"service",
				"template",
				"ebook",
				// Tech Categories
				"wordpress",
				"react",
				"nextjs",
				"nodejs",
				"python",
				"php",
				// Other Categories
				"automation",
				"seo",
				"marketing",
				"design",
				"adsense",
				"monetization",
				"other",
			],
		},
		price: {
			type: Number,
			required: [true, "Price is required"],
			min: [0, "Price cannot be negative"],
		},
		comparePrice: {
			type: Number,
			min: [0, "Compare price cannot be negative"],
		},
		currency: {
			type: String,
			default: "USD",
			enum: ["USD", "EUR", "INR", "USDT"],
		},
		images: [
			{
				type: String,
			},
		],
		thumbnail: {
			type: String,
		},
		files: [
			{
				name: String,
				url: String,
				size: String,
				type: String,
			},
		],
		downloadOptions: {
			type: {
				type: String,
				enum: ["upload", "link"],
				default: "upload",
			},
			file: new mongoose.Schema(
				{
					name: { type: String, default: "" },
					url: { type: String, default: "" },
					size: { type: String, default: "" },
					type: { type: String, default: "" },
					imageKitFileId: { type: String, default: "" }, // Store ImageKit file ID
				},
				{ _id: false },
			),
			link: {
				type: String,
				default: "",
			},
		},
		demoUrl: {
			type: String,
		},
		videoUrl: {
			type: String,
		},
		features: [
			{
				type: String,
				maxlength: [200, "Feature cannot exceed 200 characters"],
			},
		],
		requirements: [
			{
				type: String,
			},
		],
		tags: [
			{
				type: String,
				trim: true,
			},
		],
		status: {
			type: String,
			enum: ["draft", "active", "archived"],
			default: "draft",
		},
		stock: {
			type: Number,
			default: -1, // -1 means unlimited
			min: -1,
		},
		salesCount: {
			type: Number,
			default: 0,
		},
		rating: {
			average: {
				type: Number,
				default: 0,
				min: 0,
				max: 5,
			},
			count: {
				type: Number,
				default: 0,
			},
		},
		reviews: [
			{
				user: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User",
				},
				rating: Number,
				comment: String,
				createdAt: {
					type: Date,
					default: Date.now,
				},
			},
		],
		faqs: [
			{
				question: String,
				answer: String,
			},
		],
		seller: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		isFeatured: {
			type: Boolean,
			default: false,
		},
		isBestseller: {
			type: Boolean,
			default: false,
		},
		discount: {
			type: {
				type: String,
				enum: ["percentage", "fixed"],
			},
			value: Number,
			startDate: Date,
			endDate: Date,
		},
		metadata: {
			version: String,
			lastUpdated: Date,
			changelog: String,
			documentation: String,
			supportInfo: String,
		},
	},
	{
		timestamps: true,
	},
);

// Generate slug before saving
productSchema.pre("save", function (next) {
	if (!this.slug) {
		this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
	}
	next();
});

// Virtual for discounted price
productSchema.virtual("discountedPrice").get(function () {
	if (this.discount && this.discount.value > 0) {
		const now = new Date();
		if (
			(!this.discount.startDate || this.discount.startDate <= now) &&
			(!this.discount.endDate || this.discount.endDate >= now)
		) {
			if (this.discount.type === "percentage") {
				return (
					Math.round(
						this.price * (1 - this.discount.value / 100) * 100,
					) / 100
				);
			} else {
				return Math.max(0, this.price - this.discount.value);
			}
		}
	}
	return this.price;
});

// Index for search
productSchema.index({
	title: "text",
	description: "text",
	tags: "text",
});

const Product =
	mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
