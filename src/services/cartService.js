import { db } from "@/lib/firebase";
import { ref, set, get, remove } from "firebase/database";

export const cartService = {
    async getCart(userId) {
        const cartRef = ref(db, `carts/${userId}`);
        const snapshot = await get(cartRef);
        return snapshot.exists() ? snapshot.val() : { items: [], totalAmount: 0 };
    },

    async updateCart(userId, cartData) {
        const cartRef = ref(db, `carts/${userId}`);
        await set(cartRef, cartData);
    },

    async clearCart(userId) {
        const cartRef = ref(db, `carts/${userId}`);
        await remove(cartRef);
    }
};
