import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Navbar.css";
import { FaHeart, FaWallet } from "react-icons/fa";
import axios from "axios";

const Navbar = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    const username = localStorage.getItem("username");
    setUser(username || null);

    if (username) {
      axios
        .get(`http://localhost:8081/wallet/${username}`)
        .then((res) => setWallet(res.data))
        .catch((err) => console.log(err));
    }
  }, [setUser]);

  const handleLogout = () => {
    localStorage.removeItem("username");
    setUser(null);
    setIsOpen(false);
    navigate("/login");
  };

  const handleSigninClick = () => {
    document.getElementById("signin-button").classList.add("swirl-effect");
    setTimeout(() => navigate("/Signin"), 500);
  };

  return (
    <nav className="bg-white fixed top-0 left-0 z-50 shadow-md py-3 px-6 flex items-center w-full">
      <div className="flex-grow flex justify-start">
        <h1 className="text-2xl font-bold text-green-600">SecondHandStore</h1>
      </div>

      <div className="hidden md:flex flex-grow justify-center mr-20">
        <ul className="flex space-x-6 text-[20px] mr-70">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "text-green-600" : "text-gray-700"
              }
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/Sellitems"
              className={({ isActive }) =>
                isActive ? "text-green-600" : "text-gray-700"
              }
            >
              Sell Items
            </NavLink>
          </li>
        </ul>
      </div>

      <div className="flex items-center space-x-4">
        <NavLink
          to="/wishlist"
          className="text-gray-700 hover:text-green-600 text-2xl"
        >
          <FaHeart />
        </NavLink>

        {user && (
  <div className="relative">
    <FaWallet
      className="text-gray-700 hover:text-green-600 text-2xl cursor-pointer"
      onClick={() => setWalletOpen(!walletOpen)}
    />
    {walletOpen && wallet && (
      <div className="absolute right-0 mr-3 mt-2 w-70 bg-white border border-gray-300 shadow-lg rounded-lg p-4 z-50">
        <h3 className="text-green-600 font-bold text-lg mb-3 border-b pb-1">Wallet</h3>

        <div className="mb-3">
          <p className="mb-1"><strong>Balance:</strong> {wallet.balance}₹</p>
          <p className="text-sm text-gray-500">
              <strong>Last Updated:</strong>{" "}
              {new Date(wallet.updated_at).toLocaleString([], {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>

        </div>

        <div className="flex flex-col space-y-2">
          <button
            className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 w-full"
            onClick={() => alert("Depositing through database only")}
          >
            Deposit
          </button>
          <button
            className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 w-full"
            onClick={() => alert("Withdrawal through database only")}
          >
            Withdraw
          </button>
        </div>
      </div>
    )}
  </div>
)}


        {user ? (
          <div className="relative">
            <div
              className="w-10 h-10 flex items-center justify-center bg-green-600 text-white font-bold rounded-full cursor-pointer"
              onClick={() => setIsOpen(!isOpen)}
            >
              {user.charAt(0).toUpperCase()}
            </div>
            {isOpen && (
              <div className="absolute right-0 mr-3 mt-2 w-40 bg-white border border-gray-300 shadow-lg rounded-lg">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-red-500 hover:bg-red-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            id="signin-button"
            onClick={handleSigninClick}
            className="bg-green-600 text-white py-2 rounded-lg w-22 cursor-pointer border-2 border-transparent hover:bg-white hover:text-green-600 hover:border-green-600 box-border"
          >
            Sign in
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
