import type React from "react";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/userContext";
import LayoutShell from "@/components/layout-shell";
import Head from "next/head";
import Script from "next/script";

const geistSans = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
	metadataBase: new URL("https://www.deelzo.com/"),
	title: {
		default: "Deelzo - Buy & Sell Digital Assets | Trusted Marketplace",
		template: "%s | Deelzo.com",
	},
	description:
		"Deelzo is the trusted marketplace for buying and selling digital assets. Discover websites, YouTube channels, social media accounts, mobile apps, SaaS products, and more. Buy verified digital properties with complete metrics and analytics.",
	keywords: [
		"buy digital assets",
		"sell digital assets",
		"digital marketplace",
		"buy website",
		"sell website",
		"YouTube channel for sale",
		"buy Instagram account",
		"buy TikTok account",
		"mobile app marketplace",
		"SaaS marketplace",
		"ecommerce store for sale",
		"digital assets marketplace",
		"verified digital properties",
		"buy social media account",
		"digital business for sale",
		"Deelzo",
	],
	authors: [{ name: "Deelzo" }],
	creator: "Deelzo",
	publisher: "Deelzo",
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},
	openGraph: {
		type: "website",
		locale: "en_US",
		url: "/",
		title: "Deelzo - Buy & Sell Digital Assets | Trusted Marketplace",
		description:
			"Deelzo is the trusted marketplace for buying and selling digital assets. Discover websites, YouTube channels, social media accounts, mobile apps, SaaS products, and more.",
		siteName: "Deelzo",
		images: [
			{
				url: "/deelzobanner.png",
				width: 1200,
				height: 630,
				alt: "Deelzo - Digital Assets Marketplace",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Deelzo - Buy & Sell Digital Assets",
		description:
			"The trusted marketplace for buying and selling digital assets. Discover verified digital properties with complete metrics.",
		images: ["/deelzobanner.png"],
		creator: "@Deelzo",
		site: "@Deelzo",
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	category: "Digital Assets Marketplace",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang='en' suppressHydrationWarning>
			<Head>
				{/* Taboola Pixel Code */}
				<Script
					type='text/javascript'
					suppressHydrationWarning
					dangerouslySetInnerHTML={{
						__html: `
		window._tfa = window._tfa || [];
		window._tfa.push({notify: 'event', name: 'page_view', id: 1989620});
		!function (t, f, a, x) {
			if (!document.getElementById(x)) {
				t.async = 1;t.src = a;t.id=x;f.parentNode.insertBefore(t, f);
			}
		}(document.createElement('script'),
		document.getElementsByTagName('script')[0],
		'//cdn.taboola.com/libtrc/unip/1989620/tfa.js',
		'tb_tfa_script');
`,
					}}
				/>
				{/* End of Taboola Pixel Code */}
				<meta
					name='viewport'
					content='width=device-width, initial-scale=1'
				/>
				<meta
					name='google-adsense-account'
					content='ca-pub-3138751846532107'
				/>
				<meta name='theme-color' content='#f8fafc' />
				<meta name='apple-mobile-web-app-capable' content='yes' />
				<meta
					name='apple-mobile-web-app-status-bar-style'
					content='default'
				/>
				{/* Structured Data - Organization */}
				<Script
					type='application/ld+json'
					suppressHydrationWarning
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "Organization",
							name: "Deelzo",
							url: "https://www.deelzo.com/",
							logo: "/logo.png",
							description:
								"Trusted marketplace for buying and selling digital assets",
							contactPoint: {
								"@type": "ContactPoint",
								contactType: "Customer Service",
								email: "evtnorg@gmail.com",
							},
						}),
					}}
				/>
				{/* Structured Data - WebSite */}
				<Script
					type='application/ld+json'
					suppressHydrationWarning
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "WebSite",
							name: "Deelzo",
							url: "https://www.deelzo.com/",
							potentialAction: {
								"@type": "SearchAction",
								target: {
									"@type": "EntryPoint",
									urlTemplate:
										"https://www.deelzo.com/marketplace",
								},
								"query-input":
									"required name=search_term_string",
							},
						}),
					}}
				/>
				{/* Structured Data - Marketplace */}
				<Script
					type='application/ld+json'
					suppressHydrationWarning
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "OnlineStore",
							name: "Deelzo",
							description:
								"Buy and sell digital assets including websites, YouTube channels, social media accounts, mobile apps, and SaaS products",
							url: "https://www.deelzo.com/",
							priceRange: "$$",
						}),
					}}
				/>
				{/* Google Analytics Script */}
				<Script
					async
					src='https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXX'
				/>
				<Script
					suppressHydrationWarning
					dangerouslySetInnerHTML={{
						__html: `
							window.dataLayer = window.dataLayer || [];
							function gtag(){dataLayer.push(arguments);}
							gtag('js', new Date());
							gtag('config', 'G-XXXXXXXXXXXXX');
						`,
					}}
				/>
				{/* <script
					async
					src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXX'
					crossOrigin='anonymous'
				/> */}
			</Head>
			<body
				className={`${geistSans.className} bg-gray-50`}
				suppressHydrationWarning>
				<AuthProvider>
					<LayoutShell>
						{children}
						<Toaster />
					</LayoutShell>
				</AuthProvider>
			</body>
		</html>
	);
}
