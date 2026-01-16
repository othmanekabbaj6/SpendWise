import React, {
  useState,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
} from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  Modal,
  TouchableOpacity,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { ExpenseContext } from "../context/ExpenseContext";
import { CategoryContext } from "../context/CategoryContext";
import ButtonPrimary from "../components/ButtonPrimary";
import { predictCategory } from "../ai/categoryPrediction";

export default function AddExpenseScreen({ route }) {
  const navigation = useNavigation();
  const { addExpense, editExpense, expenses } = useContext(ExpenseContext);
  const { categories, addCategory } = useContext(CategoryContext);
  const expenseToEdit = route.params?.expenseToEdit;

  /* ---------------- FORM STATE ---------------- */
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("Other");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const userSelectedCategory = useRef(false);

  /* ---------------- MODAL STATE ---------------- */
  const [newCategoryModal, setNewCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [typeModalVisible, setTypeModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  /* ---------------- SET TITLE ---------------- */
  useLayoutEffect(() => {
    navigation.setOptions({
      title: expenseToEdit ? "Edit" : "Add",
    });
  }, [navigation, expenseToEdit]);

  /* ---------------- HYDRATE FORM ON EDIT ---------------- */
  useEffect(() => {
    if (expenseToEdit) {
      setName(expenseToEdit.name);
      setAmount(expenseToEdit.amount.toString());
      setType(expenseToEdit.type);
      setCategory(expenseToEdit.category);
      setNote(expenseToEdit.note || "");
      setDate(new Date(expenseToEdit.date));
      userSelectedCategory.current = true;
    } else {
      resetForm();
    }
  }, [expenseToEdit]);

  /* ---------------- SMART CATEGORY PREDICTION ---------------- */
  useEffect(() => {
    if (expenseToEdit) return;
    if (userSelectedCategory.current) return;

    const predicted = predictCategory(name, expenses, categories);
    if (predicted && predicted !== category) {
      setCategory(predicted);
    }
  }, [name, expenses, categories]);

  /* ---------------- RESET FORM ---------------- */
  const resetForm = () => {
    setName("");
    setAmount("");
    setType("expense");
    setCategory("Other");
    setNote("");
    setDate(new Date());
    userSelectedCategory.current = false;
  };

  /* ---------------- RESET ON UNFOCUS ---------------- */
  useFocusEffect(
    useCallback(() => {
      return () => {
        resetForm();
        navigation.setParams({ expenseToEdit: undefined });
      };
    }, [navigation])
  );

  /* ---------------- SAVE ---------------- */
  const save = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Transaction name is required");
      return;
    }

    if (!amount || isNaN(Number(amount))) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    if (!categories.includes(category)) {
      Alert.alert(
        "New Category",
        `The category "${category}" does not exist. Do you want to create it?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Create",
            onPress: async () => {
              try {
                await addCategory(category);
                userSelectedCategory.current = true;
                await saveExpense();
              } catch (err) {
                Alert.alert("Error", err.message);
              }
            },
          },
        ]
      );
    } else {
      await saveExpense();
    }
  };

  const saveExpense = async () => {
    const payload = {
      name,
      amount: Number(amount),
      type,
      category,
      note,
      date: date.toISOString(),
    };

    try {
      if (expenseToEdit) {
        await editExpense(expenseToEdit.id, payload);
      } else {
        await addExpense(payload);
      }
      resetForm();
      navigation.navigate("Transactions");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  /* ---------------- ADD CATEGORY ---------------- */
  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      Alert.alert("Error", "Category name is required");
      return;
    }

    if (categories.includes(newCategory)) {
      Alert.alert("Error", "This category already exists");
      return;
    }

    addCategory(newCategory);
    setCategory(newCategory);
    userSelectedCategory.current = true;
    setNewCategory("");
    setNewCategoryModal(false);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {/* Name */}
          <Text>Transaction Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Ex: Salary, Groceries..."
          />

          {/* Amount */}
          <Text>Amount</Text>
          <TextInput
            keyboardType="numeric"
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
          />

          {/* Type */}
          <Text>Type</Text>
          <TouchableOpacity
            style={styles.selectorButton}
            onPress={() => setTypeModalVisible(true)}
          >
            <Text>{type === "expense" ? "Expense" : "Income"}</Text>
          </TouchableOpacity>

          <Modal visible={typeModalVisible} transparent animationType="slide">
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setType("expense");
                    setTypeModalVisible(false);
                  }}
                >
                  <Text>Expense</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setType("income");
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

          {/* Category picker */}
          <Text>Category</Text>
          <View style={styles.categoryRow}>
            <TouchableOpacity
              style={[styles.selectorButton, { flex: 1 }]}
              onPress={() => setCategoryModalVisible(true)}
            >
              <Text>{category}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.manageButton}
              onPress={() => navigation.navigate("ManageCategories")}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>Manage</Text>
            </TouchableOpacity>
          </View>

          <Modal
            visible={categoryModalVisible}
            transparent
            animationType="slide"
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      setCategory("Other");
                      userSelectedCategory.current = true;
                      setCategoryModalVisible(false);
                    }}
                  >
                    <Text>Other</Text>
                  </TouchableOpacity>

                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={styles.modalItem}
                      onPress={() => {
                        setCategory(cat);
                        userSelectedCategory.current = true;
                        setCategoryModalVisible(false);
                      }}
                    >
                      <Text>{cat}</Text>
                    </TouchableOpacity>
                  ))}

                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      setCategoryModalVisible(false);
                      setNewCategoryModal(true);
                    }}
                  >
                    <Text style={{ color: "#0a6607ff", fontWeight: "700" }}>
                      + Add a Category
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalItem, { backgroundColor: "#ddd" }]}
                    onPress={() => setCategoryModalVisible(false)}
                  >
                    <Text style={{ textAlign: "center" }}>Cancel</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </View>
          </Modal>

          {/* Note */}
          <Text>Note</Text>
          <TextInput style={styles.input} value={note} onChangeText={setNote} />

          {/* Date */}
          <Text>Date</Text>
          <ButtonPrimary
            title={date.toLocaleDateString()}
            onPress={() => setShowPicker(true)}
          />
          {showPicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(e, selected) => {
                setShowPicker(false);
                if (selected) setDate(selected);
              }}
            />
          )}

          {/* Save */}
          <ButtonPrimary
            title={expenseToEdit ? "Edit" : "Save"}
            onPress={save}
            style={{ marginTop: 20 }}
          />

          {/* New Category Modal */}
          <Modal visible={newCategoryModal} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
              <View style={styles.newCategoryModal}>
                <Text style={{ marginBottom: 10, fontWeight: "700" }}>
                  New Category
                </Text>
                <TextInput
                  style={styles.input}
                  value={newCategory}
                  onChangeText={setNewCategory}
                  placeholder="Category Name"
                />
                <ButtonPrimary title="Add" onPress={handleAddCategory} />
                <ButtonPrimary
                  title="Cancel"
                  style={{ marginTop: 10, backgroundColor: "#888" }}
                  onPress={() => setNewCategoryModal(false)}
                />
              </View>
            </View>
          </Modal>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  selectorButton: {
    padding: 12,
    backgroundColor: "#eee",
    borderRadius: 8,
    marginBottom: 10,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  manageButton: {
    marginLeft: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#0a6607ff",
    borderRadius: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    paddingVertical: 10,
    maxHeight: "70%",
  },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  newCategoryModal: {
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
  },
});
