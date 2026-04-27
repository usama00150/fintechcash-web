import { db } from "../src/firebase"; // Check karein ke path sahi ho
import { doc, updateDoc, increment } from "firebase/firestore";

export default async function handler(req, res) {
  const { user_id, points } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (user_id && points) {
    try {
      const userRef = doc(db, "users", user_id);
      
      // Firestore mein balance update karein
      await updateDoc(userRef, {
        walletBalance: increment(parseInt(points))
      });

      console.log(`Success: Added ${points} to ${user_id}`);
      return res.status(200).send("OK");
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).send("Error updating balance");
    }
  }

  return res.status(400).send("Invalid Request");
}