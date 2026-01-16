// ai/categoryPrediction.js

// 1️⃣ Default keywords (cold start / fallback)
const DEFAULT_KEYWORDS = {
  Food: ["pizza", "burger", "restaurant", "coffee", "meal"],
  Transport: ["uber", "taxi", "bus", "fuel", "train"],
  Entertainment: ["netflix", "spotify", "cinema", "game"],
  Shopping: ["amazon", "clothes", "mall", "shoes"],
  Bills: ["rent", "electricity", "water", "internet"],
};

// Utility: normalize text
const normalize = (text = "") =>
  text
    .toLowerCase()
    .trim()
    .split(/\s+/);

// 2️⃣ Main prediction function
// existingCategories = categories already created by the user
export function predictCategory(
  inputText,
  expenses = [],
  existingCategories = []
) {
  if (!inputText) return null;

  const tokens = normalize(inputText);

  // 🟢 PRIORITY 1: Learn from user expense history
  if (expenses.length >= 5) {
    const fromHistory = predictFromUserHistory(tokens, expenses);
    if (fromHistory) return fromHistory;
  }

  // 🟢 PRIORITY 2: Match existing category names
  const fromExistingCategories = predictFromExistingCategories(
    tokens,
    existingCategories
  );
  if (fromExistingCategories) return fromExistingCategories;

  // 🟢 PRIORITY 3: Default keyword fallback (cold start)
  const fromDefaults = predictFromDefaults(tokens);
  if (fromDefaults) return fromDefaults;

  // ❌ Nothing confident
  return null;
}

// 🔹 Learn from user expenses (strongest signal)
function predictFromUserHistory(tokens, expenses) {
  const categoryScores = {};

  expenses.forEach((expense) => {
    const expenseTokens = normalize(expense.name);

    expenseTokens.forEach((word) => {
      if (tokens.includes(word)) {
        categoryScores[expense.category] =
          (categoryScores[expense.category] || 0) + 1;
      }
    });
  });

  return getBestCategory(categoryScores);
}

// 🔹 Match existing category names directly
function predictFromExistingCategories(tokens, categories) {
  for (const category of categories) {
    const categoryTokens = normalize(category);
    if (categoryTokens.some((t) => tokens.includes(t))) {
      return category;
    }
  }
  return null;
}

// 🔹 Default keyword-based prediction (fallback)
function predictFromDefaults(tokens) {
  const categoryScores = {};

  Object.entries(DEFAULT_KEYWORDS).forEach(([category, keywords]) => {
    keywords.forEach((keyword) => {
      if (tokens.includes(keyword)) {
        categoryScores[category] =
          (categoryScores[category] || 0) + 1;
      }
    });
  });

  return getBestCategory(categoryScores);
}

// 🔹 Utility: pick best category by score
function getBestCategory(scores) {
  let bestCategory = null;
  let bestScore = 0;

  Object.entries(scores).forEach(([category, score]) => {
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  });

  return bestScore > 0 ? bestCategory : null;
}
