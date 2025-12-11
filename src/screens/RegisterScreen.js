// src/screens/RegisterScreen.js
import React, { useState } from "react";
import { View, TextInput, Text, StyleSheet, Alert } from "react-native";
import ButtonPrimary from "../components/ButtonPrimary";
import { registerWithEmail } from "../services/auth";

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async () => {
    try {
      await registerWithEmail(email, password);
      Alert.alert("Succès", "Compte créé. Vous pouvez vous connecter.");
      navigation.navigate("Login");
    } catch (err) {
      Alert.alert("Erreur", err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Créer un compte</Text>
      <TextInput placeholder="Email" style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" />
      <TextInput placeholder="Mot de passe" style={styles.input} value={password} secureTextEntry onChangeText={setPassword} />
      <ButtonPrimary title="S'inscrire" onPress={submit} style={{ marginTop: 10 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:20, justifyContent:"center" },
  title: { fontSize:22, marginBottom:20, textAlign:"center" },
  input: { borderWidth:1, padding:10, borderRadius:8, marginBottom:10 }
});
