// App.js (React + Tailwind)
// This renders a horizontal spreadsheet-style layout: each expense is a row,
// and each person is a column with their corresponding inputs.

import React, { useState } from "react";

const housemates = ["Gili", "Lena", "Lukas", "Nora", "Philip"];

const initialExpenses = [
  {
    id: 1,
    description: "Hypatia's Star Maps",
    amount: 42.5,
    paidBy: "Lena",
    participations: {
      Gili: "choose",
      Lena: "use",
      Lukas: "out",
      Nora: "use",
      Philip: "gift",
    },
    customAmounts: {},
  },
];

const App = () => {
  const [expenses, setExpenses] = useState(initialExpenses);

  const calculateSplit = (expense) => {
    const included = housemates.filter((person) => expense.participations[person] !== "out");
    const share = expense.amount / included.length;
    const splits = {};
    included.forEach((person) => {
      splits[person] = share;
    });
    return splits;
  };

  const updateParticipation = (expenseId, person, value) => {
    setExpenses((prev) =>
      prev.map((exp) =>
        exp.id === expenseId
          ? {
              ...exp,
              participations: { ...exp.participations, [person]: value },
            }
          : exp
      )
    );
  };

  const updateCustomAmount = (expenseId, person, value) => {
    setExpenses((prev) =>
      prev.map((exp) =>
        exp.id === expenseId
          ? {
              ...exp,
              customAmounts: {
                ...exp.customAmounts,
                [person]: value === "" ? undefined : parseFloat(value),
              },
            }
          : exp
      )
    );
  };

  return (
    <div className="p-6 max-w-full overflow-x-auto">
      <h1 className="text-3xl font-bold mb-4">📑 Expense Tracker</h1>
      <table className="table-auto border-collapse w-full">
        <thead>
          <tr>
            <th className="border px-4 py-2 text-left">Expense</th>
            {housemates.map((person) => (
              <th key={person} className="border px-4 py-2 text-left">
                {person}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => {
            const splits = calculateSplit(expense);
            return (
              <tr key={expense.id} className="border-t">
                <td className="border px-4 py-2 font-semibold">
                  <div>{expense.description}</div>
                  <div className="text-xs text-gray-600">€{expense.amount} paid by {expense.paidBy}</div>
                </td>
                {housemates.map((person) => (
                  <td key={person} className="border px-2 py-2 text-sm align-top">
                    <div className="mb-1 font-semibold">{person}</div>
                    <select
                      className="border rounded p-1 w-full text-sm mb-1"
                      value={expense.participations[person] || "out"}
                      onChange={(e) => updateParticipation(expense.id, person, e.target.value)}
                    >
                      <option value="out">🚫 Out</option>
                      <option value="choose">📝 Choose</option>
                      <option value="use">🍽 Use</option>
                      <option value="gift">🎁 Gift</option>
                    </select>
                    {expense.participations[person] !== "out" && (
                      <>
                        <input
                          type="number"
                          placeholder="Custom €"
                          className="border rounded p-1 w-full text-sm mb-1"
                          value={expense.customAmounts?.[person] ?? ""}
                          onChange={(e) => updateCustomAmount(expense.id, person, e.target.value)}
                        />
                        <div className="text-xs text-gray-600">
                          €{splits[person]?.toFixed(2)}
                        </div>
                      </>
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default App;
