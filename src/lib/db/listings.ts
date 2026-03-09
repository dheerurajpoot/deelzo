import { db } from "../firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

const LISTINGS_COLLECTION = "listings";

const slugifyTitle = (title: string) =>
	title
		?.toString()
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-");

async function ensureUniqueSlug(baseSlug: string, currentId?: string) {
	let slug = baseSlug;
	let counter = 1;
	while (true) {
		const snapshot = await db.collection(LISTINGS_COLLECTION).where("slug", "==", slug).get();
		let isUnique = true;
		snapshot.forEach((doc) => {
			if (currentId && doc.id === currentId) {
				// Same document, so it's fine
			} else {
				isUnique = false;
			}
		});

		if (isUnique) break;
		slug = `${baseSlug}-${counter}`;
		counter++;
		
		if (counter > 1000) break;
	}
	return slug;
}

export async function getListingByIdOrSlug(identifier: string | any): Promise<any> {
	if (!identifier) return null;
	const safeId = typeof identifier === 'string' ? identifier : (identifier._id || identifier.id || identifier.toString());
	if (typeof safeId !== 'string' || !safeId.trim()) return null;

	// Try by ID first
	let docRef = db.collection(LISTINGS_COLLECTION).doc(safeId);
	let doc = await docRef.get();
	if (doc.exists) {
		return { _id: doc.id, ...doc.data() };
	}

	// Try by slug
	const snapshot = await db.collection(LISTINGS_COLLECTION).where("slug", "==", safeId).limit(1).get();
	if (!snapshot.empty) {
		const slugDoc = snapshot.docs[0];
		return { _id: slugDoc.id, ...slugDoc.data() };
	}
	
	return null;
}

export async function createListing(data: any) {
	const now = new Date();
	const baseSlug = slugifyTitle(data.title);
	const slug = await ensureUniqueSlug(baseSlug);

	const newListing = {
		...data,
		slug,
		views: 0,
		status: data.status || "pending",
		createdAt: now,
		updatedAt: now,
	};

	const docRef = await db.collection(LISTINGS_COLLECTION).add(newListing);
	return { _id: docRef.id, ...newListing };
}

export async function updateListing(id: string, updateData: any) {
	const docRef = db.collection(LISTINGS_COLLECTION).doc(id);
	
	let payload = { ...updateData, updatedAt: new Date() };

	if (updateData.title) {
		const baseSlug = slugifyTitle(updateData.title);
		payload.slug = await ensureUniqueSlug(baseSlug, id);
	}

	await docRef.update(payload);
	const updated = await docRef.get();
	return { _id: updated.id, ...updated.data() };
}

export async function deleteListing(id: string) {
	await db.collection(LISTINGS_COLLECTION).doc(id).delete();
	return true;
}

export async function incrementListingViews(id: string) {
	const docRef = db.collection(LISTINGS_COLLECTION).doc(id);
	await docRef.update({
		views: FieldValue.increment(1)
	});
}
