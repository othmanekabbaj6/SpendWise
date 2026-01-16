import React, { useContext, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { ExpenseContext } from "../context/ExpenseContext";
import SummaryCard from "../components/SummaryCard";
import ExpenseCard from "../components/ExpenseCard";
import { useNavigation } from "@react-navigation/native";

const screenWidth = Dimensions.get("window").width - 32; // padding accounted for

export default function HomeScreen() {
  const { expenses, loading } = useContext(ExpenseContext);
  const navigation = useNavigation();

  // ------------------ CURRENT MONTH TOTALS ------------------
  const currentMonthTotals = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let income = 0,
      expense = 0;

    expenses.forEach((e) => {
      const date = e.date?.toDate ? e.date.toDate() : new Date(e.date);
      if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
        if (e.type === "income") income += Number(e.amount);
        else expense += Number(e.amount);
      }
    });

    return { income, expense, balance: income - expense };
  }, [expenses]);

  // ------------------ LAST TRANSACTIONS ------------------
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3); // last 3 transactions

  const translateType = (type) => (type === "income" ? "Income" : "Expense");

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={{ marginTop: 16, marginBottom: 8, fontWeight: "700" }}>
        Your Financial Overview (This Month)
      </Text>

      {/* Full-width summary cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: "#e6f4ea" }]}>
          <Text style={[styles.statLabel, { color: "#0a6607" }]}>Income</Text>
          <Text style={[styles.statValue, { color: "#0a6607" }]}>
            {currentMonthTotals.income.toFixed(2)} MAD
          </Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: "#ffe6e6" }]}>
          <Text style={[styles.statLabel, { color: "#f44336" }]}>Expenses</Text>
          <Text style={[styles.statValue, { color: "#f44336" }]}>
            {currentMonthTotals.expense.toFixed(2)} MAD
          </Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: "#e6f0ff" }]}>
          <Text style={[styles.statLabel, { color: "#2196F3" }]}>Balance</Text>
          <Text style={[styles.statValue, { color: "#2196F3" }]}>
            {currentMonthTotals.balance.toFixed(2)} MAD
          </Text>
        </View>
      </View>

      {/* Last transaction header */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Last Transactions</Text>
        {expenses.length > 5 && (
          <TouchableOpacity onPress={() => navigation.navigate("Transactions")}>
            <Text style={styles.viewAllText}>View all →</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading && <Text>Loading...</Text>}

      {!loading && expenses.length === 0 && (
        <View style={{ paddingVertical: 20 }}>
          <Text style={{ color: "#888", fontStyle: "italic", textAlign: "center" }}>
            No transactions yet.
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
              Add a transaction
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {recentExpenses.map((item) => (
        <ExpenseCard
          key={item.id}
          item={{
            ...item,
            displayType: translateType(item.type),
          }}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  headerTitle: {
    fontWeight: "700",
    fontSize: 16,
  },
  viewAllText: {
    color: "#0a6607ff",
    fontWeight: "bold",
    fontSize: 14,
  },
  statsContainer: {
    marginBottom: 20,
  },
  statCard: {
    width: screenWidth,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: "flex-start",
    marginBottom: 12, // space between cards
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3, // Android shadow
  },
  statLabel: { fontSize: 14, fontWeight: "600" },
  statValue: { fontSize: 18, fontWeight: "700", marginTop: 4 },
});
