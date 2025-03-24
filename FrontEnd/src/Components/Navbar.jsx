import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Navbar.css";
import SearchBar from "./SearchBar";

const Navbar = ({ products }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [isOpen, setIsOpen] = useState(false); 
  const [searchTerm, setSearchTerm] = useState(""); 
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername && storedUsername !== "undefined" && storedUsername !== "null") {
      setUsername(storedUsername);
    } else {
      setUsername("");
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem("username");
    setUsername("");
    setIsOpen(false); 
    navigate("/login");
  }
  const handleSigninClick = () => {
    const button = document.getElementById("signin-button");
    button.classList.add("swirl-effect");
    setTimeout(() => {
      navigate("/Signin");
    }, 500);
  };

  return (
    <nav className="bg-white fixed top-0 left-0 z-50 shadow-md py-3 px-6 flex items-center w-full">
      <div className="flex-grow flex justify-start">
        <h1 className="text-xl font-bold text-green-600">SecondHandStore</h1>
      </div>

      <div className="hidden md:flex flex-grow justify-center">
        <ul className="flex space-x-6 text-[18px]">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? "text-green-600" : "text-gray-700")}
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/Sellitems"
              className={({ isActive }) => (isActive ? "text-green-600" : "text-gray-700")}
            >
              Sell Items
            </NavLink>
          </li>
        </ul>
      </div>

      <div className="flex-grow flex justify-center">
       <SearchBar 
        products={products} 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
        setFilteredProducts={setFilteredProducts} 
       />
      </div>

      <div className="relative flex-grow flex justify-end space-x-3 ml-25">
        {username ? (
          <div className="flex items-center space-x-4">
            {/* Circular Avatar with First Letter */}
            <div
              className="w-10 h-10 flex items-center justify-center bg-green-600 text-white font-bold rounded-full cursor-pointer"
              onClick={() => setIsOpen(!isOpen)}
            >
              {username.charAt(0).toUpperCase()}
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
              <div className="absolute right-0 mr-3 mt-22 w-40 bg-white border border-gray-300 shadow-lg rounded-lg">
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
