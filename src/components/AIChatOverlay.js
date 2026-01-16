import React, { useRef, useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";

const { width, height } = Dimensions.get("window");
const BUTTON_SIZE = 60;
const TOP_SAFE = 60;
const BOTTOM_SAFE = 80;
const SIDE_MARGIN = 12;
const GAP = 12;

// Hugging Face Router API key and model
const HF_API_KEY 
const HF_MODEL = "meta-llama/Llama-3.1-8B-Instruct";

export default function AIChatOverlay() {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiReady, setAiReady] = useState(true); // plus besoin d'attendre auth
  const flatListRef = useRef(null);

  /* ---------------- POSITION ---------------- */
  const posX = useRef(
    new Animated.Value(width - BUTTON_SIZE - SIDE_MARGIN)
  ).current;
  const posY = useRef(new Animated.Value(height - BUTTON_SIZE - 140)).current;
  const dragX = useRef(new Animated.Value(0)).current;
  const dragY = useRef(new Animated.Value(0)).current;

  /* ---------------- GESTURE ---------------- */
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: dragX, translationY: dragY } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = ({ nativeEvent }) => {
    if (nativeEvent.state === State.END) {
      let newX = posX._value + nativeEvent.translationX;
      let newY = posY._value + nativeEvent.translationY;

      newY = Math.max(
        TOP_SAFE,
        Math.min(newY, height - BUTTON_SIZE - BOTTOM_SAFE)
      );
      newX = newX < width / 2 ? SIDE_MARGIN : width - BUTTON_SIZE - SIDE_MARGIN;
      newX = Math.max(
        SIDE_MARGIN,
        Math.min(newX, width - BUTTON_SIZE - SIDE_MARGIN)
      );

      posX.setValue(newX);
      posY.setValue(newY);
      dragX.setValue(0);
      dragY.setValue(0);
    }
  };

  /* ---------------- ASK AI FUNCTION ---------------- */
  const askAI = async (question) => {
    try {
      const messagesPayload = [
        {
          role: "system",
          content: `
            You are a highly experienced personal finance advisor and assistant.
            Your expertise includes budgeting, saving strategies, investments, debt management, financial planning, and general financial education.
            Give clear, practical advice that is easy to understand.
            Always explain your reasoning and give actionable tips.
            Never ask for or access personal data.
          `,
        },
        { role: "user", content: question },
      ];

      const HF_ROUTER_URL = `https://router.huggingface.co/v1/chat/completions`;

      const response = await fetch(HF_ROUTER_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: HF_MODEL,
          messages: messagesPayload,
          max_tokens: 500,
          temperature: 0.7, // un peu créatif pour des conseils humains
        }),
      });

      const data = await response.json();

      if (response.status !== 200) {
        return `AI Error (${response.status}): ${data.error?.message}`;
      }

      return data.choices[0].message.content.trim();
    } catch (err) {
      console.error("Request Failed:", err);
      return "Connection error. Please try again.";
    }
  };

  /* ---------------- SEND MESSAGE ---------------- */
  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), text: input, fromUser: true },
    ]);
    setInput("");
    setLoadingAI(true);

    const answer = await askAI(input);
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString() + "_ai", text: answer, fromUser: false },
    ]);
    setLoadingAI(false);
  };

  /* ---------------- CHAT PANEL POSITION ---------------- */
  const chatPanelStyle = useMemo(() => {
    const x = Math.min(
      Math.max(posX._value + BUTTON_SIZE / 2 - (width * 0.85) / 2, 16),
      width - width * 0.85 - 16
    );
    const isTopHalf = posY._value < height / 2;
    return {
      position: "absolute",
      width: width * 0.85,
      height: height * 0.5,
      left: x,
      top: isTopHalf ? posY._value + BUTTON_SIZE + GAP : undefined,
      bottom: !isTopHalf ? height - posY._value + GAP : undefined,
      zIndex: 999998,
    };
  }, [posX._value, posY._value]);

  /* ---------------- UI ---------------- */
  if (!aiReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0a6607" />
        <Text>Loading AI assistant...</Text>
      </View>
    );
  }

  return (
    <>
      {/* DRAGGABLE BUTTON */}
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        enabled={!chatOpen}
      >
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              transform: [
                { translateX: Animated.add(posX, dragX) },
                { translateY: Animated.add(posY, dragY) },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.9}
            onPress={() => setChatOpen(true)}
          >
            <Text style={styles.buttonText}>AI</Text>
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>

      {/* CHAT PANEL */}
      {chatOpen && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={[styles.chatContainer, chatPanelStyle]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>AI Financial Assistant</Text>
            <TouchableOpacity onPress={() => setChatOpen(false)}>
              <Text style={styles.close}>Close</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 8 }}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
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

          {loadingAI && (
            <View style={[styles.bubble, styles.aiBubble]}>
              <Text style={{ color: "#000" }}>AI is typing...</Text>
            </View>
          )}

          <View style={styles.inputRow}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Ask me about finance..."
              style={styles.input}
            />
            <TouchableOpacity onPress={sendMessage} style={styles.send}>
              <Text style={{ color: "#fff", fontWeight: "bold" }}>Send</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  buttonContainer: { position: "absolute", zIndex: 999999 },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: "#0a6607",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 18 },
  chatContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 8,
    overflow: "hidden",
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
  bubble: { marginVertical: 4, padding: 8, borderRadius: 12, maxWidth: "80%" },
  userBubble: { backgroundColor: "#0a6607", alignSelf: "flex-end" },
  aiBubble: { backgroundColor: "#eee", alignSelf: "flex-start" },
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
