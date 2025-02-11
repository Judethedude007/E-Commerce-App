import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./Components/Navbar";
import { useState, useEffect } from "react";
import Home from "./pages/Homepage";
import Sellitems from "./pages/Sellitems";
import Signin from "./pages/Signin";
import Signup from "./Components/Signup";
import Login from "./Components/Login";


const App = () => {
  const location = useLocation();
  const showNavbar = location.pathname === "/" || location.pathname === "/Sellitems";


  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem("user")) || null;
  });
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Sellitems" element={<Sellitems />} />
        <Route path="/Signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/Login" element={<Login />} />
      </Routes>
    </>
  );
};

export default App;