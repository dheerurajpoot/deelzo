import { connectDB } from "@/lib/mongodb";
import Plan from "@/models/Plan";
import { NextResponse } from "next/server";
import { getDataFromToken } from "@/lib/auth";
import User from "@/models/User";

export async function GET(request) {
	try {
		await connectDB();
		const plans = await Plan.find({});

		if (plans.length === 0) {
			// Seed default plans
			const defaultPlans = [
				{
					name: "Free",
					postLimit: 1,
					frequency: "weekly",
					price: 0,
					description: "1 post per week",
				},
				{
					name: "Premium",
					postLimit: 4,
					frequency: "weekly",
					price: 19, // Example price
					description: "4 posts per week",
				},
				{
					name: "Daily",
					postLimit: 1,
					frequency: "daily",
					price: 49, // Example price
					description: "1 post per day",
				},
			];
			await Plan.insertMany(defaultPlans);
			return NextResponse.json({ success: true, plans: await Plan.find({}) });
		}

		return NextResponse.json({ success: true, plans });
	} catch (error) {
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

export async function POST(request) {
    // Admin only to update/create plans
    try {
        await connectDB();
        const userId = getDataFromToken(request);
        const user = await User.findById(userId);
        
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
        }

        const body = await request.json();
        const plan = await Plan.findOneAndUpdate(
            { name: body.name },
            body,
            { new: true, upsert: true }
        );

        return NextResponse.json({ success: true, plan });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
