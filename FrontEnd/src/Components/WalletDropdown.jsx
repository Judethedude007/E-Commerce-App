import React, { useState, useEffect } from "react";
import axios from "axios";
import DummyPayment from "./DummyPayment";

const WalletDropdown = ({ username, onClose }) => {
  const [balance, setBalance] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    axios.get(`http://localhost:8081/wallet/${username}`)
      .then(res => {
        setBalance(res.data.wallet_balance || 0);
        setLoading(false);
      })
      .catch(() => {
        setBalance(0);
        setLoading(false);
      });
  }, [username, success]);

  const handleAddMoney = () => {
    setError("");
    setSuccess("");
    if (!amount || isNaN(amount) || amount <= 0) {
      setError("Enter a valid amount");
      return;
    }
    setShowPayment(true);
  };

  const [showSuccessAnim, setShowSuccessAnim] = useState(false);

  const handlePaymentSuccess = () => {
    axios.post(`http://localhost:8081/wallet/${username}/add`, { amount: Number(amount) })
      .then(() => {
        setShowSuccessAnim(true);
        setTimeout(() => {
          setShowSuccessAnim(false);
          setSuccess("Amount added successfully!");
          setAmount(0);
          setShowAdd(false);
          setShowPayment(false);
        }, 1200);
      })
      .catch(() => {
        setError("Failed to add money");
        setShowPayment(false);
      });
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
  };

  return (
    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg p-6 z-50 border border-green-200 animate-fade-in">
      <button className="absolute top-2 right-2 text-gray-400 hover:text-red-500" onClick={onClose}>&times;</button>
      <h2 className="text-xl font-bold text-green-700 mb-2 text-center">My Wallet</h2>
      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <div className="flex flex-col items-center">
          <div className={`bg-gradient-to-r from-green-400 to-green-600 text-white rounded-full px-6 py-4 text-3xl font-bold shadow mb-4 transition-all duration-700 ${showSuccessAnim ? "scale-110 ring-4 ring-green-400" : ""}`}>₹{balance}</div>
          {success && <div className="text-green-600 mb-2">{success}</div>}
          {error && <div className="text-red-600 mb-2">{error}</div>}
          {showAdd ? (
            <div className="w-full flex flex-col items-center">
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="border p-2 rounded-lg w-full mb-2 text-center"
                min={1}
              />
              <button
                onClick={handleAddMoney}
                className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-800 transition w-full"
              >
                Add Money
              </button>
              {showPayment && (
                <DummyPayment
                  amount={amount}
                  onSuccess={handlePaymentSuccess}
                  onCancel={handlePaymentCancel}
                />
              )}
              <button
                onClick={() => setShowAdd(false)}
                className="text-gray-500 mt-2 text-sm hover:underline"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAdd(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-800 transition w-full"
            >
              Add Money
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletDropdown;
