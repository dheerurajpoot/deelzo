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
        if (snapshot.exists()) {
            const order = { _id: idOrOrderId, ...snapshot.val() };
            
            // Join user
            if (typeof order.user === 'string') {
                try {
                    const userSnap = await get(ref(db, `users/${order.user}`));
                    if (userSnap.exists()) {
                        order.user = { _id: order.user, ...userSnap.val() };
                    }
                } catch (e) {
                    console.error("Failed to populate user for order", e);
                }
            }
            
            return order;
        }

        // Try by orderId string
        const ordersRef = ref(db, 'orders');
        const orderQuery = query(ordersRef, orderByChild('orderId'), equalTo(idOrOrderId));
        const qSnapshot = await get(orderQuery);
        if (qSnapshot.exists()) {
            const orders = qSnapshot.val();
            const id = Object.keys(orders)[0];
            const order = { _id: id, ...orders[id] };
            
            // Join user
            if (typeof order.user === 'string') {
                try {
                    const userSnap = await get(ref(db, `users/${order.user}`));
                    if (userSnap.exists()) {
                        order.user = { _id: order.user, ...userSnap.val() };
                    }
                } catch (e) {
                    console.error("Failed to populate user for order", e);
                }
            }
            
            return order;
        }
        return null;
    },

    async getUserOrders(userId) {
        const ordersRef = ref(db, 'orders');
        const snapshot = await get(ordersRef);
        if (!snapshot.exists()) return [];
        
        const orders = [];
        snapshot.forEach((child) => {
            const data = child.val();
            if (data.user === userId || data.user?._id === userId) {
                orders.push({ _id: child.key, ...data });
            }
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

        // Join users
        try {
            const usersRef = ref(db, 'users');
            const usersSnapshot = await get(usersRef);
            if (usersSnapshot.exists()) {
                const usersMap = usersSnapshot.val();
                orders.forEach(order => {
                    if (typeof order.user === 'string' && usersMap[order.user]) {
                        order.user = { _id: order.user, ...usersMap[order.user] };
                    }
                });
            }
        } catch (e) {
            console.error("Failed to populate users for orders", e);
        }

        return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
};
