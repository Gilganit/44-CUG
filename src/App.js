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
    const choosers = participants.filter(p => expense.participations[p] === 'choose');
    const users = participants.filter(p => expense.participations[p] === 'use');
    const gifters = participants.filter(p => expense.participations[p] === 'gift');

    let amounts = {};
    let remainingAmount = expense.amount;

    participants.forEach(person => {
      if (expense.customAmounts?.[person]) {
        amounts[person] = expense.customAmounts[person];
        remainingAmount -= expense.customAmounts[person];
      }
    });

    const nonCustom = participants.filter(p => !expense.customAmounts?.[p]);
    const totalShares =
      choosers.filter(p => !expense.customAmounts?.[p]).length * 1.1 +
      users.filter(p => !expense.customAmounts?.[p]).length * 1.0 +
      gifters.filter(p => !expense.customAmounts?.[p]).length * 0.3;

    const baseShare = totalShares > 0 ? remainingAmount / totalShares : 0;

    nonCustom.forEach(p => {
      const type = expense.participations[p];
      amounts[p] =
        type === 'choose' ? baseShare * 1.1 :
        type === 'use' ? baseShare * 1.0 :
        type === 'gift' ? baseShare * 0.3 : 0;
    });

    return amounts;
  };

  const calculateBalances = () => {
    const balances = housemates.reduce((acc, p) => ({ ...acc, [p]: 0 }), {});
    expenses.forEach(exp => {
      const split = calculateSplit(exp);
      balances[exp.paidBy] += exp.amount;
      Object.entries(split).forEach(([p, amt]) => {
        balances[p] -= amt;
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
        if (creditAmount > 0.01 && Math.abs(debtAmount) > 0.01) {
          const amt = Math.min(creditAmount, Math.abs(debtAmount));
          settlements.push({ from: debtor, to: creditor, amount: amt });
          balances[creditor] -= amt;
          balances[debtor] += amt;
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
      <div className="w-full max-w-screen-lg bg-white rounded-xl shadow-xl p-6 space-y-10">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-pink-600 mb-1">44 Dorf – Choose, Use, Gift</h1>
          <p className="text-gray-600 text-lg">🧮 Share expenses with nuance and joy ✨</p>
        </div>

        {/* Add Expense */}
        <div className="bg-gray-50 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Plus size={18} /> New Expense</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <input type="text" placeholder="Description" value={newExpense.description} onChange={e => setNewExpense({ ...newExpense, description: e.target.value })} className="p-2 border rounded" />
            <input type="number" placeholder="Amount" value={newExpense.amount} onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })} className="p-2 border rounded" />
            <select value={newExpense.paidBy} onChange={e => setNewExpense({ ...newExpense, paidBy: e.target.value })} className="p-2 border rounded">
              <option value="">-- Paid by --</option>
              {housemates.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="flex flex-wrap gap-3">
            {housemates.map(person => (
              <div key={person} className="flex flex-col border p-3 rounded w-40 text-sm shadow-sm">
                <strong>{person}</strong>
                <select
                  value={newExpense.participations[person]}
                  onChange={e => setNewExpense({
                    ...newExpense,
                    participations: { ...newExpense.participations, [person]: e.target.value }
                  })}
                  className="border rounded p-1 mt-1"
                >
                  <option value="out">🚫 Out</option>
                  <option value="choose">📝 Choose</option>
                  <option value="use">🍽 Use</option>
                  <option value="gift">🎁 Gift</option>
                </select>
              </div>
            ))}
          </div>

          <button onClick={addExpense} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Add Expense</button>
        </div>

        {/* Expenses */}
        {expenses.map(expense => {
          const splits = calculateSplit(expense);
          return (
            <div key={expense.id} className="bg-white border rounded p-4 shadow space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{expense.description}</h3>
                  <p className="text-gray-500">€{expense.amount.toFixed(2)} paid by {expense.paidBy}</p>
                </div>
                <button onClick={() => deleteExpense(expense.id)} className="text-red-500 hover:text-red-700"><Trash2 size={20} /></button>
              </div>
              <div className="flex flex-wrap gap-3">
                {housemates.map(person => (
                  <div key={person} className="border p-3 rounded w-40 text-sm shadow-sm flex flex-col">
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

        {/* Summary */}
        <div className="bg-green-50 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Calculator size={20} /> Settlement Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2 flex items-center gap-2"><Users size={16} /> Current Balances</h3>
              <div className="space-y-1">
                {Object.entries(calculateBalances()).map(([person, balance]) => (
                  <div key={person} className="flex justify-between bg-white p-2 rounded">
                    <span>{person}</span>
                    <span className={`font-semibold ${balance > 0 ? 'text-green-600' : balance < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                      €{balance.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2 flex items-center gap-2"><DollarSign size={16} /> Required Payments</h3>
              <div className="space-y-1">
                {calculateSettlements().length === 0 ? (
                  <p className="text-gray-500 italic">All settled up 🎉</p>
                ) : (
                  calculateSettlements().map((s, i) => (
                    <div key={i} className="bg-white p-2 rounded">
                      {s.from} pays {s.to} → <span className="font-semibold text-green-600">€{s.amount.toFixed(2)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseSharingApp;
