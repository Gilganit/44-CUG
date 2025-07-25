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
          ? {
              ...expense,
              customAmounts: {
                ...expense.customAmounts,
                [person]: parseFloat(amount) || 0
              }
            }
          : expense
      )
    );
  };

  const calculateSplit = (expense) => {
    const participants = housemates.filter(p => expense.participations[p] !== 'out');
    const choosers = participants.filter(p => expense.participations[p] === 'choose');
    const users = participants.filter(p => expense.participations[p] === 'use');
    const gifters = participants.filter(p => expense.participations[p] === 'gift');

    let amounts = {};
    let remainingAmount = expense.amount;

    participants.forEach(p => {
      if (expense.customAmounts && expense.customAmounts[p]) {
        amounts[p] = expense.customAmounts[p];
        remainingAmount -= expense.customAmounts[p];
      }
    });

    const nonCustoms = participants.filter(p => !expense.customAmounts[p]);
    const weights = {
      choose: 1.1,
      use: 1.0,
      gift: 0.3
    };

    const totalWeight = nonCustoms.reduce(
      (sum, p) => sum + (weights[expense.participations[p]] || 0),
      0
    );

    nonCustoms.forEach(p => {
      const weight = weights[expense.participations[p]] || 0;
      amounts[p] = (remainingAmount * weight) / totalWeight;
    });

    participants.forEach(p => {
      if (!amounts[p]) amounts[p] = 0;
    });

    return amounts;
  };

  const calculateBalances = () => {
    const balances = housemates.reduce((acc, p) => ({ ...acc, [p]: 0 }), {});
    expenses.forEach(exp => {
      const split = calculateSplit(exp);
      balances[exp.paidBy] += exp.amount;
      for (const [p, amount] of Object.entries(split)) {
        balances[p] -= amount;
      }
    });
    return balances;
  };

  const calculateSettlements = () => {
    const balances = calculateBalances();
    const creditors = Object.entries(balances).filter(([, b]) => b > 0.01);
    const debtors = Object.entries(balances).filter(([, b]) => b < -0.01);
    const settlements = [];

    creditors.forEach(([creditor, creditAmt]) => {
      for (let i = 0; i < debtors.length; i++) {
        const [debtor, debtAmt] = debtors[i];
        if (creditAmt <= 0) break;
        if (Math.abs(debtAmt) <= 0.01) continue;

        const settled = Math.min(creditAmt, Math.abs(debtAmt));
        settlements.push({ from: debtor, to: creditor, amount: settled });

        balances[creditor] -= settled;
        balances[debtor] += settled;
        creditors[0][1] -= settled;
        debtors[i][1] += settled;
      }
    });

    return settlements;
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6 space-y-8">
        <div className="text-center">
          <h2 className="text-xl font-bold text-pink-600">TAILWIND TEST</h2>
          <h1 className="text-3xl font-bold">44 Dorf. Choose, Use, Gift</h1>
          <p className="text-gray-600">🎉 We have a cool app to track our cool vibes about spending together 😎💸✨</p>
        </div>

        {/* Add Expense */}
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-3"><Plus size={18} /> Add New Expense</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <input type="text" placeholder="Description" value={newExpense.description} onChange={e => setNewExpense({ ...newExpense, description: e.target.value })} className="border p-2 rounded" />
            <input type="number" placeholder="Amount" value={newExpense.amount} onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })} className="border p-2 rounded" />
            <select value={newExpense.paidBy} onChange={e => setNewExpense({ ...newExpense, paidBy: e.target.value })} className="border p-2 rounded">
              <option value="">-- Select Payer --</option>
              {housemates.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="flex flex-wrap gap-3">
            {housemates.map(p => (
              <div key={p} className="border rounded p-2 w-40">
                <strong>{p}</strong>
                <select value={newExpense.participations[p]} onChange={e => setNewExpense({ ...newExpense, participations: { ...newExpense.participations, [p]: e.target.value } })} className="w-full border p-1 mt-1 rounded">
                  <option value="out">🚫 Out</option>
                  <option value="choose">📝 Choose</option>
                  <option value="use">🍽 Use</option>
                  <option value="gift">🎁 Gift</option>
                </select>
              </div>
            ))}
          </div>
          <button onClick={addExpense} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">Add Expense</button>
        </div>

        {/* Expense List */}
        <div className="space-y-6">
          {expenses.map(exp => {
            const splits = calculateSplit(exp);
            return (
              <div key={exp.id} className="border p-4 rounded shadow-sm">
                <div className="flex justify-between mb-4">
                  <div>
                    <h4 className="font-semibold">{exp.description}</h4>
                    <p className="text-sm text-gray-600">€{exp.amount.toFixed(2)} paid by {exp.paidBy}</p>
                  </div>
                  <button onClick={() => deleteExpense(exp.id)} className="text-red-500"><Trash2 size={20} /></button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {housemates.map(p => (
                    <div key={p} className="border p-3 rounded w-40 shadow-sm flex flex-col text-sm">
                      <strong>{p}</strong>
                      <select value={exp.participations[p]} onChange={e => updateParticipation(exp.id, p, e.target.value)} className="border rounded p-1 mb-1">
                        <option value="out">🚫 Out</option>
                        <option value="choose">📝 Choose</option>
                        <option value="use">🍽 Use</option>
                        <option value="gift">🎁 Gift</option>
                      </select>
                      {exp.participations[p] !== 'out' && (
                        <>
                          <input type="number" placeholder="Custom €" value={exp.customAmounts[p] || ''} onChange={e => updateCustomAmount(exp.id, p, e.target.value)} className="border rounded p-1 text-xs mb-1" />
                          <p className="text-xs text-gray-600">€{splits[p]?.toFixed(2)}</p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Settlements */}
        <div className="bg-green-50 p-4 rounded shadow">
          <h3 className="font-semibold text-lg flex items-center gap-2 mb-2"><Calculator size={18} /> Settlement Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium flex items-center gap-1"><Users size={14} /> Balances</h4>
              {Object.entries(calculateBalances()).map(([p, b]) => (
                <div key={p} className="flex justify-between text-sm py-1">
                  <span>{p}</span>
                  <span className={b > 0 ? 'text-green-600' : b < 0 ? 'text-red-600' : ''}>€{b.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div>
              <h4 className="font-medium flex items-center gap-1"><DollarSign size={14} /> Payments</h4>
              {calculateSettlements().length === 0 ? (
                <p className="text-gray-500 text-sm">All settled up! 🎉</p>
              ) : (
                calculateSettlements().map((s, i) => (
                  <p key={i} className="text-sm">{s.from} pays {s.to} → <strong>€{s.amount.toFixed(2)}</strong></p>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseSharingApp;
