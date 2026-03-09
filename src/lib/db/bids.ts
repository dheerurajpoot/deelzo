import { db } from "../firebase/admin";

const BIDS_COLLECTION = "bids";

export async function getBidById(id: string) {
	let docRef = db.collection(BIDS_COLLECTION).doc(id);
	let doc = await docRef.get();
	if (doc.exists) {
		return { _id: doc.id, ...doc.data() };
	}
	return null;
}

export async function createBid(data: any) {
	const now = new Date();
	const newBid = {
		...data,
		status: data.status || "active",
		createdAt: now,
		updatedAt: now,
	};
	const docRef = await db.collection(BIDS_COLLECTION).add(newBid);
	return { _id: docRef.id, ...newBid };
}

export async function updateBid(id: string, updateData: any) {
	const docRef = db.collection(BIDS_COLLECTION).doc(id);
	await docRef.update({ ...updateData, updatedAt: new Date() });
	const updated = await docRef.get();
	return { _id: updated.id, ...updated.data() };
}

export async function deleteBid(id: string) {
	await db.collection(BIDS_COLLECTION).doc(id).delete();
	return true;
}
