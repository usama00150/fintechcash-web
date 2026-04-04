import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC0BjZD26bpZRQwKu1GK6AFevKqZ_t-qdE",
  authDomain: "mlm-earning-platform.firebaseapp.com",
  projectId: "mlm-earning-platform",
  storageBucket: "mlm-earning-platform.firebasestorage.app",
  messagingSenderId: "457551856006",
  appId: "1:457551856006:web:a8831ab277546df35dac07"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);