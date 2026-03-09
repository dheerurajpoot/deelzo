import { db } from "@/lib/firebase/admin";
import { getDataFromToken } from "@/lib/auth";
import { getUserById, updateUser } from "@/lib/db/users";
import { getTransactionById, updateTransaction } from "@/lib/db/transactions";
import { NextResponse } from "next/server";

export async function POST(request) {
	try {
		const userId = await getDataFromToken(request);
		const user = await getUserById(userId);

		if (!user || user.role !== "admin") {
			return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
		}

		const { transactionId, status, rejectionReason } = await request.json();

		const transaction = await getTransactionById(transactionId);
		if (!transaction) {
			return NextResponse.json({ success: false, message: "Transaction not found" }, { status: 404 });
		}

		if (transaction.status !== "pending") {
			return NextResponse.json({ success: false, message: "Transaction already processed" }, { status: 400 });
		}

		const transactionUpdates = { status, updatedAt: new Date() };
        if (rejectionReason) {
            transactionUpdates.rejectionReason = rejectionReason;
        }
		const updatedTransaction = await updateTransaction(transactionId, transactionUpdates);

		if (status === "approved") {
			const transactionUser = await getUserById(transaction.user);
            if (transactionUser) {
                const now = new Date();
                const expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
                
				await updateUser(transactionUser._id, {
					currentPlan: transaction.plan,
					planExpiry: expiry,
					postCount: 0,
					periodStartDate: now
				});
            }
		}

		return NextResponse.json({ success: true, transaction: updatedTransaction });
	} catch (error) {
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

export async function GET(request) {
    try {
        const userId = await getDataFromToken(request);
        const user = await getUserById(userId);

		if (!user || user.role !== "admin") {
			return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
		}

        const snapshot = await db.collection("transactions").orderBy("createdAt", "desc").get();
        let transactions = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));

		const rawUserIds = [...new Set(transactions.map(t => t.user))];
		const userIds = rawUserIds.map(id => typeof id === 'string' ? id : (id._id || id.id || id.toString())).filter(Boolean);
		if (userIds.length > 0) {
			const usersMap = {};
			for (let i = 0; i < userIds.length; i += 10) {
				const batch = userIds.slice(i, i + 10);
				if (batch.length > 0) {
					const usersSnapshot = await db.collection("users").where("__name__", "in", batch).get();
					usersSnapshot.forEach(doc => {
						const data = doc.data();
						usersMap[doc.id] = { _id: doc.id, name: data.name, email: data.email };
					});
				}
			}

			for (let i = 0; i < transactions.length; i++) {
				const uId = transactions[i].user;
				transactions[i].user = usersMap[uId] || { _id: uId, name: "Unknown" };
			}
		}

        return NextResponse.json({ success: true, transactions });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
