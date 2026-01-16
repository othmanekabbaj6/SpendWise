import React, { useContext, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  Alert,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Platform,
} from "react-native";
import { ExpenseContext } from "../context/ExpenseContext";
import { CategoryContext } from "../context/CategoryContext";
import { Swipeable } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import ExpenseCard from "../components/ExpenseCard";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function TransactionsScreen() {
  const { expenses, deleteExpense } = useContext(ExpenseContext);
  const { categories } = useContext(CategoryContext);
  const navigation = useNavigation();

  const [searchName, setSearchName] = useState("");
  const [searchCategory, setSearchCategory] = useState("All");
  const [searchType, setSearchType] = useState("All");
  const [searchDate, setSearchDate] = useState(null);
  const [dateFilterMode, setDateFilterMode] = useState("day"); // "day" | "month" | "year"
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [typeModalVisible, setTypeModalVisible] = useState(false);
  const [dateModeModalVisible, setDateModeModalVisible] = useState(false);

  const clearFilters = () => {
    setSearchName("");
    setSearchCategory("All");
    setSearchType("All");
    setSearchDate(null);
    setDateFilterMode("day");
  };

  const isFilterActive = () =>
    searchName !== "" ||
    searchCategory !== "All" ||
    searchType !== "All" ||
    searchDate !== null;

  const confirmDelete = (id) => {
    Alert.alert("Delete", "Do you want to delete this transaction?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", onPress: () => deleteExpense(id) },
    ]);
  };

  const renderRightActions = (item) => (
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => confirmDelete(item.id)}
    >
      <Text style={styles.actionText}>Delete</Text>
    </TouchableOpacity>
  );

  const renderLeftActions = (item) => (
    <TouchableOpacity
      style={styles.editButton}
      onPress={() => navigation.navigate("Add", { expenseToEdit: item })}
    >
      <Text style={styles.actionText}>Edit</Text>
    </TouchableOpacity>
  );

  const translateType = (type) => (type === "income" ? "Income" : "Expense");

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchName = e.name.toLowerCase().includes(searchName.toLowerCase());
      const matchCategory =
        searchCategory === "All" || e.category === searchCategory;
      const matchType = searchType === "All" || e.type === searchType;

      let matchDate = true;
      if (searchDate) {
        const expenseDate = new Date(e.date);
        if (dateFilterMode === "day") {
          matchDate = expenseDate.toDateString() === searchDate.toDateString();
        } else if (dateFilterMode === "month") {
          matchDate =
            expenseDate.getFullYear() === searchDate.getFullYear() &&
            expenseDate.getMonth() === searchDate.getMonth();
        } else if (dateFilterMode === "year") {
          matchDate = expenseDate.getFullYear() === searchDate.getFullYear();
        }
      }

      return matchName && matchCategory && matchType && matchDate;
    });
  }, [
    expenses,
    searchName,
    searchCategory,
    searchType,
    searchDate,
    dateFilterMode,
  ]);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* Compact filter row */}
      <View style={styles.filterRow}>
        <TextInput
          placeholder="Search"
          value={searchName}
          onChangeText={setSearchName}
          style={styles.searchInput}
        />

        {/* Category filter */}
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setCategoryModalVisible(true)}
        >
          <Text style={styles.filterText}>
            {searchCategory === "All" ? "Category" : searchCategory}
          </Text>
        </TouchableOpacity>

        {/* Type filter */}
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setTypeModalVisible(true)}
        >
          <Text style={styles.filterText}>
            {searchType === "All" ? "Type" : searchType === "expense" ? "Expense" : "Income"}
          </Text>
        </TouchableOpacity>

        {/* Date filter */}
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setDateModeModalVisible(true)}
        >
          <Text style={styles.filterText}>
            {searchDate
              ? dateFilterMode === "day"
                ? searchDate.toLocaleDateString()
                : dateFilterMode === "month"
                ? searchDate.toLocaleString("default", { month: "short", year: "numeric" })
                : searchDate.getFullYear()
              : "Date"}
          </Text>
        </TouchableOpacity>

        {/* Clear button only if a filter is active */}
        {isFilterActive() && (
          <TouchableOpacity
            style={[styles.filterButton, { backgroundColor: "#0a6607ff" }]}
            onPress={clearFilters}
          >
            <Text style={[styles.filterText, { color: "#fff" }]}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Category modal */}
      <Modal visible={categoryModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setSearchCategory("All");
                  setCategoryModalVisible(false);
                }}
              >
                <Text>All categories</Text>
              </TouchableOpacity>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={styles.modalItem}
                  onPress={() => {
                    setSearchCategory(cat);
                    setCategoryModalVisible(false);
                  }}
                >
                  <Text>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={[styles.modalItem, { backgroundColor: "#ddd" }]}
              onPress={() => setCategoryModalVisible(false)}
            >
              <Text style={{ textAlign: "center" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Type modal */}
      <Modal visible={typeModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                setSearchType("All");
                setTypeModalVisible(false);
              }}
            >
              <Text>All types</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                setSearchType("expense");
                setTypeModalVisible(false);
              }}
            >
              <Text>Expense</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                setSearchType("income");
                setTypeModalVisible(false);
              }}
            >
              <Text>Income</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalItem, { backgroundColor: "#ddd" }]}
              onPress={() => setTypeModalVisible(false)}
            >
              <Text style={{ textAlign: "center" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Date mode modal */}
      <Modal visible={dateModeModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setDateFilterMode("day");
                  setShowDatePicker(true);
                  setDateModeModalVisible(false);
                }}
              >
                <Text>Day</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setDateFilterMode("month");
                  setShowDatePicker(true);
                  setDateModeModalVisible(false);
                }}
              >
                <Text>Month</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setDateFilterMode("year");
                  setShowDatePicker(true);
                  setDateModeModalVisible(false);
                }}
              >
                <Text>Year</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalItem, { backgroundColor: "#ddd" }]}
                onPress={() => setDateModeModalVisible(false)}
              >
                <Text style={{ textAlign: "center" }}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Date picker */}
      {showDatePicker && (
        <DateTimePicker
          value={searchDate || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(e, selected) => {
            setShowDatePicker(false);
            if (selected) setSearchDate(selected);
          }}
        />
      )}

      {/* No transactions */}
      {filteredExpenses.length === 0 && (
        <View style={{ marginTop: 20, alignItems: "center" }}>
          <Text style={styles.noTransactions}>No transactions found.</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Add")}
            style={styles.addButton}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>
              Add a transaction
            </Text>
          </TouchableOpacity>
        </View>
      )}

    {/* Swipe instruction */}
    {filteredExpenses.length > 0 && (
      <Text style={styles.swipeInstruction}>
        Swipe right to edit, left to delete
      </Text>
    )}



      {/* Transaction list */}
      <FlatList
        data={filteredExpenses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Swipeable
            renderRightActions={() => renderRightActions(item)}
            renderLeftActions={() => renderLeftActions(item)}
          >
            <ExpenseCard
              item={{ ...item, displayType: translateType(item.type) }}
            />
          </Swipeable>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginRight: 4,
    fontSize: 14,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: "#eee",
    borderRadius: 8,
    marginLeft: 4,
  },
  filterText: {
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    paddingVertical: 10,
    maxHeight: "60%",
  },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
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
  },
  deleteButton: {
    backgroundColor: "#f55",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    borderRadius: 12,
    marginVertical: 12,
  },

  swipeInstruction: {
  textAlign: "center",
  color: "#555",
  fontStyle: "italic",
  marginBottom: 8,
  fontSize: 12,
},
  editButton: {
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    borderRadius: 12,
    marginVertical: 12,
  },
  actionText: { color: "#fff", fontWeight: "bold" },
});
