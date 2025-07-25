
import React, { useState } from 'react';
import { Plus, Trash2, Calculator, Users, DollarSign } from 'lucide-react';

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
    },
    {
      id: 2,
      description: "Lilith’s Midnight Oil",
      amount: 88.8,
      paidBy: 'Nora',
      participations: {
        Gili: 'gift',
        Lena: 'choose',
        Lukas: 'use',
        Nora: 'use',
        Philip: 'out',
      },
      customAmounts: {}
    }
  ]);

  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    paidBy: '',
    participations: housemates.reduce((acc, person) => ({ ...acc, [person]: 'out' }), {})
  });

  const addExpense = () => {
    if (!newExpense.description || !newExpense.amount || !newExpense.paidBy) return;

    const expense = {
      id: Date.now(),
      description: newExpense.description,
      amount: parseFloat(newExpense.amount),
      paidBy: newExpense.paidBy,
      participations: { ...newExpense.participations },
      customAmounts: {}
    };

    setExpenses([...expenses, expense]);
    setNewExpense({
      description: '',
      amount: '',
      paidBy: '',
      participations: housemates.reduce((acc, person) => ({ ...acc, [person]: 'out' }), {})
    });
  };

  const updateParticipation = (expenseId, person, status) => {
    setExpenses(
      expenses.map(expense =>
        expense.id === expenseId
          ? { ...expense, participations: { ...expense.participations, [person]: status } }
          : expense
      )
    );
  };

  const updateCustomAmount = (expenseId, person, amount) => {
    setExpenses(
      expenses.map(expense =>
        expense.id === expenseId
          ? { ...expense, customAmounts: { ...expense.customAmounts, [person]: parseFloat(amount) || 0 } }
          : expense
      )
    );
  };

  const calculateSplit = expense => {
    const participants = housemates.filter(person => expense.participations[person] !== 'out');
    const choosers = participants.filter(person => expense.participations[person] === 'choose');
    const users = participants.filter(person => expense.participations[person] === 'use');
    const gifters = participants.filter(person => expense.participations[person] === 'gift');

    let amounts = {};
    let remainingAmount = expense.amount;

    participants.forEach(person => {
      if (expense.customAmounts && expense.customAmounts[person]) {
        amounts[person] = expense.customAmounts[person];
        remainingAmount -= expense.customAmounts[person];
      }
    });

    const nonCustomParticipants = participants.filter(
      person => !expense.customAmounts || !expense.customAmounts[person]
    );

    if (nonCustomParticipants.length > 0) {
      const chooserCount = choosers.filter(p => !expense.customAmounts[p]).length;
      const userCount = users.filter(p => !expense.customAmounts[p]).length;
      const giftCount = gifters.filter(p => !expense.customAmounts[p]).length;

      const totalShares = chooserCount * 1.1 + userCount * 1.0 + giftCount * 0.3;
      const baseShare = remainingAmount / totalShares;

      nonCustomParticipants.forEach(person => {
        const role = expense.participations[person];
        if (role === 'choose') {
          amounts[person] = baseShare * 1.1;
        } else if (role === 'use') {
          amounts[person] = baseShare * 1.0;
        } else if (role === 'gift') {
          amounts[person] = baseShare * 0.3;
        }
      });
    }

    participants.forEach(person => {
      if (!amounts[person]) amounts[person] = 0;
    });

    return amounts;
  };

  const calculateBalances = () => {
    const balances = housemates.reduce((acc, person) => ({ ...acc, [person]: 0 }), {});
    expenses.forEach(expense => {
      const splits = calculateSplit(expense);
      balances[expense.paidBy] += expense.amount;
      Object.entries(splits).forEach(([person, amount]) => {
        balances[person] -= amount;
      });
    });
    return balances;
  };

  const calculateSettlements = () => {
    const balances = calculateBalances();
    const settlements = [];
    const creditors = Object.entries(balances).filter(([, b]) => b > 0.01);
    const debtors = Object.entries(balances).filter(([, b]) => b < -0.01);

    creditors.forEach(([creditor, creditAmount]) => {
      debtors.forEach(([debtor, debtAmount]) => {
        if (Math.abs(debtAmount) > 0.01 && creditAmount > 0.01) {
          const settlementAmount = Math.min(creditAmount, Math.abs(debtAmount));
          settlements.push({ from: debtor, to: creditor, amount: settlementAmount });
          balances[creditor] -= settlementAmount;
          balances[debtor] += settlementAmount;
        }
      });
    });

    return settlements;
  };

  const deleteExpense = id => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🏡 Housemate Expense Tracker</h1>

        <div className="space-y-6">
          {expenses.map(expense => {
            const splits = calculateSplit(expense);
            return (
              <div key={expense.id} className="bg-white p-4 rounded shadow">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">{expense.description}</h2>
                    <p className="text-sm text-gray-500">Paid by {expense.paidBy} • €{expense.amount.toFixed(2)}</p>
                  </div>
                  <button onClick={() => deleteExpense(expense.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-4">
                  {housemates.map(person => (
                    <div
                      key={person}
                      className="flex flex-col w-40 border p-2 rounded shadow-sm bg-gray-50 text-xs"
                    >
                      <strong>{person}</strong>
                      <select
                        value={expense.participations[person]}
                        onChange={e => updateParticipation(expense.id, person, e.target.value)}
                        className="border p-1 rounded text-xs mb-1"
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
                            placeholder="€"
                            value={expense.customAmounts?.[person] || ''}
                            onChange={e => updateCustomAmount(expense.id, person, e.target.value)}
                            className="border p-1 rounded text-xs mb-1"
                          />
                          <p>€{splits[person]?.toFixed(2)}</p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ExpenseSharingApp;
