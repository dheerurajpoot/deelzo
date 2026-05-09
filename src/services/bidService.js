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

        // Populate bidder info
        const { userService } = await import("./userService");
        const populatedBids = await Promise.all(bids.map(async (bid) => {
            if (typeof bid.bidder === 'string') {
                const bidderData = await userService.getUser(bid.bidder);
                return {
                    ...bid,
                    bidder: bidderData ? { _id: bid.bidder, name: bidderData.name, phone: bidderData.phone } : { _id: bid.bidder, name: bid.bidderName || "Anonymous", phone: "Hidden" }
                };
            }
            return bid;
        }));

        return populatedBids.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
};
