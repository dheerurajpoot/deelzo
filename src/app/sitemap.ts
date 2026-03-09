import { MetadataRoute } from "next";
import { db } from "@/lib/firebase/admin";
import { BASE_URL as baseUrl } from "@/lib/constant";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const staticPages: MetadataRoute.Sitemap = [
		{
			url: baseUrl,
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 1.0,
		},
		{
			url: `${baseUrl}/marketplace`,
			lastModified: new Date(),
			changeFrequency: "hourly",
			priority: 0.9,
		},
		{
			url: `${baseUrl}/shop`,
			lastModified: new Date(),
			changeFrequency: "hourly",
			priority: 0.9,
		},
		{
			url: `${baseUrl}/about`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.8,
		},
		{
			url: `${baseUrl}/contact`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.7,
		},
		{
			url: `${baseUrl}/guide`,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 0.8,
		},
		{
			url: `${baseUrl}/terms`,
			lastModified: new Date(),
			changeFrequency: "yearly",
			priority: 0.5,
		},
		{
			url: `${baseUrl}/privacy`,
			lastModified: new Date(),
			changeFrequency: "yearly",
			priority: 0.5,
		},
	];

	let listingPages: MetadataRoute.Sitemap = [];

	try {
		const snapshot = await db.collection("listings")
			.where("status", "in", ["active", "sold"])
			.get();
			
		const listings = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() } as any));

		listingPages = listings.map((listing) => {
			const updatedAt = listing.updatedAt?.toDate ? listing.updatedAt.toDate() : (listing.updatedAt ? new Date(listing.updatedAt) : new Date());
			return {
				url: `${baseUrl}/marketplace/${listing.slug || listing._id}`,
				lastModified: updatedAt,
				changeFrequency: "daily" as const,
				priority: 0.8,
			}
		});
	} catch (error) {
		console.error("Error generating sitemap:", error);
	}

	let blogPages: MetadataRoute.Sitemap = [];

	try {
		const snapshot = await db.collection("blogs")
			.where("status", "==", "published")
			.get();
			
		const blogs = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() } as any));

		blogPages = blogs.map((blog) => {
			const updatedAt = blog.updatedAt?.toDate ? blog.updatedAt.toDate() : (blog.updatedAt ? new Date(blog.updatedAt) : new Date());
			return {
				url: `${baseUrl}/blogs/${blog.slug || blog._id}`,
				lastModified: updatedAt,
				changeFrequency: "daily" as const,
				priority: 0.8,
			}
		});
	} catch (error) {
		console.error("Error generating blog sitemap:", error);
	}

	let productPages: MetadataRoute.Sitemap = [];

	try {
		const snapshot = await db.collection("products")
			.where("status", "==", "active")
			.get();
			
		const products = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() } as any));

		productPages = products.map((product) => {
			let priority = 0.7; 
			
			if (product.isFeatured) priority = Math.min(priority + 0.2, 1.0);
			if (product.isBestseller) priority = Math.min(priority + 0.1, 1.0);
			if (product.salesCount > 100) priority = Math.min(priority + 0.1, 1.0);
			else if (product.salesCount > 50) priority = Math.min(priority + 0.05, 1.0);
			if (product.rating?.average >= 4.5) priority = Math.min(priority + 0.1, 1.0);
			else if (product.rating?.average >= 4.0) priority = Math.min(priority + 0.05, 1.0);

			const updatedAt = product.updatedAt?.toDate ? product.updatedAt.toDate() : (product.updatedAt ? new Date(product.updatedAt) : new Date());

			return {
				url: `${baseUrl}/shop/${product.slug || product._id}`,
				lastModified: updatedAt,
				changeFrequency: "daily" as const,
				priority: priority,
			};
		});
	} catch (error) {
		console.error("Error generating product sitemap:", error);
	}

	return [...staticPages, ...listingPages, ...blogPages, ...productPages];
}
