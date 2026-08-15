import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyAQLchLpvAW1wXkEBQ_O7E8WjnLkhyxoS8",
  authDomain: "app1-f74e8.firebaseapp.com",
  projectId: "app1-f74e8",
  storageBucket: "app1-f74e8.firebasestorage.app",
  messagingSenderId: "311248180543",
  appId: "1:311248180543:web:43f1f79481d2b63afe6f8a",
  measurementId: "G-G6ES79MTT2"


};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup };