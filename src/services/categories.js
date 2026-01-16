import { db } from "./firebase";
import { collection, getDocs, addDoc, deleteDoc, query, where, doc } from "firebase/firestore";

const categoriesRef = collection(db, "categories");

/**
 * Fetch all categories from Firestore
 * @returns {Promise<string[]>} array of category names
 */
export const getCategories = async () => {
  const snapshot = await getDocs(categoriesRef);
  return snapshot.docs.map(doc => doc.data().name);
};

/**
 * Add a new category to Firestore
 * @param {string} name
 * @returns {Promise<void>}
 */
export const addCategory = async (name) => {
  if (!name.trim()) throw new Error("Category name is required");
  await addDoc(categoriesRef, { name });
};

/**
 * Delete a category from Firestore
 * @param {string} name
 * @returns {Promise<void>}
 */
export const deleteCategory = async (name) => {
  const q = query(categoriesRef, where("name", "==", name));
  const snapshot = await getDocs(q);
  const batch = snapshot.docs.map(docSnap => deleteDoc(doc(db, "categories", docSnap.id)));
  await Promise.all(batch);
};
