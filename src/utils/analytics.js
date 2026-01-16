export const calculateAnalytics = (expenses) => {
  let totalIncome = 0;
  let totalExpenses = 0;
  const categoryTotals = {};

  expenses.forEach((e) => {
    if (e.type === "income") {
      totalIncome += Number(e.amount);
    } else {
      totalExpenses += Number(e.amount);
      categoryTotals[e.category] =
        (categoryTotals[e.category] || 0) + Number(e.amount);
    }
  });

  const highestCategory = Object.entries(categoryTotals).reduce(
    (max, curr) => (curr[1] > max[1] ? curr : max),
    ["None", 0]
  );

  const savings = totalIncome - totalExpenses;
  const savingsRatio =
    totalIncome > 0 ? ((savings / totalIncome) * 100).toFixed(1) : 0;

  return {
    totalIncome,
    totalExpenses,
    savings,
    savingsRatio,
    highestSpendingCategory: {
      name: highestCategory[0],
      amount: highestCategory[1],
    },
  };
};
