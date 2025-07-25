import React from 'react';

const participants = [
  { name: 'Gili', role: 'Choose', amount: 10.63 },
  { name: 'Lena', role: 'Use', amount: 10.63 },
  { name: 'Lukas', role: 'Out', amount: 0 },
  { name: 'Nora', role: 'Use', amount: 10.63 },
  { name: 'Philip', role: 'Gift', amount: 10.63 },
];

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white px-8 py-10 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
          📑 Expense Tracker
        </h1>
        <h2 className="text-2xl font-semibold mb-4">Hypatia's Star Maps</h2>
        <p className="mb-6 text-gray-700">€42.5 paid by Lena</p>

        <div className="flex flex-wrap gap-4 justify-start">
          {participants.map((p) => (
            <div
              key={p.name}
              className="flex flex-col border rounded shadow p-4 w-52 bg-white"
            >
              <div className="font-semibold">{p.name}</div>
              <select className="mt-2 p-1 border rounded text-sm">
                <option value="choose" selected={p.role === 'Choose'}>
                  📝 Choose
                </option>
                <option value="use" selected={p.role === 'Use'}>
                  🍽 Use
                </option>
                <option value="gift" selected={p.role === 'Gift'}>
                  🎁 Gift
                </option>
                <option value="out" selected={p.role === 'Out'}>
                  🚫 Out
                </option>
              </select>
              {p.role !== 'Out' && (
                <>
                  <input
                    className="mt-2 p-1 border rounded text-sm"
                    placeholder="Custom €"
                    defaultValue={p.amount}
                  />
                  <p className="text-sm text-gray-600 mt-1">€{p.amount.toFixed(2)}</p>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
