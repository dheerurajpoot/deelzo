const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

// Read .env manually
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  const envConfig = require("dotenv").parse(fs.readFileSync(envPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

async function test() {
  try {
    const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountRaw) {
      console.log("No FIREBASE_SERVICE_ACCOUNT_KEY in .env");
      return;
    }
    
    const serviceAccount = JSON.parse(serviceAccountRaw);
    console.log("Parsed service account. Project ID:", serviceAccount.project_id);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    const db = admin.firestore();
    console.log("Firestore initialized. Attempting to read users collection...");
    
    const snapshot = await db.collection("users").limit(1).get();
    console.log("Read successful. Documents count:", snapshot.size);
    
  } catch (error) {
    console.error("Test failed:", error);
  }
}

test();
