import { useState } from "react";
import { FaArrowDown, FaArrowUp, FaPlus } from "react-icons/fa";

const Wallet = () => {
  const [balance, setBalance] = useState(2450.75);

  const transactions = [
    { id: 1, type: "credit", amount: 500, desc: "Money Added", date: "2025-09-20" },
    { id: 2, type: "debit", amount: 250, desc: "Product Purchase", date: "2025-09-18" },
    { id: 3, type: "credit", amount: 1200, desc: "Item Sold", date: "2025-09-15" },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <h1 className="text-3xl font-bold text-green-600 mb-6">My Wallet</h1>

      {/* Balance Card */}
      <div className="bg-white shadow-lg rounded-2xl p-6 mb-6">
        <h2 className="text-gray-600 text-lg">Current Balance</h2>
        <p className="text-4xl font-bold text-green-600 mt-2">₹{balance.toFixed(2)}</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <button className="flex flex-col items-center justify-center bg-green-600 text-white rounded-xl p-4 hover:bg-green-700 transition">
          <FaPlus className="text-2xl mb-2" />
          <span>Add Money</span>
        </button>
        <button className="flex flex-col items-center justify-center bg-blue-500 text-white rounded-xl p-4 hover:bg-blue-600 transition">
          <FaArrowUp className="text-2xl mb-2" />
          <span>Transfer</span>
        </button>
      </div>

      {/* Transactions */}
      <div className="bg-white shadow-lg rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Recent Transactions</h2>
        <ul className="space-y-4">
          {transactions.map((tx) => (
            <li
              key={tx.id}
              className="flex justify-between items-center border-b pb-2 last:border-b-0"
            >
              <div>
                <p className="text-gray-800 font-medium">{tx.desc}</p>
                <p className="text-sm text-gray-500">{tx.date}</p>
              </div>
              <span
                className={`font-semibold ${
                  tx.type === "credit" ? "text-green-600" : "text-red-500"
                }`}
              >
                {tx.type === "credit" ? `+₹${tx.amount}` : `-₹${tx.amount}`}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Wallet;
