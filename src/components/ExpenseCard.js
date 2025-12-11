// src/components/ExpenseCard.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function ExpenseCard({ item }) {
  const amountColor = item.type === "income" ? "#2d6a4f" : "#d9534f"; // vert pour revenu, rouge pour dépense
  const date = new Date(item.date).toLocaleDateString();

  return (
    <View style={styles.card}>
      {/* Partie gauche : nom, type, catégorie, note */}
      <View style={styles.left}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={[styles.type, { color: amountColor }]}>
          {item.displayType} {/* "Revenu" ou "Dépense" */}
        </Text>
        <Text style={styles.category}>{item.category}</Text>
        {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
      </View>

      {/* Partie droite : montant et date */}
      <View style={styles.right}>
        <Text style={[styles.amount, { color: amountColor }]}>
          {item.type === "income" ? "+" : "-"}
          {item.amount} MAD
        </Text>
        <Text style={styles.date}>{date}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    elevation: 2,
  },
  left: {
    flex: 1,
    paddingRight: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  type: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  category: {
    fontSize: 12,
    color: "#555",
    marginBottom: 2,
  },
  note: {
    fontSize: 12,
    color: "#888",
  },
  right: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 16,
    fontWeight: "700",
  },
  date: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
});
