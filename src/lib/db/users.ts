import { db } from "../firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

const USERS_COLLECTION = "users";

export async function getUserById(id: string | any): Promise<any> {
	if (!id) return null;
	const safeId = typeof id === 'string' ? id : (id._id || id.id || id.toString());
	if (typeof safeId !== 'string' || !safeId.trim()) return null;

	const userDoc = await db.collection(USERS_COLLECTION).doc(safeId).get();
	if (!userDoc.exists) {
		return null;
	}
	return { _id: userDoc.id, ...userDoc.data() };
}

export async function getUserByEmail(email: string) {
	const usersSnapshot = await db
		.collection(USERS_COLLECTION)
		.where("email", "==", email.toLowerCase())
		.limit(1)
		.get();

	if (usersSnapshot.empty) {
		return null;
	}
	const userDoc = usersSnapshot.docs[0];
	return { _id: userDoc.id, ...userDoc.data() };
}

export async function createUser(userData: any) {
	const now = new Date();
	const newUserData = {
		...userData,
		createdAt: now,
		updatedAt: now,
		email: userData.email?.toLowerCase(),
	};
	if (userData._id) {
		await db.collection(USERS_COLLECTION).doc(userData._id).set(newUserData);
		return { _id: userData._id, ...newUserData };
	} else {
		const docRef = await db.collection(USERS_COLLECTION).add(newUserData);
		return { _id: docRef.id, ...newUserData };
	}
}

export async function updateUser(id: string, updateData: any) {
	const docRef = db.collection(USERS_COLLECTION).doc(id);
	await docRef.update({
		...updateData,
		updatedAt: new Date(),
	});
	const updatedDoc = await docRef.get();
	return { _id: updatedDoc.id, ...updatedDoc.data() };
}

export async function deleteUser(id: string) {
	await db.collection(USERS_COLLECTION).doc(id).delete();
	return true;
}

// Add any specialized functions like addListingToUser, etc.
export async function addListingToUser(userId: string, listingId: string) {
	const docRef = db.collection(USERS_COLLECTION).doc(userId);
	await docRef.update({
		listings: FieldValue.arrayUnion(listingId),
		updatedAt: new Date(),
	});
}

export async function removeListingFromUser(userId: string, listingId: string) {
	const docRef = db.collection(USERS_COLLECTION).doc(userId);
	await docRef.update({
		listings: FieldValue.arrayRemove(listingId),
		updatedAt: new Date(),
	});
}
