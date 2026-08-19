// src/firebase.js
//
// Firebase app initialization. Sets up Auth (what Login.jsx needs), Firestore
// (what the Dashboard needs for live data), Storage (what Assignments.jsx
// needs for file submissions), and Analytics (optional — only initializes if
// VITE_FIREBASE_MEASUREMENT_ID is set, since Analytics doesn't work in
// non-browser/SSR contexts and isn't needed for auth to function).
//
// Requires: npm install firebase
//
// Reads config from Vite env vars (import.meta.env.VITE_*) rather than
// hardcoding it, so it's easy to swap configs between environments without
// touching code. Create a `.env.local` in your project root (same folder as
// package.json) with:
//
//   VITE_FIREBASE_API_KEY=...
//   VITE_FIREBASE_AUTH_DOMAIN=...
//   VITE_FIREBASE_PROJECT_ID=...
//   VITE_FIREBASE_STORAGE_BUCKET=...
//   VITE_FIREBASE_MESSAGING_SENDER_ID=...
//   VITE_FIREBASE_APP_ID=...
//   VITE_FIREBASE_MEASUREMENT_ID=...   (optional, only if using Analytics)
//
// All values are in Firebase Console → Project settings → General →
// "Your apps" → SDK setup and configuration. Vite only exposes env vars
// prefixed with VITE_ to client code, and .env.local is gitignored by
// default in Vite projects.
//
// Note: `storageBucket` above must be set for the Storage export below to
// work — it's the same config block, no extra env var needed.

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Analytics only runs in a real browser (it checks for things like
// cookie/indexedDB support), so it's initialized async and guarded rather
// than called directly at module load.
export let analytics = null;
if (firebaseConfig.measurementId) {
  isSupported().then((supported) => {
    if (supported) analytics = getAnalytics(app);
  });
}

export default app;