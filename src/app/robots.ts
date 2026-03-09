import { BASE_URL } from "@/lib/constant";
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: "*",
				allow: "/",
				disallow: [
					"/api/",
					"/admin/",
					"/dashboard/",
					"/signup",
					"/forgot-password",
					"/reset-password",
					"/verify-otp",
				],
			},
		],
		sitemap: `${BASE_URL}/sitemap.xml`,
	};
}
