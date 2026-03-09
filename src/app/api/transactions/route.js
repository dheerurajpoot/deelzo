import { connectDB } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import { getDataFromToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request) {
	try {
		await connectDB();
		const userId = getDataFromToken(request);
		if (!userId) {
			return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
        // body: { plan, amount, transactionId, paymentMethod }

		const transaction = await Transaction.create({
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
    // Get my transactions
    try {
        await connectDB();
        const userId = getDataFromToken(request);
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }
        
        const transactions = await Transaction.find({ user: userId }).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, transactions });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
