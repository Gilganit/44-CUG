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
    <div className="w-screen min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 flex justify-center items-start p-8">
      <div className="flex flex-col w-full max-w-screen-lg bg-white rounded-xl shadow-xl p-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">44 Dorf. Choose, Use, Gift</h1>
          <p className="text-gray-700 text-lg">🎉 We have a cool app to track our cool vibes about spending together 😎💸✨</p>
        </div>

        {/* Add Expense */}
        <div className="bg-gray-50 p-6 rounded-lg mb-8 shadow">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2"><Plus size={20} /> Add New Expense</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              placeholder="Expense description"
              value={newExpense.description}
              onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
              className="p-2 border rounded-lg"
            />
            <input
              type="number"
              placeholder="Amount"
              value={newExpense.amount}
              onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
              className="p-2 border rounded-lg"
            />
            <select
              value={newExpense.paidBy}
              onChange={e => setNewExpense({ ...newExpense, paidBy: e.target.value })}
              className="p-2 border rounded-lg"
            >
              <option value="">-- Select Payer --</option>
              {housemates.map(person => (
                <option key={person} value={person}>{person}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-4">
            {housemates.map(person => (
              <div key={person} className="flex flex-col border p-3 rounded shadow-sm w-40">
                <p className="font-medium text-sm">{person}</p>
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

          <button
            onClick={addExpense}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Add Expense
          </button>
        </div>

        {/* Expense List */}
        <div className="grid grid-cols-1 gap-6">
          {expenses.map(expense => {
            const splits = calculateSplit(expense);
            return (
              <div key={expense.id} className="bg-white border rounded p-4 shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{expense.description}</h3>
                    <p className="text-gray-600">€{expense.amount.toFixed(2)} paid by {expense.paidBy}</p>
                  </div>
                  <button onClick={() => deleteExpense(expense.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={20} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {housemates.map(person => (
                    <div key={person} className="border p-3 rounded w-40 shadow-sm flex flex-col text-sm">
                      <strong>{person}</strong>
                      <select
                        value={expense.participations[person]}
                        onChange={e => updateParticipation(expense.id, person, e.target.value)}
                        className="border rounded p-1 mb-1"
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
                          <p className="text-xs text-gray-600">€{splits[person]?.toFixed(2)}</p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Settlement Summary */}
        {expenses.length > 0 && (
          <div className="mt-10 bg-green-50 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Calculator size={20} /> Settlement Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2"><Users size={16} /> Current Balances</h3>
                <div className="space-y-2">
                  {Object.entries(calculateBalances()).map(([person, balance]) => (
                    <div key={person} className="flex justify-between items-center p-2 bg-white rounded">
                      <span className="font-medium">{person}</span>
                      <span className={`font-semibold ${balance > 0 ? 'text-green-600' : balance < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                        €{balance.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2"><DollarSign size={16} /> Required Payments</h3>
                <div className="space-y-2">
                  {calculateSettlements().length === 0 ? (
                    <p className="text-gray-500 italic">All settled up! 🎉</p>
                  ) : (
                    calculateSettlements().map((s, i) => (
                      <div key={i} className="p-2 bg-white rounded">
                        <span className="font-medium">{s.from}</span> pays <span className="font-medium">{s.to}</span> →
                        <span className="font-semibold text-green-600"> €{s.amount.toFixed(2)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseSharingApp;
