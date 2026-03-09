import { db } from "../firebase/admin";

const TRANSACTIONS_COLLECTION = "transactions";

export async function getTransactionById(id: string) {
	let docRef = db.collection(TRANSACTIONS_COLLECTION).doc(id);
	let doc = await docRef.get();
	if (doc.exists) {
		return { _id: doc.id, ...doc.data() };
	}
	return null;
}

export async function createTransaction(data: any) {
	const now = new Date();
	const newTx = { ...data, createdAt: now, updatedAt: now };
	const docRef = await db.collection(TRANSACTIONS_COLLECTION).add(newTx);
	return { _id: docRef.id, ...newTx };
}

export async function updateTransaction(id: string, updateData: any) {
	const docRef = db.collection(TRANSACTIONS_COLLECTION).doc(id);
	await docRef.update({ ...updateData, updatedAt: new Date() });
	const updated = await docRef.get();
	return { _id: updated.id, ...updated.data() };
}

export async function deleteTransaction(id: string) {
	await db.collection(TRANSACTIONS_COLLECTION).doc(id).delete();
	return true;
}
