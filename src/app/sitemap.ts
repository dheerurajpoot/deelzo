import { MetadataRoute } from "next";
import { listingService } from "@/services/listingService";
import { blogService } from "@/services/blogService";
import { productService } from "@/services/productService";
import { BASE_URL as baseUrl } from "@/lib/constant";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	// Static pages
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

	// Fetch active listings from database
	let listingPages: MetadataRoute.Sitemap = [];

	try {
        const { listings } = await listingService.getListings({ status: 'active' });

		listingPages = listings.map((listing: any) => ({
			url: `${baseUrl}/marketplace/${listing.slug || listing._id}`,
			lastModified: listing.updatedAt
				? new Date(listing.updatedAt)
				: new Date(),
			changeFrequency: "daily" as const,
			priority: 0.8,
		}));
	} catch (error) {
		console.error("Error generating sitemap:", error);
	}

	let blogPages: MetadataRoute.Sitemap = [];

	try {
        const blogs = await blogService.getBlogs();
		const publishedBlogs = blogs.filter(b => b.status === "published");

		blogPages = publishedBlogs.map((blog) => ({
			url: `${baseUrl}/blogs/${blog.slug || blog._id}`,
			lastModified: blog.updatedAt
				? new Date(blog.updatedAt)
				: new Date(),
			changeFrequency: "daily" as const,
			priority: 0.8,
		}));
	} catch (error) {
		console.error("Error generating blog sitemap:", error);
	}

	// Fetch active products from database
	let productPages: MetadataRoute.Sitemap = [];

	try {
        const { products } = await productService.getProducts({ status: 'active', limit: 1000 });

		productPages = products.map((product) => {
			return {
				url: `${baseUrl}/shop/${product.slug || product._id}`,
				lastModified: product.updatedAt
					? new Date(product.updatedAt)
					: new Date(),
				changeFrequency: "daily" as const,
				priority: 0.9,
			};
		});
	} catch (error) {
		console.error("Error generating product sitemap:", error);
	}

	return [...staticPages, ...listingPages, ...blogPages, ...productPages];
}
