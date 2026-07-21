import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCuwSbRavW0o0SoiVUGqj9VscuQP_lqww",
  authDomain: "tabira-501c4.firebaseapp.com",
  projectId: "tabira-501c4",
  storageBucket: "tabira-501c4.firebasestorage.app",
  messagingSenderId: "892823348726",
  appId: "1:892823348726:web:62f31e9d0a5fd4651bd3d7",
  measurementId: "G-0JY4CVNX4D"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
