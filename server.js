// server.js
import express from "express";
import cors from "cors";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { Configuration, OpenAIApi } from "openai";

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
}));

import { db } from "./firebaseConfig.js";

app.post("/query-ai", async (req, res) => {
  const { question } = req.body;

  // Example: read your Firebase database (replace with your collection)
  const snapshot = await getDocs(collection(db, "yourCollection"));
  const data = snapshot.docs.map(doc => doc.data());

  // Send question + DB snapshot to AI
  const prompt = `You are an AI that answers questions about this Firebase data:\n${JSON.stringify(data, null, 2)}\n\nQuestion: ${question}`;

  const response = await openai.createChatCompletion({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
  });

  const answer = response.data.choices[0].message.content;
  res.json({ answer });
});

app.listen(3000, () => console.log("Server running on port 3000"));
