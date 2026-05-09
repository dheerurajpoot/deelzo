"use server";

import { auth as adminAuth, db } from "@/lib/firebaseAdmin";
import { cookies } from "next/headers";
import { userService } from "@/services/userService";
// Note: We'll use a server-side version of userService if needed, 
// but for now, let's keep it simple.

export async function loginAction(idToken) {
    try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const userId = decodedToken.uid;
        
        // Fetch user role from RTDB
        const user = await adminAuth.getUser(userId);
        // We might need to fetch custom claims or data from RTDB
        // For now, let's assume role is in RTDB
        const userRef = db.ref(`users/${userId}`);
        const snapshot = await userRef.once('value');
        const userData = snapshot.val();
        const role = userData?.role || 'user';

        const cookieStore = await cookies();
        cookieStore.set("token", idToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 30 * 24 * 60 * 60,
            path: "/",
        });
        cookieStore.set("userRole", role, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 30 * 24 * 60 * 60,
            path: "/",
        });

        return { success: true, role };
    } catch (error) {
        console.error("Login action error:", error);
        return { success: false, message: error.message };
    }
}

export async function logoutAction() {
    const cookieStore = await cookies();
    cookieStore.delete("token");
    cookieStore.delete("userRole");
    return { success: true };
}
