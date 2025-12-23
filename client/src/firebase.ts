// client/src/firebase.ts

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBr37NA6OZOGzGAFWgkxmP_geloejAD8r8",
  authDomain: "saferouteai-268b5.firebaseapp.com",
  projectId: "saferouteai-268b5",
  storageBucket: "saferouteai-268b5.firebasestorage.app",
  messagingSenderId: "98947598162",
  appId: "1:98947598162:web:efa2f4a8ac2b8bdcc41c8b",
  measurementId: "G-MWW5ZE07W0"
};

const app = initializeApp(firebaseConfig);

// 🔥 Firestore only (NO analytics)
export const db = getFirestore(app);
