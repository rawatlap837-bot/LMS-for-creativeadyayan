// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

// ----------------------------------------------------
// 1. Firebase Environment Variables
// ----------------------------------------------------

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// ----------------------------------------------------
// 2. Check Required Firebase Configuration
// ----------------------------------------------------

const requiredFirebaseConfig = {
  VITE_FIREBASE_API_KEY: firebaseConfig.apiKey,
  VITE_FIREBASE_AUTH_DOMAIN: firebaseConfig.authDomain,
  VITE_FIREBASE_PROJECT_ID: firebaseConfig.projectId,
  VITE_FIREBASE_STORAGE_BUCKET: firebaseConfig.storageBucket,
  VITE_FIREBASE_MESSAGING_SENDER_ID:
    firebaseConfig.messagingSenderId,
  VITE_FIREBASE_APP_ID: firebaseConfig.appId,
};

const missingVariables = Object.entries(requiredFirebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingVariables.length > 0) {
  throw new Error(
    `Firebase configuration is incomplete. Missing environment variables:\n${missingVariables.join(
      "\n"
    )}`
  );
}

// ----------------------------------------------------
// 3. Initialize Firebase
// ----------------------------------------------------

const app = initializeApp(firebaseConfig);

// ----------------------------------------------------
// 4. Firebase Authentication
// ----------------------------------------------------

export const auth = getAuth(app);

// ----------------------------------------------------
// 5. Firestore Database
// ----------------------------------------------------

export const db = getFirestore(app);

// ----------------------------------------------------
// 6. Firebase Storage
// ----------------------------------------------------

export const storage = getStorage(app);

// ----------------------------------------------------
// 7. Firebase Analytics
// ----------------------------------------------------

export let analytics = null;

if (firebaseConfig.measurementId) {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch((error) => {
      console.warn("Firebase Analytics could not initialize:", error);
    });
}

// ----------------------------------------------------
// 8. Export Firebase App
// ----------------------------------------------------

export default app;