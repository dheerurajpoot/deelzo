import admin from "firebase-admin";

if (!admin.apps.length) {
	try {
		const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
		admin.initializeApp({
			credential: admin.credential.cert(serviceAccount),
			databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
		});
	} catch (error) {
		console.error("Firebase admin initialization error", error);
	}
}

const db = admin.database();
const auth = admin.auth();

export { db, auth };
