import React, { createContext, useState, useEffect } from "react";
import { auth, db } from "../services/firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let unsubscribe = () => {};

    const initProfileListener = () => {
      if (!auth.currentUser) {
        setProfile(null);
        return;
      }

      const docRef = doc(db, "users", auth.currentUser.uid);

      
      unsubscribe = onSnapshot(docRef, (snapshot) => {
        setProfile(snapshot.exists() ? snapshot.data() : null);
      });
    };

    initProfileListener();

    
    const authUnsub = auth.onAuthStateChanged(() => {
      unsubscribe();
      initProfileListener();
    });

    return () => {
      unsubscribe();
      authUnsub();
    };
  }, []);

  const updateProfile = async (data) => {
    if (!auth.currentUser) throw new Error("Utilisateur non connecté");
    const docRef = doc(db, "users", auth.currentUser.uid);
    await setDoc(docRef, data, { merge: true });
    setProfile((prev) => ({ ...prev, ...data }));
  };

  return (
    <UserContext.Provider value={{ profile, updateProfile }}>
      {children}
    </UserContext.Provider>
  );
};
