// src/components/ButtonPrimary.js
import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

export default function ButtonPrimary({ title, onPress, style }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.btn, style]}>
      <Text style={styles.txt}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: "#2D6A4F",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  txt: { color: "white", fontWeight: "600" },
});
