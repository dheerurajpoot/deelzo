import { db } from "@/lib/firebase/admin";
import { NextResponse } from "next/server";
import { getDataFromToken } from "@/lib/auth";
import { getUserById } from "@/lib/db/users";

export async function GET(request) {
	try {
		const snapshot = await db.collection("plans").get();
		let plans = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));

		if (plans.length === 0) {
			// Seed default plans
			const defaultPlans = [
				{
					name: "Free",
					postLimit: 1,
					frequency: "weekly",
					price: 0,
					description: "1 post per week",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					name: "Premium",
					postLimit: 4,
					frequency: "weekly",
					price: 19,
					description: "4 posts per week",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					name: "Daily",
					postLimit: 1,
					frequency: "daily",
					price: 49,
					description: "1 post per day",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			];
			
			for (const plan of defaultPlans) {
				const docRef = await db.collection("plans").add(plan);
				plans.push({ _id: docRef.id, ...plan });
			}
			
			return NextResponse.json({ success: true, plans });
		}

		return NextResponse.json({ success: true, plans });
	} catch (error) {
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

export async function POST(request) {
    // Admin only to update/create plans
    try {
        const userId = await getDataFromToken(request);
        const user = await getUserById(userId);
        
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
        }

        const body = await request.json();
		let plan;

		const existingSnapshot = await db.collection("plans").where("name", "==", body.name).limit(1).get();
		if (!existingSnapshot.empty) {
			const doc = existingSnapshot.docs[0];
			await db.collection("plans").doc(doc.id).update({ ...body, updatedAt: new Date() });
			const updated = await db.collection("plans").doc(doc.id).get();
			plan = { _id: updated.id, ...updated.data() };
		} else {
			const docRef = await db.collection("plans").add({ ...body, createdAt: new Date(), updatedAt: new Date() });
			const created = await docRef.get();
			plan = { _id: created.id, ...created.data() };
		}

        return NextResponse.json({ success: true, plan });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
