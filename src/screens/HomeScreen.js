// src/screens/HomeScreen.js
import React, { useContext, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { ExpenseContext } from "../context/ExpenseContext";
import SummaryCard from "../components/SummaryCard";
import ExpenseCard from "../components/ExpenseCard";
import { useNavigation } from "@react-navigation/native";

export default function HomeScreen() {
  const { expenses, loading } = useContext(ExpenseContext);
  const navigation = useNavigation();

  const totals = useMemo(() => {
    let income = 0, expense = 0;
    expenses.forEach(e => {
      if (e.type === "income") income += Number(e.amount);
      else expense += Number(e.amount);
    });
    return { income, expense, balance: income - expense };
  }, [expenses]);

  const recentExpenses = expenses.slice(0, 3);

  const translateType = (type) => (type === "income" ? "Revenu" : "Dépense");

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={{ marginTop: 16, marginBottom: 8, fontWeight: "700" }}>
        Votre situation financière
      </Text>

      <SummaryCard title="Revenus" value={totals.income.toFixed(2)} />
      <SummaryCard title="Dépenses" value={totals.expense.toFixed(2)} />
      <SummaryCard title="Epargne" value={totals.balance.toFixed(2)} />

      <Text style={{ marginTop: 16, marginBottom: 8, fontWeight: "700" }}>
        Dernières transactions
      </Text>

      {loading && <Text>Chargement...</Text>}

      {!loading && expenses.length === 0 && (
        <View style={{ paddingVertical: 20 }}>
          <Text style={{ color: "#888", fontStyle: "italic", textAlign: "center" }}>
            Aucune transaction pour le moment.
          </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate("Add")}
            style={{
              marginTop: 20,
              backgroundColor: "#0a6607ff",
              padding: 12,
              borderRadius: 10,
              alignSelf: "center",
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>
              Ajouter une transaction
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {recentExpenses.map(item => (
        <ExpenseCard
          key={item.id}
          item={{
            ...item,
            displayType: translateType(item.type),
          }}
        />
      ))}

      {expenses.length > 5 && (
        <TouchableOpacity
          onPress={() => navigation.navigate("Transactions")}
          style={{
            marginTop: 10,
            paddingVertical: 10,
            alignSelf: "center"
          }}
        >
          <Text style={{ color: "#0a6607ff", fontWeight: "bold" }}>
            Voir toutes les transactions →
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}
