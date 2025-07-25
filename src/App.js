
import React, { useState } from 'react';
import { Plus, Trash2, Calculator, Users, DollarSign } from 'lucide-react';

const ExpenseSharingApp = () => {
  const [housemates] = useState(['Gili', 'Lena', 'Lukas', 'Nora', 'Philip']);
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    paidBy: '',
    participations: housemates.reduce((acc, p) => ({ ...acc, [p]: 'out' }), {})
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
      participations: housemates.reduce((acc, p) => ({ ...acc, [p]: 'out' }), {})
    });
  };

  const updateParticipation = (id, person, value) => {
    setExpenses(expenses.map(e => e.id === id ? {
      ...e,
      participations: { ...e.participations, [person]: value }
    } : e));
  };

  const updateCustomAmount = (id, person, value) => {
    setExpenses(expenses.map(e => e.id === id ? {
      ...e,
      customAmounts: { ...e.customAmounts, [person]: parseFloat(value) || 0 }
    } : e));
  };

  const calculateSplit = (expense) => {
    const participants = housemates.filter(p => expense.participations[p] !== 'out');
    const shares = { choose: 1.1, use: 1.0, gift: 0.3 };
    let remaining = expense.amount;
    const amounts = {};

    participants.forEach(p => {
      if (expense.customAmounts[p]) {
        amounts[p] = expense.customAmounts[p];
        remaining -= expense.customAmounts[p];
      }
    });

    const weighted = participants.filter(p => !expense.customAmounts[p]);
    const totalShare = weighted.reduce((acc, p) => acc + (shares[expense.participations[p]] || 0), 0);
    const base = totalShare > 0 ? remaining / totalShare : 0;

    weighted.forEach(p => {
      const role = expense.participations[p];
      amounts[p] = base * (shares[role] || 0);
    });

    housemates.forEach(p => { if (!amounts[p]) amounts[p] = 0; });
    return amounts;
  };

  const calculateBalances = () => {
    const balances = housemates.reduce((acc, p) => ({ ...acc, [p]: 0 }), {});
    expenses.forEach(exp => {
      const splits = calculateSplit(exp);
      balances[exp.paidBy] += exp.amount;
      Object.entries(splits).forEach(([p, amt]) => balances[p] -= amt);
    });
    return balances;
  };

  const calculateSettlements = () => {
    const balances = calculateBalances();
    const settlements = [];
    const creditors = Object.entries(balances).filter(([, b]) => b > 0.01);
    const debtors = Object.entries(balances).filter(([, b]) => b < -0.01);

    for (const [creditor, cAmt] of creditors) {
      for (const [debtor, dAmt] of debtors) {
        if (balances[creditor] > 0.01 && balances[debtor] < -0.01) {
          const amount = Math.min(balances[creditor], -balances[debtor]);
          settlements.push({ from: debtor, to: creditor, amount });
          balances[creditor] -= amount;
          balances[debtor] += amount;
        }
      }
    }
    return settlements;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 p-8">
      <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl text-pink-600 font-bold">TAILWIND TEST</h2>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">44 Dorf. Choose, Use, Gift</h1>
          <p className="text-gray-700 text-lg">🎉 We have a cool app to track our cool vibes about spending together 😎💸✨</p>
        </div>

        {/* New Expense */}
        <div className="bg-gray-50 p-6 rounded-lg mb-8 shadow">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2"><Plus size={20}/> Add New Expense</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input className="p-2 border rounded" placeholder="Description" value={newExpense.description} onChange={e => setNewExpense({ ...newExpense, description: e.target.value })} />
            <input className="p-2 border rounded" type="number" placeholder="Amount" value={newExpense.amount} onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })} />
            <select className="p-2 border rounded" value={newExpense.paidBy} onChange={e => setNewExpense({ ...newExpense, paidBy: e.target.value })}>
              <option value="">-- Who Paid? --</option>
              {housemates.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {housemates.map(person => (
              <select key={person} className="border rounded text-sm p-2" value={newExpense.participations[person]} onChange={e => setNewExpense({ ...newExpense, participations: { ...newExpense.participations, [person]: e.target.value } })}>
                <option value="out">{person} 🚫 Out</option>
                <option value="choose">{person} 📝 Choose</option>
                <option value="use">{person} 🍽 Use</option>
                <option value="gift">{person} 🎁 Gift</option>
              </select>
            ))}
          </div>
          <button onClick={addExpense} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add Expense</button>
        </div>

        {/* Table */}
        {expenses.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border text-sm mb-8">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Description</th>
                  {housemates.map(p => (
                    <th key={p} className="border p-2">{p}</th>
                  ))}
                  <th className="border p-2">Delete</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map(exp => {
                  const splits = calculateSplit(exp);
                  return (
                    <tr key={exp.id} className="text-center">
                      <td className="border p-2 text-left">
                        <strong>{exp.description}</strong><br/>
                        <span className="text-gray-500">€{exp.amount.toFixed(2)} by {exp.paidBy}</span>
                      </td>
                      {housemates.map(p => (
                        <td key={p} className="border p-2">
                          <select value={exp.participations[p]} onChange={e => updateParticipation(exp.id, p, e.target.value)} className="text-xs border rounded p-1 mb-1">
                            <option value="out">🚫</option>
                            <option value="choose">📝</option>
                            <option value="use">🍽</option>
                            <option value="gift">🎁</option>
                          </select>
                          {exp.participations[p] !== 'out' && (
                            <>
                              <input type="number" placeholder="€" value={exp.customAmounts?.[p] || ''} onChange={e => updateCustomAmount(exp.id, p, e.target.value)} className="text-xs border rounded p-1 w-16 mb-1"/>
                              <div className="text-gray-600 text-xs">€{splits[p]?.toFixed(2)}</div>
                            </>
                          )}
                        </td>
                      ))}
                      <td className="border p-2">
                        <button onClick={() => setExpenses(expenses.filter(e => e.id !== exp.id))}>
                          <Trash2 size={16} className="text-red-500" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary */}
        <div className="bg-green-50 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Calculator size={20}/> Settlement Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2"><Users size={16}/> Current Balances</h3>
              <div className="space-y-2">
                {Object.entries(calculateBalances()).map(([p, b]) => (
                  <div key={p} className="flex justify-between bg-white rounded p-2">
                    <span>{p}</span>
                    <span className={b > 0 ? 'text-green-600' : b < 0 ? 'text-red-600' : 'text-gray-600'}>
                      €{b.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2"><DollarSign size={16}/> Required Payments</h3>
              <div className="space-y-2">
                {calculateSettlements().length === 0
                  ? <p className="italic text-gray-500">All settled up! 🎉</p>
                  : calculateSettlements().map((s, i) => (
                      <div key={i} className="bg-white rounded p-2">
                        {s.from} pays {s.to} → <span className="text-green-600 font-semibold">€{s.amount.toFixed(2)}</span>
                      </div>
                    ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseSharingApp;
