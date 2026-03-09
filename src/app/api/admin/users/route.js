import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/admin";
import { getUserById, updateUser, deleteUser } from "@/lib/db/users";

export async function GET(request) {
	try {
		const { searchParams } = new URL(request.url);
		const adminId = searchParams.get("adminId");

		const admin = await getUserById(adminId);
		if (!admin || admin.role !== "admin") {
			return NextResponse.json(
				{ message: "Unauthorized" },
				{ status: 401 }
			);
		}

		const snapshot = await db.collection("users").orderBy("createdAt", "desc").get();
		const users = snapshot.docs.map(doc => {
			const data = doc.data();
			delete data.password;
			delete data.passwordResetToken;
			delete data.passwordResetExpiry;
			return { _id: doc.id, ...data };
		});

		return NextResponse.json(users);
	} catch (error) {
		console.error("Admin users fetch error:", error);
		return NextResponse.json(
			{ message: "Failed to fetch users" },
			{ status: 500 }
		);
	}
}

export async function PUT(request) {
	try {
		const { userId, action, adminId, updates } = await request.json();

		const admin = await getUserById(adminId);
		if (!admin || admin.role !== "admin") {
			return NextResponse.json(
				{ message: "Unauthorized" },
				{ status: 401 }
			);
		}

		if (action === "verify") {
			await updateUser(userId, { verified: true });
		} else if (action === "unverify") {
			await updateUser(userId, { verified: false });
		} else if (action === "block") {
			await updateUser(userId, { isBlocked: true });
		} else if (action === "unblock") {
			await updateUser(userId, { isBlocked: false });
		} else if (action === "update" && updates) {
			const updateData = {};
			if (updates.name !== undefined) updateData.name = updates.name;
			if (updates.email !== undefined) updateData.email = updates.email;
			if (updates.phone !== undefined) updateData.phone = updates.phone;
			if (updates.bio !== undefined) updateData.bio = updates.bio;
			if (updates.location !== undefined) updateData.location = updates.location;
			if (updates.company !== undefined) updateData.company = updates.company;

			await updateUser(userId, updateData);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Admin user update error:", error);
		return NextResponse.json(
			{ message: "Failed to update user" },
			{ status: 500 }
		);
	}
}

export async function DELETE(request) {
	try {
		const { searchParams } = new URL(request.url);
		const adminId = searchParams.get("adminId");
		const userId = searchParams.get("userId");
		
		const admin = await getUserById(adminId);
		if (!admin || admin.role !== "admin") {
			return NextResponse.json(
				{ message: "Unauthorized" },
				{ status: 401 }
			);
		}
		
		await deleteUser(userId);
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Admin user delete error:", error);
		return NextResponse.json(
			{ message: "Failed to delete user" },
			{ status: 500 }
		);
	}
}
