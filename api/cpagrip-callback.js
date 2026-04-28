import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore, doc, updateDoc, increment } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC0BjZD26bpZRQwKu1GK6AFevKqZ_t-qdE",
  authDomain: "mlm-earning-platform.firebaseapp.com",
  projectId: "mlm-earning-platform",
  storageBucket: "mlm-earning-platform.firebasestorage.app",
  messagingSenderId: "457551856006",
  appId: "1:457551856006:web:a8831ab277546df35dac07"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export default async function handler(req, res) {
  const user_id = req.query.user_id || req.body.user_id;
  const points = req.query.points || req.body.points; // CPAGrip payout (e.g., 0.12)

  if (user_id && points) {
    try {
      const userRef = doc(db, "users", user_id);
      
      // LOGIC: $1 = 500 Coins (Jo Rs. 50 ke barabar hain)
      const multiplier = 500; 
      const totalCoins = Math.floor(Number(points) * multiplier); 

      if (totalCoins > 0) {
        await updateDoc(userRef, {
          walletBalance: increment(totalCoins)
        });
        console.log(`Success: Added ${totalCoins} coins to ${user_id}`);
        return res.status(200).send("OK");
      } else {
        return res.status(200).send("Payout too small");
      }
    } catch (error) {
      console.error("Firestore Error:", error);
      return res.status(200).send("Error");
    }
  }
  return res.status(400).send("Missing Data");
}