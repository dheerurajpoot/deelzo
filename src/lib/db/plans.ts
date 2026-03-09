import { db } from "../firebase/admin";

const PLANS_COLLECTION = "plans";

export async function getPlanById(id: string) {
	let docRef = db.collection(PLANS_COLLECTION).doc(id);
	let doc = await docRef.get();
	if (doc.exists) {
		return { _id: doc.id, ...doc.data() };
	}
	return null;
}

export async function getPlanByName(name: string) {
	const snapshot = await db.collection(PLANS_COLLECTION).where("name", "==", name).limit(1).get();
	if (!snapshot.empty) {
		const doc = snapshot.docs[0];
		return { _id: doc.id, ...doc.data() };
	}
	return null;
}

export async function createPlan(data: any) {
	const now = new Date();
	const newPlan = { ...data, createdAt: now, updatedAt: now };
	const docRef = await db.collection(PLANS_COLLECTION).add(newPlan);
	return { _id: docRef.id, ...newPlan };
}

export async function updatePlan(id: string, updateData: any) {
	const docRef = db.collection(PLANS_COLLECTION).doc(id);
	await docRef.update({ ...updateData, updatedAt: new Date() });
	const updated = await docRef.get();
	return { _id: updated.id, ...updated.data() };
}

export async function deletePlan(id: string) {
	await db.collection(PLANS_COLLECTION).doc(id).delete();
	return true;
}
