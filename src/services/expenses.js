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

// ---------------- ADD EXPENSE ----------------
export const addExpenseToDB = async ({ name, amount, type, category, note, date }) => {
  if (!auth.currentUser) throw new Error("User not logged in");

  return addDoc(collection(db, "expenses"), {
    userId: auth.currentUser.uid,
    name: name || "Untitled",
    amount: Number(amount),
    type,
    category,
    note: note || "",
    date: date ? new Date(date) : new Date(),
    createdAt: serverTimestamp(),
  });
};

// ---------------- FETCH EXPENSES ONCE ----------------
export const fetchExpensesOnce = async () => {
  if (!auth.currentUser) throw new Error("User not logged in");

  const q = query(
    collection(db, "expenses"),
    where("userId", "==", auth.currentUser.uid),
    orderBy("date", "desc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// ---------------- REALTIME SUBSCRIPTION ----------------
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

// ---------------- REMOVE EXPENSE ----------------
export const removeExpense = async (expenseId) => {
  await deleteDoc(doc(db, "expenses", expenseId));
};

// ---------------- UPDATE EXPENSE ----------------
export const updateExpense = async (expenseId, { name, amount, type, category, note, date }) => {
  await updateDoc(doc(db, "expenses", expenseId), {
    name: name || "Untitled",
    amount,
    type,
    category,
    note,
    date: date ? new Date(date) : new Date(),
  });
};

// ---------------- DELETE EXPENSES BY CATEGORY ----------------
export const deleteExpensesByCategory = async (categoryName) => {
  if (!auth.currentUser) throw new Error("User not logged in");

  const q = query(
    collection(db, "expenses"),
    where("userId", "==", auth.currentUser.uid),
    where("category", "==", categoryName)
  );

  const snapshot = await getDocs(q);
  const batch = snapshot.docs.map(docSnap => deleteDoc(doc(db, "expenses", docSnap.id)));

  await Promise.all(batch);
};
