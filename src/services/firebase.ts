import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAZPC_wvOhc9p4TcoHBiZyF4h3TCrPqirw",
  authDomain: "fir-project-abbd4.firebaseapp.com",
  projectId: "fir-project-abbd4",
  storageBucket: "fir-project-abbd4.firebasestorage.app",
  messagingSenderId: "355597089857",
  appId: "1:355597089857:web:49846c97d4b0e368fc5ac0"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);