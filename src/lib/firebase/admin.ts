import * as admin from 'firebase-admin';

if (!admin.apps.length) {
	try {
		// Attempt to use the service account key if available in env
		const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
		
		if (serviceAccountRaw) {
			const serviceAccount = JSON.parse(serviceAccountRaw);
			admin.initializeApp({
				credential: admin.credential.cert(serviceAccount)
			});
		} else {
			// Fallback placeholder (this will be needed to run functions locally or in production)
			console.warn("FIREBASE_SERVICE_ACCOUNT_KEY not found. Defaulting to application default credentials.");
			admin.initializeApp();
		}
	} catch (error) {
		console.error('Firebase admin initialization error', error);
	}
}

const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();

export { admin, db, auth, storage };
