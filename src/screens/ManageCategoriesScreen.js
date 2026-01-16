import React, { useContext, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { CategoryContext } from "../context/CategoryContext";
import { ExpenseContext } from "../context/ExpenseContext";
import { Swipeable } from "react-native-gesture-handler";

export default function ManageCategoriesScreen() {
  const { categories, deleteCategory } = useContext(CategoryContext);
  const { expenses } = useContext(ExpenseContext);

  // ------------------ PER CATEGORY ------------------
  const categoriesWithCount = useMemo(() => {
    return categories.map((cat) => {
      const items = expenses.filter((exp) => exp.category === cat);
      const expenseCount = items.filter((i) => i.type === "expense").length;
      const revenueCount = items.filter((i) => i.type === "income").length;
      return { name: cat, expenseCount, revenueCount };
    });
  }, [categories, expenses]);

  // ------------------ DELETE CATEGORY ------------------
  const confirmDelete = (categoryName) => {
    const relatedExpenses = expenses.filter((e) => e.category === categoryName);
    Alert.alert(
      "Delete Category",
      `Are you sure you want to delete "${categoryName}"?\n\nThis will also remove ${relatedExpenses.length} transaction(s) associated with it.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteCategory(categoryName) },
      ]
    );
  };

  // ------------------ SWIPE ACTIONS ------------------
  const renderRightActions = (item) => (
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => confirmDelete(item.name)}
    >
      <Text style={styles.actionText}>Delete</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* Swipe instruction */}
      {categoriesWithCount.length > 0 && (
        <Text style={styles.swipeInstruction}>
          Swipe left on a category to delete
        </Text>
      )}

      {/* Category list */}
      <FlatList
        data={categoriesWithCount}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <Swipeable renderRightActions={() => renderRightActions(item)}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <View style={styles.badgesContainer}>
                {item.expenseCount > 0 && (
                  <View style={[styles.badge, { backgroundColor: "#f44336" }]}>
                    <Text style={styles.badgeText}>{item.expenseCount} Expense(s)</Text>
                  </View>
                )}
                {item.revenueCount > 0 && (
                  <View style={[styles.badge, { backgroundColor: "#0a6607" }]}>
                    <Text style={styles.badgeText}>{item.revenueCount} Income(s)</Text>
                  </View>
                )}
              </View>
            </View>
          </Swipeable>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  swipeInstruction: {
    textAlign: "center",
    color: "#555",
    fontStyle: "italic",
    marginBottom: 8,
    fontSize: 12,
  },
  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardTitle: {
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 6,
  },
  badgesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: "#f44336",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    borderRadius: 12,
    marginVertical: 12,
  },
  actionText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
