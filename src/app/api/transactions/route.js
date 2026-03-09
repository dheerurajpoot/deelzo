import { db } from "@/lib/firebase/admin";
import { createTransaction } from "@/lib/db/transactions";
import { getDataFromToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request) {
	try {
		const userId = await getDataFromToken(request);
		if (!userId) {
			return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();

		const transaction = await createTransaction({
			...body,
			user: userId,
			status: "pending",
		});

		return NextResponse.json({ success: true, transaction });
	} catch (error) {
		console.error(error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

export async function GET(request) {
	try {
		const userId = await getDataFromToken(request);
		if (!userId) {
			return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
		}
		
		const snapshot = await db.collection("transactions").where("user", "==", userId).get();
		const transactions = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));

		transactions.sort((a, b) => {
			const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
			const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
			return timeB - timeA;
		});

		return NextResponse.json({ success: true, transactions });
	} catch (error) {
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
