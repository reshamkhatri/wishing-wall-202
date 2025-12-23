import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

console.log("Config loaded:", {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  apiKeyPresent: !!firebaseConfig.apiKey
});

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function testConnection() {
  try {
    console.log("1. Attempting Auth...");
    const userCred = await signInAnonymously(auth);
    console.log("✅ Auth Success! User:", userCred.user.uid);

    console.log("2. Attempting Database Write...");
    const docRef = await addDoc(collection(db, "test_writes"), {
      timestamp: new Date(),
      test: true
    });
    console.log("✅ Write Success! ID:", docRef.id);
    console.log("🎉 EVERYTHING IS WORKING CORRECTLY!");
  } catch (error) {
    console.error("❌ FAILED:");
    console.error(error.code || error.message);
    if (error.code === 'permission-denied') {
      console.error("Reason: Database Rules are blocking access. Make sure rules allow read/write.");
    } else if (error.code === 'unavailable') {
      console.error("Reason: Network issue or Firestore is down.");
    }
  }
}

testConnection();
