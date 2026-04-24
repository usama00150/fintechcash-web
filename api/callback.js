import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc, increment } from "firebase/firestore";

// Aapki asli Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyC0BjZD26bpZRQwKu1GK6AFevKqZ_t-qdE",
  authDomain: "mlm-earning-platform.firebaseapp.com",
  projectId: "mlm-earning-platform",
  storageBucket: "mlm-earning-platform.firebasestorage.app",
  messagingSenderId: "457551856006",
  appId: "1:457551856006:web:a8831ab277546df35dac07"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
  const { user_id, reward, status } = req.query;

  // Agar status 1 hai toh survey success hai
  if (status === "1" && user_id && reward) {
    try {
      const userRef = doc(db, "users", user_id);
      
      // Database mein balance barha do
      await updateDoc(userRef, {
        walletBalance: increment(Number(reward))
      });

      // TheoremReach ko success signal "1" bhej do
      return res.status(200).send("1");
    } catch (error) {
      console.error("Firebase Update Error:", error);
      return res.status(200).send("0");
    }
  }

  // Agar reward na ho ya status sahi na ho toh 0 bhej do
  res.status(200).send("0");
}