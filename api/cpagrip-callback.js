import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore, doc, updateDoc, increment } from "firebase/firestore";

// ⚠️ Aapki Firebase Config (Wahi jo callback.js mein hai)
const firebaseConfig = {
  apiKey: "AIzaSyC0BjZD26bpZRQwKu1GK6AFevKqZ_t-qdE",
  authDomain: "mlm-earning-platform.firebaseapp.com",
  projectId: "mlm-earning-platform",
  storageBucket: "mlm-earning-platform.firebasestorage.app",
  messagingSenderId: "457551856006",
  appId: "1:457551856006:web:a8831ab277546df35dac07"
};

// Firebase initialize karein (agar pehle se nahi hai)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export default async function handler(req, res) {
  // GET request check karein
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { user_id, points } = req.query;

  if (user_id && points) {
    try {
      const userRef = doc(db, "users", user_id);
      
      // Balance update karein
      await updateDoc(userRef, {
        walletBalance: increment(parseInt(points))
      });

      return res.status(200).send("OK");
    } catch (error) {
      console.error("Firestore Error:", error);
      return res.status(500).send("Database Update Failed");
    }
  }

  return res.status(400).send("Missing Parameters");
}