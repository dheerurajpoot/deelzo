import { db } from "../firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

const BLOGS_COLLECTION = "blogs";

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
		const snapshot = await db.collection(BLOGS_COLLECTION).where("slug", "==", slug).get();
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

export async function getBlogByIdOrSlug(identifier: string | any): Promise<any> {
	if (!identifier) return null;
	const safeId = typeof identifier === 'string' ? identifier : (identifier._id || identifier.id || identifier.toString());
	if (typeof safeId !== 'string' || !safeId.trim()) return null;

	let docRef = db.collection(BLOGS_COLLECTION).doc(safeId);
	let doc = await docRef.get();
	if (doc.exists) {
		return { _id: doc.id, ...doc.data() };
	}

	const snapshot = await db.collection(BLOGS_COLLECTION).where("slug", "==", safeId).limit(1).get();
	if (!snapshot.empty) {
		const slugDoc = snapshot.docs[0];
		return { _id: slugDoc.id, ...slugDoc.data() };
	}
	
	return null;
}

export async function createBlog(data: any) {
	const now = new Date();
	const baseSlug = slugifyTitle(data.title);
	const slug = await ensureUniqueSlug(baseSlug);

	const newBlog = {
		...data,
		slug,
		views: 0,
		category: data.category || "General",
		status: data.status || "pending",
		createdAt: now,
		updatedAt: now,
	};

	const docRef = await db.collection(BLOGS_COLLECTION).add(newBlog);
	return { _id: docRef.id, ...newBlog };
}

export async function updateBlog(id: string, updateData: any) {
	const docRef = db.collection(BLOGS_COLLECTION).doc(id);
	
	let payload = { ...updateData, updatedAt: new Date() };

	if (updateData.title && !updateData.slug) {
		const baseSlug = slugifyTitle(updateData.title);
		payload.slug = await ensureUniqueSlug(baseSlug, id);
	} else if (updateData.slug) {
		payload.slug = await ensureUniqueSlug(updateData.slug, id);
	}

	await docRef.update(payload);
	const updated = await docRef.get();
	return { _id: updated.id, ...updated.data() };
}

export async function deleteBlog(id: string) {
	await db.collection(BLOGS_COLLECTION).doc(id).delete();
	return true;
}

export async function incrementBlogViews(id: string) {
	const docRef = db.collection(BLOGS_COLLECTION).doc(id);
	await docRef.update({
		views: FieldValue.increment(1)
	});
}
