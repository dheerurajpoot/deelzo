import { db } from "@/lib/firebase";
import { 
    ref, 
    set, 
    get, 
    update, 
    query, 
    orderByChild, 
    equalTo 
} from "firebase/database";

export const userService = {
    // Get user by ID
    async getUser(userId) {
        const userRef = ref(db, `users/${userId}`);
        const snapshot = await get(userRef);
        return snapshot.exists() ? { _id: userId, ...snapshot.val() } : null;
    },

    // Get user by email
    async getUserByEmail(email) {
        const usersRef = ref(db, 'users');
        const userQuery = query(usersRef, orderByChild('email'), equalTo(email.toLowerCase()));
        const snapshot = await get(userQuery);
        if (snapshot.exists()) {
            const users = snapshot.val();
            const userId = Object.keys(users)[0];
            return { _id: userId, ...users[userId] };
        }
        return null;
    },

    // Create user profile in RTDB
    async createUserProfile(userId, data) {
        const userRef = ref(db, `users/${userId}`);
        await set(userRef, {
            ...data,
            createdAt: new Date().toISOString(),
            role: data.role || 'user',
            isEmailVerified: data.isEmailVerified || false,
            isActive: 'active'
        });
    },

    // Update user profile
    async updateUserProfile(userId, data) {
        const userRef = ref(db, `users/${userId}`);
        await update(userRef, {
            ...data,
            updatedAt: new Date().toISOString()
        });
    },

    // Get all users (Admin)
    async getAllUsers() {
        const usersRef = ref(db, 'users');
        const snapshot = await get(usersRef);
        if (!snapshot.exists()) return [];
        
        const users = [];
        snapshot.forEach((child) => {
            users.push({ _id: child.key, ...child.val() });
        });
        // Compute dynamic counts for listings, orders, and blogs
        try {
            const [ordersSnap, listingsSnap, blogsSnap] = await Promise.all([
                get(ref(db, 'orders')),
                get(ref(db, 'listings')),
                get(ref(db, 'blogs'))
            ]);

            const orderCounts = {};
            const listingCounts = {};
            const blogCounts = {};

            if (ordersSnap.exists()) {
                ordersSnap.forEach(child => {
                    const o = child.val();
                    if (o.user) orderCounts[o.user] = (orderCounts[o.user] || 0) + 1;
                });
            }

            if (listingsSnap.exists()) {
                listingsSnap.forEach(child => {
                    const l = child.val();
                    if (l.seller) listingCounts[l.seller] = (listingCounts[l.seller] || 0) + 1;
                });
            }

            if (blogsSnap.exists()) {
                blogsSnap.forEach(child => {
                    const b = child.val();
                    if (b.author) blogCounts[b.author] = (blogCounts[b.author] || 0) + 1;
                });
            }

            users.forEach(u => {
                u.orderCount = orderCounts[u._id] || 0;
                u.listings = { length: listingCounts[u._id] || 0 };
                u.blogCount = blogCounts[u._id] || 0;
            });
        } catch (e) {
            console.error("Failed to compute counts for users", e);
        }

        return users.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
        });
    }
};
