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
    equalTo 
} from "firebase/database";

export const couponService = {
    async getCoupons() {
        const couponsRef = ref(db, 'coupons');
        const snapshot = await get(couponsRef);
        if (!snapshot.exists()) return [];
        
        const coupons = [];
        snapshot.forEach((child) => {
            coupons.push({ _id: child.key, ...child.val() });
        });
        
        return coupons.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },

    async getCoupon(id) {
        const couponRef = ref(db, `coupons/${id}`);
        const snapshot = await get(couponRef);
        if (snapshot.exists()) return { _id: id, ...snapshot.val() };
        return null;
    },

    async getCouponByCode(code) {
        const couponsRef = ref(db, 'coupons');
        const codeQuery = query(couponsRef, orderByChild('code'), equalTo(code.toUpperCase()));
        const snapshot = await get(codeQuery);
        if (snapshot.exists()) {
            const coupons = snapshot.val();
            const id = Object.keys(coupons)[0];
            return { _id: id, ...coupons[id] };
        }
        return null;
    },

    async createCoupon(data) {
        const couponsRef = ref(db, 'coupons');
        const newCouponRef = push(couponsRef);
        const couponData = {
            ...data,
            code: data.code.toUpperCase(),
            usedCount: 0,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        await set(newCouponRef, couponData);
        return { _id: newCouponRef.key, ...couponData };
    },

    async updateCoupon(id, data) {
        const couponRef = ref(db, `coupons/${id}`);
        await update(couponRef, {
            ...data,
            updatedAt: new Date().toISOString()
        });
    },

    async deleteCoupon(id) {
        const couponRef = ref(db, `coupons/${id}`);
        await remove(couponRef);
    }
};
