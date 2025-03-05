import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "hawai-52704.firebaseapp.com",
  projectId: "hawai-52704",
  storageBucket: "hawai-52704.appspot.com",
  messagingSenderId: "399515824553",
  appId: "1:399515824553:web:d33948f41db65806bc54b8",
  measurementId: "G-NMN82DJC5Y"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
