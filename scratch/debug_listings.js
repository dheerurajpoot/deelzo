import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const FIREBASE_DB_URL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: FIREBASE_DB_URL
    });
}

const db = admin.database();

async function debugListings() {
    console.log("Fetching listings...");
    const snapshot = await db.ref('listings').limitToFirst(5).get();
    if (snapshot.exists()) {
        console.log("Listings found:");
        console.log(JSON.stringify(snapshot.val(), null, 2));
    } else {
        console.log("No listings found in /listings");
    }
    process.exit(0);
}

debugListings();
