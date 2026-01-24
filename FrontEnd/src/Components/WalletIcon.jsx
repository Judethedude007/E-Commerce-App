import React from "react";
import { FaWallet } from "react-icons/fa";


const WalletIcon = ({ onClick }) => (
  <button
    onClick={onClick}
    className="text-green-600 hover:text-green-800 text-2xl bg-white rounded-full p-2 shadow transition focus:outline-none wallet-hover-ring"
    title="Wallet"
    style={{ border: "none" }}
  >
    <FaWallet />
  </button>
);

export default WalletIcon;
