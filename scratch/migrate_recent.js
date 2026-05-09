import { MongoClient } from 'mongodb';
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// --- CONFIGURATION ---
const MONGO_URI = process.env.MONGODB_URI;
const MONGO_DB_NAME = "test"; 
const FIREBASE_DB_URL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;

if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    console.error("FIREBASE_SERVICE_ACCOUNT_JSON missing in .env");
    process.exit(1);
}

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);

if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: FIREBASE_DB_URL
    });
}

const rtdb = admin.database();

async function migrateRecent(collectionNames = ['users', 'orders'], limit = 1) {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(MONGO_DB_NAME);
    console.log("Connected to MongoDB");

    for (const collectionName of collectionNames) {
      console.log(`\nChecking for recent items in ${collectionName}...`);
      
      const coll = db.collection(collectionName);
      // Sort by _id desc to get the most recent (works for ObjectId) or createdAt if exists
      const data = await coll.find({}).sort({ _id: -1 }).limit(limit).toArray();
      
      if (data.length === 0) {
        console.log(`No data found in ${collectionName}.`);
        continue;
      }

      console.log(`Found ${data.length} recent item(s) in ${collectionName}. Migrating...`);

      const updates = {};
      data.forEach(item => {
        const id = item._id.toString();
        const { _id, ...firebaseItem } = item;
        
        const cleanedItem = JSON.parse(JSON.stringify(firebaseItem, (key, value) => {
            if (value && typeof value === 'object' && value.$oid) return value.$oid;
            return value;
        }));

        updates[`/${collectionName}/${id}`] = cleanedItem;
        console.log(`- Prepared: ${id} (${item.email || item.orderId || 'item'})`);
      });

      await rtdb.ref().update(updates);
      console.log(`Successfully migrated ${data.length} item(s) to /${collectionName}`);
    }

    console.log("\nINCREMENTAL MIGRATION COMPLETED!");

  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await client.close();
    process.exit(0);
  }
}

// Specify collections to migrate here
migrateRecent(['users', 'orders'], 1);
