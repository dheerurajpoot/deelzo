import { notFound } from "next/navigation";
import { db } from "@/lib/firebase/admin";
import { getListingByIdOrSlug } from "@/lib/db/listings";
import { getUserById } from "@/lib/db/users";
import {
	ListingGalleryWrapper,
	ListingSidebar,
	ListingMobilePrice,
	ListingInfo,
} from "@/components/listing-view";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

async function getListing(slug: string) {
	let listing = await getListingByIdOrSlug(slug);

	if (!listing) return null;
	if (listing.status !== "active" && listing.status !== "sold") return null;

	// Populate seller
	if (listing.seller) {
		const sellerData = await getUserById(listing.seller);
		if (sellerData) {
			listing.seller = {
				_id: sellerData._id,
				name: sellerData.name,
				avatar: sellerData.avatar,
				phone: sellerData.phone,
				role: sellerData.role,
				verified: sellerData.verified,
				rating: sellerData.rating,
				totalSales: sellerData.totalSales,
				listings: sellerData.listings || []
			};
		}
	}

	// Fetch bids
	const bidsSnapshot = await db.collection("bids")
		.where("listing", "==", listing._id)
		.get();
	
	let bids = bidsSnapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() } as any));

	bids.sort((a, b) => {
		const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
		const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
		return timeB - timeA;
	});

	if (bids.length > 0) {
		const rawBidderIds = [...new Set(bids.map(b => b.bidder))];
		const bidderIds = rawBidderIds.map(id => typeof id === 'string' ? id : (id._id || id.id || id.toString())).filter(Boolean);
		const biddersMap: Record<string, any> = {};
		
		for (let i = 0; i < bidderIds.length; i += 10) {
			const batch = bidderIds.slice(i, i + 10);
			if (batch.length > 0) {
				const biddersSnapshot = await db.collection("users").where("__name__", "in", batch).get();
				biddersSnapshot.forEach(doc => {
					biddersMap[doc.id] = { _id: doc.id, name: doc.data().name, phone: doc.data().phone };
				});
			}
		}

		bids = bids.map(bid => ({
			...bid,
			bidder: biddersMap[bid.bidder] || { _id: bid.bidder, name: "Unknown" }
		}));
	}
	
	// Deep serialize to convert Firestore Timestamps to ISO strings for Client Components
	const serializeFirebaseData = (obj: any): any => {
		if (obj === null || obj === undefined) return obj;
		if (typeof obj?.toDate === "function") return obj.toDate().toISOString();
		if (typeof obj === "object" && obj._seconds !== undefined && obj._nanoseconds !== undefined) {
			return new Date(obj._seconds * 1000).toISOString();
		}
		if (obj instanceof Date) return obj.toISOString();
		if (Array.isArray(obj)) return obj.map(serializeFirebaseData);
		if (typeof obj === "object") {
			const res: any = {};
			for (const key in obj) {
				res[key] = serializeFirebaseData(obj[key]);
			}
			return res;
		}
		return obj;
	};

	return serializeFirebaseData(listing);
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const listing = await getListing(slug);

	if (!listing) {
		return {
			title: "Listing Not Found",
		};
	}

	return {
		title: `${listing.title}`,
		description:
			listing.description?.substring(0, 160) ||
			"Check out this listing on Deelzo.com",
		alternates: {
			canonical: `${process.env.NEXT_PUBLIC_APP_URL}/marketplace/${
				listing.slug || listing._id
			}`,
		},
		openGraph: {
			title: listing.title,
			description: listing.description?.substring(0, 160),
			images: listing.thumbnail ? [listing.thumbnail] : [],
		},
	};
}

export default async function ListingPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const listing = await getListing(slug);

	if (!listing) {
		notFound();
	}

	// Increment views
	try {
        const { FieldValue } = require("firebase-admin/firestore");
		await db.collection("listings").doc(listing._id).update({
            views: FieldValue.increment(1)
        });
	} catch (e) {
		console.error("Failed to increment views", e);
	}

	const breadcrumbs = [
		{ label: "Home", href: "/" },
		{ label: "Marketplace", href: "/marketplace" },
		{
			label:
				listing.title.length > 25
					? listing.title.slice(0, 25) + "..."
					: listing.title,
			href: `/marketplace/${listing.slug || listing._id}`,
		},
	];

	return (
		<div className='min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 pb-24 md:pb-8'>
			<div className='max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6'>
				<div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6'>
					<nav className='flex items-center text-sm text-slate-600 gap-1 md:gap-2 flex-wrap'>
						{breadcrumbs.map((crumb, index) => (
							<div
								key={crumb.href}
								className='flex items-center gap-1 md:gap-2'>
								<Link
									href={crumb.href}
									className='hover:text-sky-600 transition-colors'>
									{crumb.label}
								</Link>
								{index < breadcrumbs.length - 1 && (
									<ChevronRight
										size={14}
										className='text-slate-400'
									/>
								)}
							</div>
						))}
					</nav>
				</div>

				<div className='grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8'>
					<div className='lg:col-span-2 space-y-6'>
						<ListingGalleryWrapper listing={listing}>
							<ListingMobilePrice listing={listing} />
							<ListingInfo listing={listing} />
						</ListingGalleryWrapper>
					</div>

					<div className='lg:col-span-1'>
						<div className='sticky top-24'>
							<ListingSidebar listing={listing} />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
