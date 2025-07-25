import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const ExpenseSharingApp = () => {
  const [housemates] = useState(['Gili', 'Lena', 'Lukas', 'Nora', 'Philip']);
  const [expenses, setExpenses] = useState([
    {
      id: 1,
      description: "Hypatia's Star Maps",
      amount: 42.5,
      paidBy: 'Lena',
      participations: {
        Gili: 'choose',
        Lena: 'use',
        Lukas: 'out',
        Nora: 'use',
        Philip: 'gift',
      },
      customAmounts: {}
    }
  ]);

  const updateParticipation = (expenseId, person, status) => {
    setExpenses(prev =>
      prev.map(exp =>
        exp.id === expenseId
          ? { ...exp, participations: { ...exp.participations, [person]: status } }
          : exp
      )
    );
  };

  const updateCustomAmount = (expenseId, person, amount) => {
    setExpenses(prev =>
      prev.map(exp =>
        exp.id === expenseId
          ? {
              ...exp,
              customAmounts: {
                ...exp.customAmounts,
                [person]: parseFloat(amount) || 0
              }
            }
          : exp
      )
    );
  };

  const calculateSplit = expense => {
    const participants = housemates.filter(p => expense.participations[p] !== 'out');
    const amounts = {};
    const total = expense.amount;
    const share = total / participants.length;

    participants.forEach(p => {
      if (expense.customAmounts[p]) {
        amounts[p] = expense.customAmounts[p];
      } else {
        amounts[p] = share;
      }
    });

    return amounts;
  };

  const deleteExpense = id => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  return (
    <div className="min-h-screen w-full p-6 bg-gradient-to-br from-pink-50 to-blue-50">
      <h1 className="text-3xl font-bold text-center text-pink-600 mb-8">🧾 Expense Tracker</h1>

      {expenses.map(expense => {
        const splits = calculateSplit(expense);
        return (
          <div key={expense.id} className="bg-white rounded-xl shadow p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold">{expense.description}</h2>
                <p className="text-gray-600">€{expense.amount} paid by {expense.paidBy}</p>
              </div>
              <button
                onClick={() => deleteExpense(expense.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={20} />
              </button>
            </div>

            {/* Horizontal Layout via Grid */}
            <div className="grid grid-flow-col auto-cols-[minmax(10rem,_1fr)] overflow-x-auto gap-4 pb-2">
              {housemates.map(person => (
                <div key={person} className="border rounded p-3 shadow-sm text-sm flex flex-col">
                  <strong>{person}</strong>
                  <select
                    value={expense.participations[person]}
                    onChange={e => updateParticipation(expense.id, person, e.target.value)}
                    className="border rounded p-1 my-1"
                  >
                    <option value="out">🚫 Out</option>
                    <option value="choose">📝 Choose</option>
                    <option value="use">🍽 Use</option>
                    <option value="gift">🎁 Gift</option>
                  </select>

                  {expense.participations[person] !== 'out' && (
                    <>
                      <input
                        type="number"
                        placeholder="Custom €"
                        value={expense.customAmounts?.[person] || ''}
                        onChange={e => updateCustomAmount(expense.id, person, e.target.value)}
                        className="border rounded p-1 text-xs mb-1"
                      />
                      <p className="text-xs text-gray-600">
                        €{splits[person]?.toFixed(2)}
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ExpenseSharingApp;
