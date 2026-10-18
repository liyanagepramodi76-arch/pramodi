// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDY9UIaUUcmY6PK0h5rDasUPzEEEr3MF3g",
  authDomain: "rubbertrade-93755.firebaseapp.com",
  projectId: "rubbertrade-93755",
  storageBucket: "rubbertrade-93755.firebasestorage.app",
  messagingSenderId: "580077320454",
  appId: "1:580077320454:web:682a431df82824d4ea0687"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export
export { auth, db, storage };

// Test message
console.log("✅ Firebase Connected Successfully");