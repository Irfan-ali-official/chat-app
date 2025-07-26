import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword, // Add this
  createUserWithEmailAndPassword, // Add this
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAle5hvCuvKH6WnUgxLUSJl5Ztq8gW1M28",
  authDomain: "brohi-khandan.firebaseapp.com",
  projectId: "brohi-khandan",
  storageBucket: "brohi-khandan.firebasestorage.app",
  messagingSenderId: "1065385710450",
  appId: "1:1065385710450:web:0fc6161b5a433be85603eb",
  measurementId: "G-9JY3J265EV",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Add these exports
export { signInWithEmailAndPassword, createUserWithEmailAndPassword };
