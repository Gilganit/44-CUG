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
        Philip: 'gift'
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
        Philip: 'out'
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

    // Handle custom amounts first
    participants.forEach(person => {
      if (expense.customAmounts?.[person]) {
        amounts[person] = expense.customAmounts[person];
        remainingAmount -= expense.customAmounts[person];
      }
    });

    const nonCustom = participants.filter(p => !expense.customAmounts?.[p]);

    const chooserWeight = 1.1;
    const userWeight = 1;
    const giftWeight = 0.25;

    const totalWeight = nonCustom.reduce((sum, person) => {
      const type = expense.participations[person];
      return (
        sum +
        (type === 'choose'
          ? chooserWeight
          : type === 'use'
          ? userWeight
          : type === 'gift'
          ? giftWeight
          : 0)
      );
    }, 0);

    nonCustom.forEach(person => {
      const type = expense.participations[person];
      const weight =
        type === 'choose'
          ? chooserWeight
          : type === 'use'
          ? userWeight
          : type === 'gift'
          ? giftWeight
          : 0;

      amounts[person] = (remainingAmount * weight) / totalWeight;
    });

    return amounts;
  };

  const deleteExpense = id => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  const getStatusColor = status => {
    switch (status) {
      case 'choose':
        return 'bg-blue-100 text-blue-800';
      case 'use':
        return 'bg-green-100 text-green-800';
      case 'gift':
        return 'bg-purple-100 text-purple-800';
      case 'out':
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="w-full min-h-screen p-10 bg-gray-50 flex flex-col items-center">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">44 Dorf. Choose, Use, Gift</h1>
        <p className="text-gray-600 text-sm">
          🎉 We have a cool app to track our cool vibes about spending together 😎💸✨
        </p>
      </div>

      {/* New Expense Form */}
      <div className="bg-white p-6 rounded-lg mb-8 shadow-md w-full max-w-3xl">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Plus size={20} />
          Add New Expense
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input
            type="text"
            placeholder="Description"
            value={newExpense.description}
            onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
            className="p-2 border rounded"
          />
          <input
            type="number"
            placeholder="Amount"
            value={newExpense.amount}
            onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
            className="p-2 border rounded"
          />
          <select
            value={newExpense.paidBy}
            onChange={e => setNewExpense({ ...newExpense, paidBy: e.target.value })}
            className="p-2 border rounded"
          >
            <option value="">Select Payer</option>
            {housemates.map(person => (
              <option key={person} value={person}>
                {person}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <div className="flex gap-4 mb-4">
            {housemates.map(person => (
              <div key={person} className="min-w-[120px] border rounded p-2">
                <p className="font-medium text-sm mb-1">{person}</p>
                <select
                  value={newExpense.participations[person]}
                  onChange={e =>
                    setNewExpense({
                      ...newExpense,
                      participations: { ...newExpense.participations, [person]: e.target.value }
                    })
                  }
                  className="w-full p-1 border rounded text-sm"
                >
                  <option value="out">🚫 Out</option>
                  <option value="choose">📝 Choose</option>
                  <option value="use">🍽 Use</option>
                  <option value="gift">🎁 Gift</option>
                </select>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={addExpense}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          <Plus size={16} />
          Add Expense
        </button>
      </div>

      {/* Expenses */}
      <div className="grid gap-6 w-full max-w-6xl">
        {expenses.map(expense => {
          const splits = calculateSplit(expense);
          return (
            <div key={expense.id} className="bg-white border rounded-lg p-4 shadow-md">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{expense.description}</h3>
                  <p className="text-sm text-gray-600">
                    €{expense.amount.toFixed(2)} (Paid by {expense.paidBy})
                  </p>
                </div>
                <button
                  onClick={() => deleteExpense(expense.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              <div className="overflow-x-auto">
                <div className="flex gap-4">
                  {housemates.map(person => (
                    <div key={person} className="min-w-[140px] border rounded p-2 text-sm">
                      <p className="font-medium mb-1">{person}</p>
                      <select
                        value={expense.participations[person]}
                        onChange={e => updateParticipation(expense.id, person, e.target.value)}
                        className="w-full p-1 border rounded mb-1"
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
                            onChange={e =>
                              updateCustomAmount(expense.id, person, e.target.value)
                            }
                            className="w-full p-1 border rounded text-xs mb-1"
                          />
                          <p className="text-xs text-gray-500">
                            Split: €{splits[person]?.toFixed(2) || '0.00'}
                          </p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExpenseSharingApp;
