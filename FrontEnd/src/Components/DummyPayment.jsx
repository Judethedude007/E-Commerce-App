import React, { useState } from "react";

const DummyPayment = ({ amount, onSuccess, onCancel }) => {
  const [animating, setAnimating] = useState(false);

  const handleSuccess = () => {
    setAnimating(true);
    setTimeout(() => {
      setAnimating(false);
      onSuccess();
    }, 1200); // Animation duration
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 animate-fade-in">
      <div className={`bg-white rounded-xl shadow-lg p-8 w-96 text-center border-2 border-green-200 relative ${animating ? "animate-gpay-success" : ""}`}>
        <h2 className="text-2xl font-bold text-green-700 mb-4">Dummy Payment Gateway</h2>
        <p className="mb-6 text-lg">You are about to pay <span className="font-bold text-green-600">₹{amount}</span></p>
        <button
          className="bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-800 transition mr-2"
          onClick={handleSuccess}
          disabled={animating}
        >
          {animating ? "Processing..." : "Simulate Success"}
        </button>
        <button
          className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg shadow hover:bg-gray-400 transition"
          onClick={onCancel}
          disabled={animating}
        >
          Cancel
        </button>
        {animating && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-500 border-opacity-60"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DummyPayment;
