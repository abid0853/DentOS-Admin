import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBuzxr91g5U44HZMAb0kExG0CJ2KeXELeo",
  authDomain: "dentos-appointments.firebaseapp.com",
  projectId: "dentos-appointments",
  storageBucket: "dentos-appointments.firebasestorage.app",
  messagingSenderId: "263379647994",
  appId: "1:263379647994:web:f79860105249489fb8b843",
  measurementId: "G-9H0RLCSME3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// THIS IS THE CRITICAL LINE: Notice the 'export' keyword before 'const db'
export const db = getFirestore(app);