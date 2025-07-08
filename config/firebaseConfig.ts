import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // ✅ استخدم getFirestore فقط

const firebaseConfig = {
  apiKey: 'AIzaSyAwXjFMfGXjYFJKZip-y9jrfPkKCnZwy7E',
  authDomain: 'nashmi-gym.firebaseapp.com',
  projectId: 'nashmi-gym',
  storageBucket: 'nashmi-gym.firebasestorage.app',
  messagingSenderId: '240004176287',
  appId: '1:240004176287:web:f0544ac54be4bb674fc5aa',
  measurementId: 'G-JM9Z8HNY7E'
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// ✅ لا تعيد التهيئة: استخدم getFirestore
export const auth = getAuth(app);
export const db = getFirestore(app);
