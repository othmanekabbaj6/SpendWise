// src/context/CategoryContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import { Alert } from "react-native";
import * as CategoryService from "../services/categories";
import { ExpenseContext } from "./ExpenseContext"; // Import to delete related transactions

export const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const { deleteExpensesByCategory } = useContext(ExpenseContext); // function to delete expenses
  const [categories, setCategories] = useState([]);

  const loadCategories = async () => {
    try {
      const cats = await CategoryService.getCategories();
      if (cats.length === 0) {
        // Add default category if empty
        await CategoryService.addCategory("Other");
        setCategories(["Other"]);
      } else {
        setCategories(cats);
      }
    } catch (err) {
      console.log("Error loading categories:", err.message);
      Alert.alert("Error", "Unable to load categories");
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const addCategory = async (newCategory) => {
    if (!newCategory.trim()) {
      Alert.alert("Error", "Category name is required");
      return;
    }
    if (categories.includes(newCategory)) {
      Alert.alert("Error", "This category already exists");
      return;
    }

    try {
      await CategoryService.addCategory(newCategory);
      setCategories((prev) => [...prev, newCategory]);
      Alert.alert("Success", `Category "${newCategory}" added`);
    } catch (err) {
      console.log("Error adding category:", err.message);
      Alert.alert("Error", "Unable to add category");
    }
  };

  const deleteCategory = (categoryName) => {
    Alert.alert(
      "Delete Category",
      `Are you sure you want to delete "${categoryName}"? All related transactions will also be deleted.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // Delete category in the service
              await CategoryService.deleteCategory(categoryName);

              // Delete related transactions
              deleteExpensesByCategory(categoryName);

              // Remove from local state
              setCategories((prev) =>
                prev.filter((cat) => cat !== categoryName)
              );

              Alert.alert("Success", `Category "${categoryName}" deleted`);
            } catch (err) {
              console.log("Error deleting category:", err.message);
              Alert.alert("Error", "Unable to delete category");
            }
          },
        },
      ]
    );
  };

  return (
    <CategoryContext.Provider
      value={{ categories, addCategory, deleteCategory }}
    >
      {children}
    </CategoryContext.Provider>
  );
};
