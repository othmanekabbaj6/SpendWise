import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

// Créer ou mettre à jour le profil utilisateur
export const saveUserProfile = async ({ firstName, lastName, bio, photoURL }) => {
  if (!auth.currentUser) throw new Error("Utilisateur non connecté");
  const userRef = doc(db, "users", auth.currentUser.uid);
  await setDoc(userRef, { firstName, lastName, bio, photoURL }, { merge: true });
};

// Récupérer le profil utilisateur
export const getUserProfile = async () => {
  if (!auth.currentUser) return null;
  const userRef = doc(db, "users", auth.currentUser.uid);
  const snapshot = await getDoc(userRef);
  return snapshot.exists() ? snapshot.data() : null;
};