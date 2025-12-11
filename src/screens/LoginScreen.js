// src/screens/LoginScreen.js
import React, { useState, useContext } from "react";
import { View, TextInput, Text, StyleSheet, Alert } from "react-native";
import ButtonPrimary from "../components/ButtonPrimary";
import { loginWithEmail } from "../services/auth";
import { AuthContext } from "../context/AuthContext";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { } = useContext(AuthContext);

  const submit = async () => {
    try {
      await loginWithEmail(email, password);
      // onAuthStateChanged gère la navigation
    } catch (err) {
      Alert.alert("Erreur", err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Se connecter</Text>
      <TextInput placeholder="Email" style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" />
      <TextInput placeholder="Mot de passe" style={styles.input} value={password} secureTextEntry onChangeText={setPassword} />
      <ButtonPrimary title="Se connecter" onPress={submit} style={{ marginTop: 10 }} />
      <Text style={styles.link} onPress={() => navigation.navigate("Register")}>Créer un compte</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:20, justifyContent:"center" },
  title: { fontSize:22, marginBottom:20, textAlign:"center" },
  input: { borderWidth:1, padding:10, borderRadius:8, marginBottom:10 },
  link: { marginTop:12, color:"#2b6cb0", textAlign:"center" }
});
