import { MongoClient } from 'mongodb';
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CONFIGURATION ---
const MONGO_URI = process.env.MONGODB_URI;
const MONGO_DB_NAME = "test"; 
const FIREBASE_DB_URL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;

if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    console.error("FIREBASE_SERVICE_ACCOUNT_JSON missing in .env");
    process.exit(1);
}

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: FIREBASE_DB_URL
});

const rtdb = admin.database();

async function migrate() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(MONGO_DB_NAME);
    console.log("Connected to MongoDB");

    // All collections to migrate
    const collections = ['users', 'listings', 'blogs', 'products', 'orders', 'bids', 'categories', 'coupons', 'plans', 'transactions', 'carts'];

    for (const collectionName of collections) {
      console.log(`\nMigrating ${collectionName}...`);
      
      const coll = db.collection(collectionName);
      const data = await coll.find({}).toArray();
      
      if (data.length === 0) {
        console.log(`No data found in ${collectionName}. Skipping.`);
        continue;
      }

      console.log(`Found ${data.length} items in ${collectionName}. Uploading to Firebase...`);

      const updates = {};
      data.forEach(item => {
        // Convert MongoDB ObjectId to string for the key
        const id = item._id.toString();
        
        // Remove MongoDB internal _id
        const { _id, ...firebaseItem } = item;
        
        // Deeply clean ObjectIds in the document
        const cleanedItem = JSON.parse(JSON.stringify(firebaseItem, (key, value) => {
            // Handle MongoDB extended JSON formats if present
            if (value && typeof value === 'object' && value.$oid) return value.$oid;
            return value;
        }));

        updates[`/${collectionName}/${id}`] = cleanedItem;
      });

      // Update in chunks to avoid large payload errors if needed, 
      // but for RTDB update() usually handles bulk well for moderate sizes.
      await rtdb.ref().update(updates);
      console.log(`Successfully migrated ${data.length} items to /${collectionName}`);
    }

    console.log("\n====================================");
    console.log("MIGRATION COMPLETED SUCCESSFULLY!");
    console.log("====================================\n");

  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await client.close();
    process.exit(0);
  }
}

migrate();
