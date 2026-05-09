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

export const orderService = {
    async createOrder(data) {
        const ordersRef = ref(db, 'orders');
        const newOrderRef = push(ordersRef);
        
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        const orderId = `ORD-${timestamp}-${random}`;

        const orderData = {
            ...data,
            orderId,
            createdAt: new Date().toISOString(),
            status: data.status || 'pending',
            paymentStatus: data.paymentStatus || 'processing',
            deliveryStatus: data.deliveryStatus || 'pending'
        };

        await set(newOrderRef, orderData);
        return { _id: newOrderRef.key, ...orderData };
    },

    async getOrder(idOrOrderId) {
        // Try by Firebase ID
        const orderRef = ref(db, `orders/${idOrOrderId}`);
        const snapshot = await get(orderRef);
        if (snapshot.exists()) return { _id: idOrOrderId, ...snapshot.val() };

        // Try by orderId string
        const ordersRef = ref(db, 'orders');
        const orderQuery = query(ordersRef, orderByChild('orderId'), equalTo(idOrOrderId));
        const qSnapshot = await get(orderQuery);
        if (qSnapshot.exists()) {
            const orders = qSnapshot.val();
            const id = Object.keys(orders)[0];
            return { _id: id, ...orders[id] };
        }
        return null;
    },

    async getUserOrders(userId) {
        const ordersRef = ref(db, 'orders');
        const orderQuery = query(ordersRef, orderByChild('user'), equalTo(userId));
        const snapshot = await get(orderQuery);
        if (!snapshot.exists()) return [];
        
        const orders = [];
        snapshot.forEach((child) => {
            orders.push({ _id: child.key, ...child.val() });
        });
        return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },

    async updateOrder(id, data) {
        const orderRef = ref(db, `orders/${id}`);
        await update(orderRef, {
            ...data,
            updatedAt: new Date().toISOString()
        });
    },

    async getAllOrders() {
        const ordersRef = ref(db, 'orders');
        const snapshot = await get(ordersRef);
        if (!snapshot.exists()) return [];
        
        const orders = [];
        snapshot.forEach((child) => {
            orders.push({ _id: child.key, ...child.val() });
        });
        return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
};
