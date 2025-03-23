import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./Components/Navbar";
import { useState, useEffect } from "react";
import Home from "./pages/Homepage";
import Sellitems from "./pages/Sellitems";
import Signin from "./pages/Signin";
import Signup from "./Components/Signup";
import Login from "./Components/Login";
import ProductDetails from "./Components/ProductDetails"; // Import ProductDetails

const App = () => {
  const location = useLocation();
  const showNavbar = location.pathname === "/" || location.pathname === "/Sellitems";

  const [user, setUser] = useState(() => localStorage.getItem("username") || null);

  useEffect(() => {
    const storedUser = localStorage.getItem("username");
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  return (
    <>
      {showNavbar && <Navbar user={user} setUser={setUser} />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Sellitems" element={<Sellitems />} />
        <Route path="/Signin" element={<Signin setUser={setUser} />} />
        <Route path="/Signup" element={<Signup setUser={setUser} />} />
        <Route path="/Login" element={<Login setUser={setUser} />} />
        <Route path="/product/:id" element={<ProductDetails />} /> {/* Add product details route */}
      </Routes>
    </>
  );
};

export default App;
