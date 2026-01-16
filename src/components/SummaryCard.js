// src/components/SummaryCard.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function SummaryCard({ title, value, color = "#000" }) {
  return (
    <View style={[styles.card, { backgroundColor: color }]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
  },
  title: {
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 4,
  },
  value: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
