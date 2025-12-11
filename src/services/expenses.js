// src/services/expenses.js
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "./firebase";

// Ajouter une nouvelle dépense
export const addExpenseToDB = async ({ name, amount, type, category, note, date }) => {
  if (!auth.currentUser) throw new Error("Utilisateur non connecté");

  return addDoc(collection(db, "expenses"), {
    userId: auth.currentUser.uid,
    name: name || "Sans titre",      // <- Champ name ajouté
    amount: Number(amount),
    type,
    category,
    note: note || "",
    date: date ? new Date(date) : new Date(),
    createdAt: serverTimestamp(),
  });
};

// Récupérer toutes les dépenses une seule fois
export const fetchExpensesOnce = async () => {
  if (!auth.currentUser) throw new Error("Utilisateur non connecté");

  const q = query(
    collection(db, "expenses"),
    where("userId", "==", auth.currentUser.uid),
    orderBy("date", "desc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// Écoute en temps réel des dépenses
export const subscribeToExpenses = (onUpdate) => {
  if (!auth.currentUser) return () => {};

  const q = query(
    collection(db, "expenses"),
    where("userId", "==", auth.currentUser.uid)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      date: d.data().date?.toDate
        ? d.data().date.toDate().toISOString()
        : new Date(d.data().date).toISOString(),
    }));
    data.sort((a, b) => new Date(b.date) - new Date(a.date));
    onUpdate(data);
  });

  return unsubscribe;
};

// Supprimer une dépense
export const removeExpense = async (expenseId) => {
  await deleteDoc(doc(db, "expenses", expenseId));
};

// Mettre à jour une dépense
export const updateExpense = async (expenseId, { name, amount, type, category, note, date }) => {
  await updateDoc(doc(db, "expenses", expenseId), {
    name: name || "Sans titre",   // <- Champ name ajouté
    amount,
    type,
    category,
    note,
    date: date ? new Date(date) : new Date(),
  });
};
