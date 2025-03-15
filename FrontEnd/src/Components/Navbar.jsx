import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react"; 
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState(""); // Initialize as empty

  // Load username from localStorage on first render
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    console.log("Stored username:", storedUsername); // Debugging log

    if (storedUsername && storedUsername !== "undefined" && storedUsername !== "null") {
      setUsername(storedUsername);
    } else {
      setUsername(""); // Ensure it's reset properly
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem("username");
    setUsername(""); // Clear username from state
    navigate("/login");
  }

  return (
    <nav className="bg-white fixed top-0 left-0 z-50 shadow-md py-3 px-6 flex items-center w-full">
      <div className="flex-grow flex justify-start">
        <h1 className="text-xl font-bold text-green-600">SecondHandStore</h1>
      </div>

      <div className="flex-grow flex justify-center">
        <ul className="flex space-x-6 text-[18px]">
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

      <div className="flex-grow flex justify-end space-x-3 ml-25">
        {username ? (
          <div className="flex items-center space-x-4">
            <span className="text-green-600 font-semibold">{username}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white py-2 px-4 rounded-lg cursor-pointer border-2 border-transparent hover:bg-white hover:text-red-500 hover:border-red-500"
            >
              Logout
            </button>
          </div>
        ) : (
          <NavLink to="/Signin">
            <button className="bg-green-600 text-white py-2 rounded-lg w-22 cursor-pointer border-2 border-transparent hover:bg-white hover:text-green-600 hover:border-green-600 box-border">
              Sign in
            </button>
          </NavLink>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
