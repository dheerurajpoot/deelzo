import { db } from "@/lib/firebase";
import { 
    ref, 
    set, 
    get, 
    push,
    update, 
    remove, 
    query, 
    orderByChild, 
    limitToLast,
    startAt,
    endAt,
    equalTo 
} from "firebase/database";

export const listingService = {
    // Get all listings with filters
    async getListings(filters = {}) {
        const listingsRef = ref(db, 'listings');
        let listingsQuery = query(listingsRef);
        
        const snapshot = await get(listingsQuery);
        if (!snapshot.exists()) return { listings: [], total: 0 };

        let listings = [];
        snapshot.forEach((childSnapshot) => {
            listings.push({ _id: childSnapshot.key, ...childSnapshot.val() });
        });

        // Apply filters in-memory
        if (filters.category && filters.category !== "all") {
            listings = listings.filter(l => l.category === filters.category);
        }
        if (filters.status) {
            if (Array.isArray(filters.status)) {
                listings = listings.filter(l => filters.status.includes(l.status));
            } else {
                listings = listings.filter(l => l.status === filters.status);
            }
        }
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            listings = listings.filter(l => 
                l.title?.toLowerCase().includes(searchLower) || 
                l.description?.toLowerCase().includes(searchLower)
            );
        }
        if (filters.minPrice) {
            listings = listings.filter(l => l.price >= parseFloat(filters.minPrice));
        }
        if (filters.maxPrice) {
            listings = listings.filter(l => l.price <= parseFloat(filters.maxPrice));
        }
        if (filters.featured === "true") {
            listings = listings.filter(l => l.featured === true);
        }
        if (filters.seller) {
            listings = listings.filter(l => 
                l.seller === filters.seller || 
                l.seller?._id === filters.seller || 
                l.userId === filters.seller || 
                l.userId?._id === filters.seller
            );
        }

        // Sorting
        const sortBy = filters.sortBy || 'createdAt';
        const sortOrder = filters.sortOrder || 'desc';
        listings.sort((a, b) => {
            if (sortOrder === 'asc') return a[sortBy] > b[sortBy] ? 1 : -1;
            return a[sortBy] < b[sortBy] ? 1 : -1;
        });

        const total = listings.length;
        const page = parseInt(filters.page) || 1;
        const limit = parseInt(filters.limit) || 12;
        const skip = (page - 1) * limit;
        
        return {
            listings: listings.slice(skip, skip + limit),
            total,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
                hasMore: page * limit < total
            }
        };
    },

    // Get listing by ID or Slug
    async getListing(idOrSlug) {
        const listingsRef = ref(db, 'listings');
        
        // Try by ID first
        const listingRef = ref(db, `listings/${idOrSlug}`);
        const snapshot = await get(listingRef);
        if (snapshot.exists()) return { _id: idOrSlug, ...snapshot.val() };

        // Try by Slug
        const slugQuery = query(listingsRef, orderByChild('slug'), equalTo(idOrSlug));
        const slugSnapshot = await get(slugQuery);
        if (slugSnapshot.exists()) {
            const listings = slugSnapshot.val();
            const id = Object.keys(listings)[0];
            return { _id: id, ...listings[id] };
        }

        return null;
    },

    // Create listing
    async createListing(data) {
        const listingsRef = ref(db, 'listings');
        const newListingRef = push(listingsRef);
        const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        
        const listingData = {
            ...data,
            slug,
            createdAt: new Date().toISOString(),
            status: data.status || 'pending',
            views: 0
        };
        
        await set(newListingRef, listingData);
        return { _id: newListingRef.key, ...listingData };
    },

    // Update listing
    async updateListing(listingId, data) {
        const listingRef = ref(db, `listings/${listingId}`);
        await update(listingRef, {
            ...data,
            updatedAt: new Date().toISOString()
        });
    },

    // Delete listing
    async deleteListing(listingId) {
        const listingRef = ref(db, `listings/${listingId}`);
        await remove(listingRef);
    }
};
