import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Gantikan dengan config sebenar anda dari Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDpWdftGmbMS-DVsfzcTmdVCTGqj8OhF9k",
  authDomain: "imsr-adtecsdk.firebaseapp.com",
  projectId: "imsr-adtecsdk",
  storageBucket: "imsr-adtecsdk.firebasestorage.app",
  messagingSenderId: "853830278392",
  appId: "1:853830278392:web:5ba02cd01b9527c76c2f0d"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);