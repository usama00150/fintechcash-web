import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore, doc, updateDoc, increment } from "firebase/firestore";

// Aapki Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyC0BjZD26bpZRQwKu1GK6AFevKqZ_t-qdE",
  authDomain: "mlm-earning-platform.firebaseapp.com",
  projectId: "mlm-earning-platform",
  storageBucket: "mlm-earning-platform.firebasestorage.app",
  messagingSenderId: "457551856006",
  appId: "1:457551856006:web:a8831ab277546df35dac07"
};

// Firebase initialize karein (prevent multiple initializations)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export default async function handler(req, res) {
  // Method check hata diya taake GET aur POST dono requests handle ho sakain
  
  // Data ko query (URL) aur body dono jagah check karein
  const user_id = req.query.user_id || req.body.user_id;
  const points = req.query.points || req.body.points;

  console.log(`Incoming request for User: ${user_id}, Points: ${points}`);

  if (user_id && points) {
    try {
      const userRef = doc(db, "users", user_id);
      
      // Points ko updateDoc ke zariye barhayen
      await updateDoc(userRef, {
        walletBalance: increment(Number(points))
      });

      console.log("Success: Wallet updated!");
      return res.status(200).send("OK");
    } catch (error) {
      console.error("Firestore Update Error:", error);
      // Status 200 hi bhej rahe hain taake CPAGrip retry na kare agar user ghalat ho
      return res.status(200).send("Error updating balance, but request received.");
    }
  }

  console.log("Failed: Missing user_id or points in request.");
  return res.status(400).send("Missing Parameters");
}