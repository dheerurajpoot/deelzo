import { db } from "../firebase/admin";

const COUPONS_COLLECTION = "coupons";

export async function getCouponById(id: string) {
	let docRef = db.collection(COUPONS_COLLECTION).doc(id);
	let doc = await docRef.get();
	if (doc.exists) {
		return { _id: doc.id, ...doc.data() };
	}
	return null;
}

export async function getCouponByCode(code: string) {
	const snapshot = await db.collection(COUPONS_COLLECTION).where("code", "==", code.toUpperCase()).limit(1).get();
	if (!snapshot.empty) {
		const doc = snapshot.docs[0];
		return { _id: doc.id, ...doc.data() };
	}
	return null;
}

export async function getCouponByIdOrCode(identifier: string) {
	let coupon = await getCouponById(identifier);
	if (!coupon) {
		coupon = await getCouponByCode(identifier);
	}
	return coupon;
}

export async function createCoupon(data: any) {
	const now = new Date();
	const newCoupon = {
		...data,
		code: data.code.toUpperCase(),
		createdAt: now,
		updatedAt: now,
	};
	const docRef = await db.collection(COUPONS_COLLECTION).add(newCoupon);
	return { _id: docRef.id, ...newCoupon };
}

export async function updateCoupon(id: string, updateData: any) {
	const docRef = db.collection(COUPONS_COLLECTION).doc(id);
	let payload = { ...updateData, updatedAt: new Date() };
	if (payload.code) {
		payload.code = payload.code.toUpperCase();
	}
	await docRef.update(payload);
	const updated = await docRef.get();
	return { _id: updated.id, ...updated.data() };
}

export async function deleteCoupon(id: string) {
	await db.collection(COUPONS_COLLECTION).doc(id).delete();
	return true;
}
