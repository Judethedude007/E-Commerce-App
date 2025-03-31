import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Home from "./Components/Home";
import Signin from "./Components/Signin";
import Login from "./Components/Login";
import AddProduct from "./Components/AddProduct";
import ProductDetails from "./Components/ProductDetails";
import UserProducts from "./Components/UserProducts";
import SellerProducts from "./Components/SellerProducts";
import Wishlist from "./Components/wishlist"; 
import UserProfile from "./Components/seller";

const App = () => {
  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/login" element={<Login />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/user-products" element={<UserProducts />} />
          <Route path="/seller-products" element={<SellerProducts />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/user-profile/:userId" element={<UserProfile />} />
        </Routes>
      </Router>
    </>
  );
};

export default App;
