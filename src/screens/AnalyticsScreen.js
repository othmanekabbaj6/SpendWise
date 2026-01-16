import React, { useContext, useMemo, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { ExpenseContext } from "../context/ExpenseContext";
import { CategoryContext } from "../context/CategoryContext";
import { LineChart, PieChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width - 32;
const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function AnalyticsScreen() {
  const { expenses } = useContext(ExpenseContext);
  const { categories } = useContext(CategoryContext);

  const [selectedMonth, setSelectedMonth] = useState(null); // null = global analytics

  const getDate = (e) => (e.date?.toDate ? e.date.toDate() : new Date(e.date));

  // Filter expenses based on selected month
  const filteredExpenses = useMemo(() => {
    if (selectedMonth === null) return expenses;
    return expenses.filter(e => getDate(e).getMonth() === selectedMonth);
  }, [expenses, selectedMonth]);

  // Total income, expenses and savings ratio
  const { totalIncome, totalExpenses, savingsRatio } = useMemo(() => {
    const income = filteredExpenses.filter(e => e.type === "income").reduce((sum, e) => sum + e.amount, 0);
    const expense = filteredExpenses.filter(e => e.type === "expense").reduce((sum, e) => sum + e.amount, 0);
    const ratio = income ? ((income - expense) / income) * 100 : 0;
    return { totalIncome: income, totalExpenses: expense, savingsRatio: ratio.toFixed(1) };
  }, [filteredExpenses]);

  // Monthly Income vs Expenses (all months)
  const monthlyData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => i);
    const incomePerMonth = months.map(m =>
      expenses.filter(e => getDate(e).getMonth() === m && e.type === "income")
        .reduce((sum, e) => sum + e.amount, 0)
    );
    const expensePerMonth = months.map(m =>
      expenses.filter(e => getDate(e).getMonth() === m && e.type === "expense")
        .reduce((sum, e) => sum + e.amount, 0)
    );
    return { labels: monthNames, incomePerMonth, expensePerMonth };
  }, [expenses]);

  // Top Spending Categories
  const topCategories = useMemo(() => {
    const categoryTotals = categories.map(cat => {
      const total = filteredExpenses
        .filter(e => e.category === cat && e.type === "expense")
        .reduce((sum, e) => sum + e.amount, 0);
      return { name: cat, total };
    }).filter(c => c.total > 0);

    categoryTotals.sort((a, b) => b.total - a.total);
    return categoryTotals;
  }, [filteredExpenses, categories]);

  const pieData = topCategories.map((c, i) => ({
    name: c.name,
    amount: c.total,
    color: `hsl(${(i * 50) % 360}, 70%, 50%)`,
    legendFontColor: "#333",
    legendFontSize: 12,
  }));

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      {/* Month Picker */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
        <TouchableOpacity
          onPress={() => setSelectedMonth(null)}
          style={[styles.monthButton, selectedMonth === null && styles.monthButtonSelected]}
        >
          <Text style={[styles.monthText, selectedMonth === null && { color: "#fff" }]}>All Year</Text>
        </TouchableOpacity>
        {monthNames.map((m, idx) => (
          <TouchableOpacity
            key={m}
            onPress={() => setSelectedMonth(idx)}
            style={[styles.monthButton, selectedMonth === idx && styles.monthButtonSelected]}
          >
            <Text style={[styles.monthText, selectedMonth === idx && { color: "#fff" }]}>{m}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Total Stats (styled like HomeScreen SummaryCard) */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: "#e6f4ea" }]}>
          <Text style={[styles.statLabel, { color: "#0a6607" }]}>Total Income</Text>
          <Text style={[styles.statValue, { color: "#0a6607" }]}>{totalIncome} MAD</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: "#ffe6e6" }]}>
          <Text style={[styles.statLabel, { color: "#f44336" }]}>Total Expenses</Text>
          <Text style={[styles.statValue, { color: "#f44336" }]}>{totalExpenses} MAD</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: "#e6f0ff" }]}>
          <Text style={[styles.statLabel, { color: "#2196F3" }]}>Savings Ratio</Text>
          <Text style={[styles.statValue, { color: "#2196F3" }]}>{savingsRatio}%</Text>
        </View>
      </View>

      {/* Line Chart: Monthly Income vs Expenses */}
      {selectedMonth === null && (
        <>
          <Text style={styles.chartTitle}>Monthly Income vs Expenses</Text>
          <LineChart
            data={{
              labels: monthlyData.labels,
              datasets: [
                { data: monthlyData.incomePerMonth, color: () => "#0a6607", strokeWidth: 2 },
                { data: monthlyData.expensePerMonth, color: () => "#f44336", strokeWidth: 2 },
              ],
              legend: ["Income", "Expenses"],
            }}
            width={screenWidth}
            height={250}
            yAxisLabel=""
            chartConfig={{
              backgroundColor: "#fff",
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
              labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
              style: { borderRadius: 10 },
              propsForDots: { r: "4", strokeWidth: "2", stroke: "#fff" },
            }}
            bezier
            style={{ marginVertical: 8, borderRadius: 10 }}
          />
        </>
      )}

      {/* Pie Chart: Top Spending Categories */}
      <Text style={styles.chartTitle}>
        Top Spending Categories {selectedMonth !== null && `(${monthNames[selectedMonth]})`}
      </Text>
      {pieData.length > 0 ? (
        <PieChart
          data={pieData}
          width={screenWidth}
          height={220}
          chartConfig={{
            backgroundColor: "#fff",
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
          }}
          accessor="amount"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      ) : (
        <Text style={{ textAlign: "center", color: "#888", marginTop: 10 }}>
          No expenses to display.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  monthButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#eee",
    borderRadius: 8,
    marginRight: 6,
  },
  monthButtonSelected: {
    backgroundColor: "#0a6607",
  },
  monthText: {
    fontSize: 12,
    color: "#333",
  },
  statsContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3, // Android shadow
  },
  statLabel: { fontSize: 14, fontWeight: "600" },
  statValue: { fontSize: 18, fontWeight: "700", marginTop: 4 },
  chartTitle: { fontSize: 16, fontWeight: "600", marginTop: 12, marginBottom: 6 },
});
