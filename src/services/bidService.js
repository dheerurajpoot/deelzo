import { db } from "@/lib/firebase";
import { ref, set, get, push, query, orderByChild, equalTo } from "firebase/database";

export const bidService = {
    async placeBid(bidData) {
        const bidsRef = ref(db, 'bids');
        const newBidRef = push(bidsRef);
        const data = {
            ...bidData,
            createdAt: new Date().toISOString()
        };
        await set(newBidRef, data);
        return { _id: newBidRef.key, ...data };
    },

    async getListingBids(listingId) {
        const bidsRef = ref(db, 'bids');
        const bidsQuery = query(bidsRef, orderByChild('listing'), equalTo(listingId));
        const snapshot = await get(bidsQuery);
        if (!snapshot.exists()) return [];
        
        const bids = [];
        snapshot.forEach((child) => {
            bids.push({ _id: child.key, ...child.val() });
        });
        return bids.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
};
