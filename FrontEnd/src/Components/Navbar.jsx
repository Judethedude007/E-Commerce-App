import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Navbar.css";
import SearchBar from "./SearchBar";

const Navbar = ({ user, setUser, products, setFilteredProducts }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setUser(localStorage.getItem("username") || null);
  }, []);

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
        <ul className="flex space-x-6 text-[20px]">
          <li>
            <NavLink to="/" className={({ isActive }) => (isActive ? "text-green-600" : "text-gray-700")}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/Sellitems" className={({ isActive }) => (isActive ? "text-green-600" : "text-gray-700")}>
              Sell Items
            </NavLink>
          </li>
        </ul>
      </div>

      

      <div className="relative flex-grow flex justify-end space-x-3">
        {user ? (
          <div className="flex items-center space-x-4">
            <div 
              className="w-13 h-13 flex items-center justify-center bg-green-600 text-white text-xl font-bold rounded-full cursor-pointer"
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
