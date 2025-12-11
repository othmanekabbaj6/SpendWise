// src/components/SummaryCard.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function SummaryCard({ title, value }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value} MAD</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 12, borderRadius: 8, backgroundColor: "#fff", marginBottom: 10 },
  title: { color: "#666" },
  value: { fontSize: 18, fontWeight: "700" },
});
