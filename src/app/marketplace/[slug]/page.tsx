import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import Listing from "@/models/Listing";
import Bid from "@/models/Bid";
import User from "@/models/User";
import mongoose from "mongoose";
import {
	ListingGalleryWrapper,
	ListingSidebar,
	ListingMobilePrice,
	ListingInfo,
} from "@/components/listing-view";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

// Helper to fetch listing
async function getListing(slug: string) {
	await connectDB();
	// Ensure models are registered
	const _u = User;
	const _b = Bid;

	let listing = await Listing.findOne({ slug }).populate(
		"seller",
		"name avatar phone role verified rating totalSales listings"
	);

	// If not found and valid ID, try by ID
	if (!listing && mongoose.Types.ObjectId.isValid(slug)) {
		listing = await Listing.findOne({ _id: slug }).populate(
			"seller",
			"name avatar phone role verified rating totalSales listings"
		);
	}

	if (!listing) return null;

	// Fetch bids
	const bids = await Bid.find({ listing: listing._id })
		.sort({ createdAt: -1 })
		.populate("bidder", "name phone");

	// Convert to plain object to pass to client components
	const listingObj = JSON.parse(JSON.stringify(listing));
	listingObj.bids = JSON.parse(JSON.stringify(bids));

	return listingObj;
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

	// Increment views (fire and forget)
	try {
		await Listing.findByIdAndUpdate(listing._id, { $inc: { views: 1 } });
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
				{/* Header / Breadcrumbs */}
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
					{/* Main Content */}
					<div className='lg:col-span-2 space-y-6'>
						<ListingGalleryWrapper listing={listing}>
							<ListingMobilePrice listing={listing} />
							<ListingInfo listing={listing} />
						</ListingGalleryWrapper>
					</div>

					{/* Sidebar */}
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
