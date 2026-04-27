const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

// Firebase Admin initialize karein taake Firestore tak access mil sakay
admin.initializeApp();
const db = admin.firestore();

exports.cpagripPostback = onRequest(async (req, res) => {
  // CPAGrip humein URL parameters mein user_id aur points bhejega
  const user_id = req.query.user_id;
  const points = req.query.points;

  if (user_id && points) {
    try {
      const userRef = db.collection("users").doc(user_id);
      
      // User ka balance increment (jama) karein
      await userRef.update({
        walletBalance: admin.firestore.FieldValue.increment(parseInt(points))
      });

      console.log(`Success: Added ${points} coins to user ${user_id}`);
      return res.status(200).send("OK");
    } catch (error) {
      console.error("Firestore Error:", error);
      return res.status(500).send("Database Error");
    }
  }

  return res.status(400).send("Missing parameters");
});