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

// Serverless environments (Vercel) ke liye safe initialization
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export default async function handler(req, res) {
  // TheoremReach dono tarah ke parameters bhej sakta hai
  // Hum pehle 'tr_' prefixed parameters check karenge jo logs mein nazar aaye hain
  const user_id = req.query.tr_user_id || req.query.user_id;
  const reward = req.query.tr_reward || req.query.reward || req.query.reward_amount;
  const status = req.query.tr_status || req.query.status;

  // Debugging ke liye Vercel logs mein data print karein
  console.log("--- TheoremReach Callback Data ---");
  console.log(`User: ${user_id}, Reward: ${reward}, Status: ${status}`);

  // Validation: User ID honi chahiye, Reward Number hona chahiye, aur Status "1" (Success) hona chahiye
  const finalReward = Number(reward);

  if (user_id && !isNaN(finalReward) && status == "1") {
    try {
      const userRef = doc(db, "users", user_id);
      
      // Firestore update: Wallet balance barhayen
      await updateDoc(userRef, {
        walletBalance: increment(finalReward)
      });

      console.log(`SUCCESS: Wallet updated for ${user_id} with ${finalReward} coins.`);
      
      // TheoremReach success ke liye sirf "1" ka response mangta hai
      return res.status(200).send("1");
    } catch (error) {
      console.error("FIRESTORE ERROR:", error);
      // Agar database masla kare toh hum TR ko '0' bhejenge taake wo retry kar sakay
      return res.status(200).send("0");
    }
  }

  // Agar data sahi nahi ya status 1 nahi hai
  console.log("FAILED: Invalid request data or incomplete survey.");
  res.status(200).send("0");
}