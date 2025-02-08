import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Home from "./pages/Homepage";
import Sellitems from "./pages/Sellitems";
import Signin from "./pages/Signin";

const App = () => {
  const location = useLocation();
  const showNavbar = location.pathname === "/" || location.pathname === "/Sellitems";

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Sellitems" element={<Sellitems />} />
        <Route path="/Signin" element={<Signin />} />
      </Routes>
    </>
  );
};

export default App;
