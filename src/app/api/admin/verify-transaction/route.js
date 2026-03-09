import { connectDB } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import { getDataFromToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request) {
	try {
		await connectDB();
		const userId = getDataFromToken(request);
		const user = await User.findById(userId);

		if (!user || user.role !== "admin") {
			return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
		}

		const { transactionId, status, rejectionReason } = await request.json();

		const transaction = await Transaction.findById(transactionId).populate("user");
		if (!transaction) {
			return NextResponse.json({ success: false, message: "Transaction not found" }, { status: 404 });
		}

		if (transaction.status !== "pending") {
			return NextResponse.json({ success: false, message: "Transaction already processed" }, { status: 400 });
		}

		transaction.status = status;
        if (rejectionReason) {
            // Store rejection reason? Transaction model doesn't have it. 
            // Skipping for now or I can add it.
        }
		await transaction.save();

		if (status === "approved") {
			const transactionUser = await User.findById(transaction.user._id);
            if (transactionUser) {
                transactionUser.currentPlan = transaction.plan; // 'premium' or 'daily'
                
                // Set expiry to 30 days from now
                const now = new Date();
                const expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
                transactionUser.planExpiry = expiry;
                
                // Reset counters
                transactionUser.postCount = 0;
                transactionUser.periodStartDate = now;
                
                await transactionUser.save();
            }
		}

		return NextResponse.json({ success: true, transaction });
	} catch (error) {
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

export async function GET(request) {
    // List all transactions for admin
    try {
        await connectDB();
        const userId = getDataFromToken(request);
        const user = await User.findById(userId);

		if (!user || user.role !== "admin") {
			return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
		}

        const transactions = await Transaction.find({})
            .populate("user", "name email")
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, transactions });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
