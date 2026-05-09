import { db, auth } from "@/lib/firebase";
import { 
    ref, 
    set, 
    get, 
    update, 
    remove, 
    query, 
    orderByChild, 
    equalTo 
} from "firebase/database";
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut as firebaseSignOut,
    onAuthStateChanged
} from "firebase/auth";

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
        return users;
    }
};
