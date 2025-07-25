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

  const deleteExpense =
