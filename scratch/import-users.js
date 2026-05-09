import admin from "firebase-admin";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import path from 'path';

dotenv.config();

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
    });
}

const rtdb = admin.database();

async function importUsers() {
    console.log("Fetching users from RTDB...");
    const snap = await rtdb.ref("users").once("value");
    const users = snap.val();
    
    if (!users) {
        console.log("No users found");
        process.exit(0);
    }

    const importedUsers = [];
    const BCRYPT_USERS = [];
    
    let count = 0;
    for (const [uid, data] of Object.entries(users)) {
        if (!data.email) continue;
        
        count++;
        if (count % 100 === 0) console.log(`Processed ${count} users...`);

        // Check if user already exists in Firebase Auth
        try {
            await admin.auth().getUser(uid);
            console.log(`User ${data.email} already exists in Auth with correct UID.`);
            continue;
        } catch (e) {
            if (e.code !== 'auth/user-not-found') {
                console.error("Error checking user:", e);
                continue;
            }
        }

        // Try to check by email
        try {
            const existing = await admin.auth().getUserByEmail(data.email);
            console.log(`User ${data.email} exists with DIFFERENT UID: ${existing.uid}, but we need UID: ${uid}. Deleting existing to replace with correct UID...`);
            await admin.auth().deleteUser(existing.uid);
            console.log(`Deleted user ${existing.uid}`);
            
            // Delete from RTDB if there's a record for the different UID, since it's a duplicate created by signup
            await rtdb.ref(`users/${existing.uid}`).remove();
        } catch (e) {
             if (e.code !== 'auth/user-not-found') {
                console.error("Error checking user by email:", e);
                continue;
            }
        }

        if (data.password && (data.password.startsWith('$2b$') || data.password.startsWith('$2a$'))) {
            // It's a bcrypt hash
            BCRYPT_USERS.push({
                uid: uid,
                email: data.email,
                passwordHash: Buffer.from(data.password),
                displayName: data.name || undefined,
            });
        } else {
            // Create without password or with random password
            try {
                await admin.auth().createUser({
                    uid: uid,
                    email: data.email,
                    displayName: data.name || undefined,
                    password: data.password || Math.random().toString(36).slice(-8) + 'A1!'
                });
                console.log(`Created user ${data.email} with standard create.`);
            } catch (err) {
                console.error(`Failed to create ${data.email}:`, err);
            }
        }
    }

    console.log(`Found ${BCRYPT_USERS.length} users to import with bcrypt.`);

    if (BCRYPT_USERS.length > 0) {
        for (let i = 0; i < BCRYPT_USERS.length; i += 1000) {
            const batch = BCRYPT_USERS.slice(i, i + 1000);
            try {
                const result = await admin.auth().importUsers(batch, {
                    hash: {
                        algorithm: 'BCRYPT'
                    }
                });
                console.log(`Imported batch of ${batch.length} users. Success: ${result.successCount}, Errors: ${result.failureCount}`);
                if (result.errors.length > 0) {
                    result.errors.forEach(err => console.error(err.error));
                }
            } catch (err) {
                console.error("Failed to import bcrypt batch:", err);
            }
        }
    }

    console.log("Done importing users.");
    process.exit(0);
}

importUsers().catch(console.error);
