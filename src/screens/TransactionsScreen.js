// src/screens/TransactionsScreen.js
import React, { useContext, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { ExpenseContext } from "../context/ExpenseContext";
import { Swipeable } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import ExpenseCard from "../components/ExpenseCard";

export default function TransactionsScreen() {
  const { expenses, deleteExpense } = useContext(ExpenseContext);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const confirmDelete = (id) => {
    Alert.alert("Supprimer", "Voulez-vous supprimer cette transaction ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", onPress: () => deleteExpense(id) },
    ]);
  };

  const renderRightActions = (item) => (
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => confirmDelete(item.id)}
    >
      <Text style={styles.actionText}>Supprimer</Text>
    </TouchableOpacity>
  );

  const renderLeftActions = (item) => (
    <TouchableOpacity
      style={styles.editButton}
      onPress={() => navigation.navigate("Add", { expenseToEdit: item })}
    >
      <Text style={styles.actionText}>Modifier</Text>
    </TouchableOpacity>
  );

  const translateType = (type) => (type === "income" ? "Revenu" : "Dépense");

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {expenses.length > 0 && (
        <Text style={styles.swipeHint}>
          Glissez une transaction vers la gauche pour supprimer ou vers la droite pour modifier
        </Text>
      )}

      {expenses.length === 0 && (
        <View style={{ marginTop: 40, alignItems: "center" }}>
          <Text style={styles.noTransactions}>
            Aucune transaction enregistrée.
          </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate("Add")}
            style={styles.addButton}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>
              Ajouter une transaction
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Swipeable
            renderRightActions={() => renderRightActions(item)}
            renderLeftActions={() => renderLeftActions(item)}
          >
            <ExpenseCard
              item={{
                ...item,
                displayType: translateType(item.type),
              }}
            />
          </Swipeable>
        )}
        refreshing={refreshing}
        onRefresh={() => {}}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  swipeHint: {
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
    marginBottom: 10,
    textAlign: "center",
  },
  noTransactions: {
    color: "#888",
    fontStyle: "italic",
    marginBottom: 10,
    textAlign: "center",
  },
  addButton: {
    backgroundColor: "#0a6607ff",
    padding: 12,
    borderRadius: 10,
    alignSelf: "center",
  },
  deleteButton: {
    backgroundColor: "#f55",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    borderRadius: 12,
    marginVertical: 5,
  },
  editButton: {
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    borderRadius: 12,
    marginVertical: 5,
  },
  actionText: { color: "#fff", fontWeight: "bold" },
});
