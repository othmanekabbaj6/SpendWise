import React, { createContext, useState, useEffect } from "react";
import { auth } from "../services/firebase";
import {
  subscribeToExpenses,
  addExpenseToDB,
  removeExpense,
  updateExpense,
  fetchExpensesOnce,
  deleteExpensesByCategory
} from "../services/expenses";

export const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);

  

  useEffect(() => {
    let unsubscribe = () => {};

    const initListener = () => {
      if (!auth.currentUser) {
        setExpenses([]);
        return;
      }

      setLoading(true);

      unsubscribe = subscribeToExpenses((data) => {
        const normalized = data.map((d) => ({
          id: d.id,
          name: d.name || "Sans titre", // fallback pour anciennes transactions
          type: d.type,
          category: d.category,
          note: d.note || "",
          amount: d.amount,
          date: d.date?.toDate
            ? d.date.toDate().toISOString()
            : new Date(d.date).toISOString(),
        }));

        normalized.sort((a, b) => new Date(b.date) - new Date(a.date));
        setExpenses(normalized);
        setLoading(false);
      });

      // Fallback : fetch ponctuel si collection vide
      fetchExpensesOnce()
        .then((data) => {
          if (!data.length) setExpenses([]);
        })
        .catch(() => {});
    };

    initListener();

    const authUnsub = auth.onAuthStateChanged(() => {
      unsubscribe();
      initListener();
    });

    return () => {
      unsubscribe();
      authUnsub();
    };
  }, []);

  const addExpense = async (payload) => {
    if (!auth.currentUser || !auth.currentUser.uid)
      throw new Error("Utilisateur non connecté");

    const newExpense = {
      name: payload.name || "Sans titre",
      type: payload.type,
      category: payload.category,
      note: payload.note || "",
      amount: payload.amount,
      date: payload.date || new Date().toISOString(),
    };

    await addExpenseToDB(newExpense);
  };

  const deleteExpense = async (id) => {
    await removeExpense(id);
  };

  const editExpense = async (id, payload) => {
    const updatedExpense = {
      name: payload.name || "Sans titre",
      type: payload.type,
      category: payload.category,
      note: payload.note || "",
      amount: payload.amount,
      date: payload.date || new Date().toISOString(),
    };
    await updateExpense(id, updatedExpense);
  };

  const deleteExpensesByCategory = (categoryName) => {
    setExpenses((prev) => prev.filter((e) => e.category !== categoryName));
};

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        loading,
        addExpense,
        deleteExpense,
        editExpense,
        deleteExpensesByCategory, 
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};
