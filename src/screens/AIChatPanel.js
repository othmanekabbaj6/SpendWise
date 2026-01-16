import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

const { width, height } = Dimensions.get("window");

const GAP = 12; // space between button and panel

export default function AIChatPanel({
  close,
  buttonX,
  buttonY,
  buttonSize = 60,
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  /* ---------------- POSITION LOGIC ---------------- */

  const isTopHalf = buttonY < height / 2;

  const containerStyle = useMemo(() => {
    const style = {
      position: "absolute",
      width: width * 0.85,
      height: height * 0.5,
      left: Math.min(
        Math.max(buttonX - width * 0.425 + buttonSize / 2, 16),
        width - width * 0.85 - 16
      ),
    };

    if (isTopHalf) {
      style.top = buttonY + buttonSize + GAP;
    } else {
      style.bottom = height - buttonY + GAP;
    }

    return style;
  }, [buttonX, buttonY]);

  /* ---------------- CHAT ---------------- */

  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages(prev => [
      ...prev,
      { id: Date.now().toString(), text: input, fromUser: true },
    ]);

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString() + "ai",
          text: `AI: You asked "${input}"`,
          fromUser: false,
        },
      ]);
    }, 400);

    setInput("");
  };

  /* ---------------- UI ---------------- */

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, containerStyle]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>AI Financial Assistant</Text>
        <TouchableOpacity onPress={close}>
          <Text style={styles.close}>Close</Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 8 }}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.fromUser ? styles.userBubble : styles.aiBubble,
            ]}
          >
            <Text style={{ color: item.fromUser ? "#fff" : "#000" }}>
              {item.text}
            </Text>
          </View>
        )}
      />

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask me about your finances..."
          style={styles.input}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.send}>
          <Text style={{ color: "#fff", fontWeight: "bold" }}>
            Send
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 8,
    overflow: "hidden",
    zIndex: 999998,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f5f5f5",
  },
  title: { fontWeight: "700", fontSize: 16 },
  close: { color: "#0a6607", fontWeight: "bold" },

  bubble: {
    marginVertical: 4,
    padding: 8,
    borderRadius: 12,
    maxWidth: "80%",
  },
  userBubble: {
    backgroundColor: "#0a6607",
    alignSelf: "flex-end",
  },
  aiBubble: {
    backgroundColor: "#eee",
    alignSelf: "flex-start",
  },

  inputRow: {
    flexDirection: "row",
    padding: 8,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f9f9f9",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 40,
  },
  send: {
    backgroundColor: "#0a6607",
    paddingHorizontal: 16,
    marginLeft: 8,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
