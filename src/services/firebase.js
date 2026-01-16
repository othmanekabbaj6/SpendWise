// src/services/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Config Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDeaXFAEsUVVqqoihxNj8F6eatoDAccMJQ",
  authDomain: "spendwise-84b21.firebaseapp.com",
  projectId: "spendwise-84b21",
  storageBucket: "spendwise-84b21.firebasestorage.app",
  messagingSenderId: "57496208812",
  appId: "1:57496208812:web:4ff24341d4050131c2a609"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Auth pour React Native avec persistance
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Firestore
export const db = getFirestore(app);