import mongoose from "mongoose";

const slugifyTitle = (title) =>
	title
		?.toString()
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-");

const blogSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
		},
		slug: {
			type: String,
			unique: true,
			index: true,
		},
		content: {
			type: String, // Rich text HTML
			required: true,
		},
		image: {
			type: String,
		},
		category: {
			type: String,
			default: "General",
		},
		seo: {
			metaTitle: String,
			metaDescription: String,
			keywords: String,
		},
		author: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		status: {
			type: String,
			enum: ["pending", "published", "rejected", "draft"],
			default: "pending",
		},
		rejectionReason: {
			type: String,
		},
		views: {
			type: Number,
			default: 0,
		},
	},
	{ timestamps: true }
);

// Helper function to ensure slug uniqueness
const ensureUniqueSlug = async (slug, excludeId = null, BlogModel = null) => {
	if (!slug) return slug;

	let uniqueSlug = slug;
	let counter = 1;

	// Get the model - try different ways to access it
	const Blog =
		BlogModel || mongoose.models.Blog || mongoose.connection?.models?.Blog;

	if (!Blog) {
		// If model is not available, return slug as-is (will be validated in API)
		return slug;
	}

	while (true) {
		const query = { slug: uniqueSlug };
		if (excludeId) {
			query._id = { $ne: excludeId };
		}

		const existingBlog = await Blog.findOne(query);

		if (!existingBlog) {
			return uniqueSlug;
		}

		uniqueSlug = `${slug}-${counter}`;
		counter++;

		// Safety limit to prevent infinite loops
		if (counter > 1000) {
			return uniqueSlug;
		}
	}
};

blogSchema.pre("save", async function (next) {
	try {
		// Only auto-generate slug if it's not provided
		if (!this.slug && this.title) {
			const baseSlug = slugifyTitle(this.title);
			if (baseSlug) {
				this.slug = await ensureUniqueSlug(
					baseSlug,
					this._id,
					this.constructor
				);
			}
		} else if (this.slug) {
			// If slug is provided, ensure it's unique
			this.slug = await ensureUniqueSlug(
				this.slug,
				this._id,
				this.constructor
			);
		}
		next();
	} catch (error) {
		next(error);
	}
});

// Update slug on title change during update ONLY if slug is not explicitly provided
blogSchema.pre("findOneAndUpdate", async function (next) {
	try {
		const update = this.getUpdate() || {};
		const title = update.title || update.$set?.title;
		const slug = update.slug || update.$set?.slug;

		// Get the model
		const Blog =
			this.model ||
			mongoose.models.Blog ||
			mongoose.connection?.models?.Blog;

		// Only auto-generate slug if title changed and slug is not provided
		if (title && !slug && Blog) {
			const newSlug = slugifyTitle(title);
			if (newSlug) {
				const excludeId = this.getQuery()._id || this.getQuery()["_id"];
				const uniqueSlug = await ensureUniqueSlug(
					newSlug,
					excludeId,
					Blog
				);

				if (update.$set) {
					update.$set.slug = uniqueSlug;
				} else {
					update.slug = uniqueSlug;
				}
				this.setUpdate(update);
			}
		} else if (slug && Blog) {
			// If slug is explicitly provided, ensure uniqueness
			const excludeId = this.getQuery()._id || this.getQuery()["_id"];
			const uniqueSlug = await ensureUniqueSlug(slug, excludeId, Blog);

			if (update.$set) {
				update.$set.slug = uniqueSlug;
			} else {
				update.slug = uniqueSlug;
			}
			this.setUpdate(update);
		}
		next();
	} catch (error) {
		next(error);
	}
});

export default mongoose.models.Blog || mongoose.model("Blog", blogSchema);
