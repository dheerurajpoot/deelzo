import { db } from "../firebase/admin";

const ITEMS_COLLECTION = "products";

export async function getProductByIdOrSlug(identifier: string | any): Promise<any> {
	if (!identifier) return null;
	const safeId = typeof identifier === 'string' ? identifier : (identifier._id || identifier.id || identifier.toString());
	if (typeof safeId !== 'string' || !safeId.trim()) return null;

	let docRef = db.collection(ITEMS_COLLECTION).doc(safeId);
	let doc = await docRef.get();
	if (doc.exists) {
		return { _id: doc.id, ...doc.data() };
	}

	const snapshot = await db.collection(ITEMS_COLLECTION).where("slug", "==", safeId).limit(1).get();
	if (!snapshot.empty) {
		const slugDoc = snapshot.docs[0];
		return { _id: slugDoc.id, ...slugDoc.data() };
	}
	
	return null;
}

export async function createProduct(data: any) {
	const now = new Date();
	const slug = data.slug || data.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-");

	const newItem = {
		...data,
		slug,
		status: data.status || "draft",
		createdAt: now,
		updatedAt: now,
	};

	const docRef = await db.collection(ITEMS_COLLECTION).add(newItem);
	return { _id: docRef.id, ...newItem };
}

export async function updateProduct(id: string, updateData: any) {
	const docRef = db.collection(ITEMS_COLLECTION).doc(id);
	
	let payload = { ...updateData, updatedAt: new Date() };

	await docRef.update(payload);
	const updated = await docRef.get();
	return { _id: updated.id, ...updated.data() };
}

export async function deleteProduct(id: string) {
	await db.collection(ITEMS_COLLECTION).doc(id).delete();
	return true;
}
