// src/screens/ProfileScreen.js
import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { AuthContext } from "../context/AuthContext";
import { UserContext } from "../context/UserContext";
import ButtonPrimary from "../components/ButtonPrimary";
import { logout } from "../services/auth";

export default function ProfileScreen() {
  const { user } = useContext(AuthContext);
  const { profile, updateProfile } = useContext(UserContext);

  const [firstName, setFirstName] = useState(profile?.firstName || "");
  const [lastName, setLastName] = useState(profile?.lastName || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [isEditing, setIsEditing] = useState(!profile);

  useEffect(() => {
    setFirstName(profile?.firstName || "");
    setLastName(profile?.lastName || "");
    setBio(profile?.bio || "");
    if (profile) setIsEditing(false);
  }, [profile]);

  // Save profile
  const handleSave = async () => {
    try {
      await updateProfile({
        firstName,
        lastName,
        bio,
      });
      alert("Profil mis à jour !");
      setIsEditing(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAwareScrollView
          contentContainerStyle={styles.container}
          enableOnAndroid
          extraScrollHeight={20}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <View style={styles.centered}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{user?.email}</Text>
            </View>

            <Text style={styles.label}>Prénom</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.readOnly]}
              value={firstName}
              onChangeText={setFirstName}
              editable={isEditing}
            />

            <Text style={styles.label}>Nom</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.readOnly]}
              value={lastName}
              onChangeText={setLastName}
              editable={isEditing}
            />

            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[
                styles.input,
                { height: 80 },
                !isEditing && styles.readOnly,
              ]}
              value={bio}
              onChangeText={setBio}
              multiline
              editable={isEditing}
            />

            {isEditing ? (
              <ButtonPrimary
                title="Enregistrer"
                onPress={handleSave}
                style={{ marginTop: 20 }}
              />
            ) : (
              <ButtonPrimary
                title="Modifier"
                onPress={() => setIsEditing(true)}
                style={{ marginTop: 20 }}
              />
            )}

            <ButtonPrimary
              title="Se déconnecter"
              onPress={handleLogout}
              style={{ marginTop: 10, backgroundColor: "#f55" }}
            />
          </View>
        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  centered: {
    alignItems: "center",
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: "#555",
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  readOnly: {
    backgroundColor: "#f0f0f0",
  },
});
