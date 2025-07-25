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

  const calculateSplit = expense => {
    const weights = {
      choose: 1.2,
      use: 1.0,
      gift: 0.2,
      out: 0
    };

    const amounts = {};
    let remainingAmount = expense.amount;

    // Apply custom amounts
    for (const person of housemates) {
      if (expense.customAmounts?.[person]) {
        amounts[person] = expense.customAmounts[person];
        remainingAmount -= expense.customAmounts[person];
      }
    }

    // Calculate weighted split for remaining participants
    const weightedParticipants = housemates.filter(
      person =>
        expense.participations[person] !== 'out' &&
        !expense.customAmounts?.[person]
    );

    const totalWeight = weightedParticipants.reduce((sum, person) => {
      return sum + (weights[expense.participations[person]] || 0);
    }, 0);

    weightedParticipants.forEach(person => {
      const weight = weights[expense.participations[person]] || 0;
      amounts[person] = (remainingAmount * weight) / totalWeight;
    });

    // Fill in zeros for everyone else
    housemates.forEach(person => {
      if (!amounts[person]) amounts[person] = 0;
    });

    return amounts;
  };

  const calculateBalances = () => {
    const balances = housemates.reduce((acc, person) => ({ ...acc, [person]: 0 }), {});
    expenses.forEach(expense => {
      const splits = calculateSplit(expense);
      balances[expense.paidBy] += expense.amount;
      for (const person of housemates) {
        balances[person] -= splits[person] || 0;
      }
    });
    return balances;
  };

  const calculateSettlements = () => {
    const balances = calculateBalances();
    const settlements = [];
    const creditors = Object.entries(balances).filter(([, b]) => b > 0.01);
    const debtors = Object.entries(balances).filter(([, b]) => b < -0.01);

    creditors.forEach(([creditor, credit]) => {
      for (const [debtor, debt] of debtors) {
        if (Math.abs(debt) > 0.01 && credit > 0.01) {
          const amount = Math.min(credit, Math.abs(debt));
          settlements.push({ from: debtor, to: creditor, amount });
          balances[creditor] -= amount;
          balances[debtor] += amount;
        }
      }
    });

    return settlements;
  };

  const deleteExpense = id => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <h1 className="text-3xl font-bold mb-4">44 Dorf. Choose, Use, Gift</h1>

      <div className="mb-6">
        <input
          placeholder="Description"
          value={newExpense.description}
          onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
          className="border p-2 mr-2"
        />
        <input
          placeholder="Amount"
          value={newExpense.amount}
          onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
          className="border p-2 mr-2"
        />
        <select
          value={newExpense.paidBy}
          onChange={e => setNewExpense({ ...newExpense, paidBy: e.target.value })}
          className="border p-2"
        >
          <option value="">Paid by...</option>
          {housemates.map(person => (
            <option key={person}>{person}</option>
          ))}
        </select>
        <button onClick={addExpense} className="ml-2 bg-blue-500 text-white p-2 rounded">
          Add
        </button>
      </div>

      {housemates.map(person => (
        <div key={person} className="mb-4">
          <strong>{person}</strong>: {calculateBalances()[person].toFixed(2)}
        </div>
      ))}

      <hr className="my-6" />

      {expenses.map(expense => {
        const splits = calculateSplit(expense);
        return (
          <div key={expense.id} className="mb-6 border p-4 rounded shadow">
            <h2 className="text-xl font-semibold">
              {expense.description} – €{expense.amount.toFixed(2)} (Paid by {expense.paidBy})
            </h2>
            <button
              onClick={() => deleteExpense(expense.id)}
              className="text-red-500 mt-2 text-sm"
            >
              Delete
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              {housemates.map(person => (
                <div key={person} className="border p-2 rounded">
                  <p className="font-bold">{person}</p>
                  <select
                    value={expense.participations[person]}
                    onChange={e => updateParticipation(expense.id, person, e.target.value)}
                    className="w-full mb-1"
                  >
                    <option value="out">Out</option>
                    <option value="choose">Choose</option>
                    <option value="use">Use</option>
                    <option value="gift">Gift</option>
                  </select>
                  <input
                    type="number"
                    value={expense.customAmounts[person] || ''}
                    onChange={e => updateCustomAmount(expense.id, person, e.target.value)}
                    placeholder={`Split: €${splits[person].toFixed(2)}`}
                    className="w-full"
                  />
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
