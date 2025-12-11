// src/screens/ProfileScreen.js
import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import * as ImagePicker from "expo-image-picker";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
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
  const [photoURL, setPhotoURL] = useState(profile?.photoURL || null);
  const [isEditing, setIsEditing] = useState(!profile);

  const storage = getStorage();

  useEffect(() => {
    setFirstName(profile?.firstName || "");
    setLastName(profile?.lastName || "");
    setBio(profile?.bio || "");
    setPhotoURL(profile?.photoURL || null);
    if (profile) setIsEditing(false);
  }, [profile]);

  // Choisir une nouvelle image et uploader sur Firebase Storage
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission requise pour accéder aux photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.cancelled) {
      try {
        // Supprimer ancienne photo si elle existe
        if (photoURL && photoURL.startsWith("https://")) {
          const oldRef = ref(storage, `profilePictures/${user.uid}.jpg`);
          await deleteObject(oldRef).catch(() => {});
        }

        // Utiliser fetch pour récupérer un blob
        const response = await fetch(result.uri);
        const blob = await response.blob();

        const storageRef = ref(storage, `profilePictures/${user.uid}.jpg`);
        await uploadBytes(storageRef, blob);

        const downloadURL = await getDownloadURL(storageRef);
        setPhotoURL(downloadURL);
      } catch (err) {
        alert("Erreur lors de l'upload de la photo : " + err.message);
      }
    }
  };

  // Supprimer la photo
  const removePhoto = async () => {
    if (photoURL && photoURL.startsWith("https://")) {
      const oldRef = ref(storage, `profilePictures/${user.uid}.jpg`);
      await deleteObject(oldRef).catch(() => {});
    }
    setPhotoURL(null);
  };

  // Enregistrer le profil
  const handleSave = async () => {
    try {
      const dataToUpdate = {
        firstName,
        lastName,
        bio,
        photoURL: photoURL || null,
      };
      await updateProfile(dataToUpdate);
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
          enableOnAndroid={true}
          extraScrollHeight={20}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>

            <View style={styles.centered}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{user?.email}</Text>

              <Text style={styles.label}>Photo de profil</Text>
              <TouchableOpacity onPress={isEditing ? pickImage : null}>
                {photoURL ? (
                  <Image source={{ uri: photoURL }} style={styles.photo} />
                ) : (
                  <View style={[styles.photo, styles.photoPlaceholder]}>
                    <Text style={{ color: "#888" }}>Ajouter</Text>
                  </View>
                )}
              </TouchableOpacity>

              {photoURL && isEditing && (
                <ButtonPrimary
                  title="Supprimer la photo"
                  onPress={removePhoto}
                  style={{ marginTop: 10, backgroundColor: "#f55" }}
                />
              )}
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
              style={[styles.input, { height: 80 }, !isEditing && styles.readOnly]}
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
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  centered: { alignItems: "center", marginBottom: 20 },
  label: { fontSize: 14, color: "#555", marginTop: 10 },
  value: { fontSize: 16, marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  readOnly: { backgroundColor: "#f0f0f0" },
  photo: { width: 120, height: 120, borderRadius: 60, marginVertical: 10 },
  photoPlaceholder: {
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
});
