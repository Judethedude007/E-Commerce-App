import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Navbar.css";
import SearchBar from "./SearchBar";

const Navbar = ({ user, setUser, products }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [isOpen, setIsOpen] = useState(false); // Dropdown state

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
    setUser(null);
    setIsOpen(false); // Close dropdown
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
    <nav className="navbar">
      <div className="navbar-left">
        <h1 className="navbar-title">SecondHandStore</h1>
      </div>

      <div className="navbar-center">
        <ul className="navbar-links">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? "active-link" : "inactive-link")}
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/Sellitems"
              className={({ isActive }) => (isActive ? "active-link" : "inactive-link")}
            >
              Sell Items
            </NavLink>
          </li>
        </ul>
      </div>

      <div className="navbar-search">
        <SearchBar products={products} />
      </div>

      <div className="navbar-right">
        {username ? (
          <div className="user-info">
            <span className="username">{username}</span>
            <button
              onClick={handleLogout}
              className="logout-button"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            id="signin-button"
            onClick={handleSigninClick}
            className="signin-button"
          >
            Sign in
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
