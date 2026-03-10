import { db } from "../firebase/admin";

const ORDERS_COLLECTION = "orders";

export async function getOrderById(id: string) {
	let docRef = db.collection(ORDERS_COLLECTION).doc(id);
	let doc = await docRef.get();
	if (doc.exists) {
		return { _id: doc.id, ...doc.data() };
	}
	return null;
}

export async function getOrderByOrderId(orderId: string) {
	const snapshot = await db.collection(ORDERS_COLLECTION).where("orderId", "==", orderId).limit(1).get();
	if (!snapshot.empty) {
		const doc = snapshot.docs[0];
		return { _id: doc.id, ...doc.data() };
	}
	return null;
}

export async function createOrder(data: any) {
	const now = new Date();
	// Generate unique order ID if not present
	let orderId = data.orderId;
	if (!orderId) {
		orderId = `ORD-${Date.now()}`;
	}

	const newOrder = {
		...data,
		orderId,
		createdAt: now,
		updatedAt: now,
	};

	const docRef = await db.collection(ORDERS_COLLECTION).add(newOrder);
	return { _id: docRef.id, ...newOrder };
}

export async function updateOrder(id: string, updateData: any) {
	const docRef = db.collection(ORDERS_COLLECTION).doc(id);
	await docRef.update({ ...updateData, updatedAt: new Date() });
	const updated = await docRef.get();
	return { _id: updated.id, ...updated.data() };
}

export async function deleteOrder(id: string) {
	await db.collection(ORDERS_COLLECTION).doc(id).delete();
	return true;
}
