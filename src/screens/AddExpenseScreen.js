// src/screens/AddExpenseScreen.js
import React, { useState, useContext } from "react";
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
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import ButtonPrimary from "../components/ButtonPrimary";
import { ExpenseContext } from "../context/ExpenseContext";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function AddExpenseScreen({ navigation, route }) {
  const { addExpense, editExpense } = useContext(ExpenseContext);
  const expenseToEdit = route.params?.expenseToEdit;

  const [name, setName] = useState(expenseToEdit?.name || "");
  const [amount, setAmount] = useState(expenseToEdit?.amount?.toString() || "");
  const [type, setType] = useState(expenseToEdit?.type || "expense");
  const [category, setCategory] = useState(expenseToEdit?.category || "Autre");
  const [note, setNote] = useState(expenseToEdit?.note || "");
  const [date, setDate] = useState(
    expenseToEdit ? new Date(expenseToEdit.date) : new Date()
  );
  const [showPicker, setShowPicker] = useState(false);

  const save = async () => {
    if (!name.trim()) {
      Alert.alert("Erreur", "Le nom de la transaction est obligatoire");
      return;
    }

    if (!amount || isNaN(Number(amount))) {
      Alert.alert("Erreur", "Veuillez entrer un montant valide");
      return;
    }

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
      navigation.navigate("Transactions");
    } catch (err) {
      Alert.alert("Erreur", err.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {/* Nom */}
          <Text>Nom de la transaction</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Ex: Salaire, Courses..."
          />

          {/* Montant */}
          <Text>Montant</Text>
          <TextInput
            keyboardType="numeric"
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
          />

          {/* Type */}
          <Text>Type</Text>
          <Picker
            selectedValue={type}
            onValueChange={(v) => setType(v)}
            style={{ marginBottom: 10 }}
          >
            <Picker.Item label="Dépense" value="expense" />
            <Picker.Item label="Revenu" value="income" />
          </Picker>

          {/* Catégorie */}
          <Text>Catégorie</Text>
          <TextInput
            style={styles.input}
            value={category}
            onChangeText={setCategory}
          />

          {/* Note */}
          <Text>Note</Text>
          <TextInput
            style={styles.input}
            value={note}
            onChangeText={setNote}
          />

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

          {/* Bouton enregistrer */}
          <ButtonPrimary
            title={expenseToEdit ? "Modifier" : "Enregistrer"}
            onPress={save}
            style={{ marginTop: 20 }}
          />
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
});
