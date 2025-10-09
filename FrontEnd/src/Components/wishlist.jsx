import { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const username = localStorage.getItem("username");
  const navigate = useNavigate();

  useEffect(() => {
    if (!username) {
      navigate("/login");
      return;
    }
    fetchWishlist();
  }, [username]);

  const fetchWishlist = async () => {
    try {
      const response = await axios.get(`http://localhost:8081/wishlist/${username}`);
      setWishlist(response.data);
    } catch (error) {
      console.error("Error fetching wishlist", error);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await axios.delete(`http://localhost:8081/dwishlist/${username}/${productId}`);
      setWishlist(wishlist.filter((item) => item.product_id !== productId));
    } catch (error) {
      console.error("Error removing item from wishlist", error);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      {/* Home Button */}
      <button
        onClick={() => navigate("/")}
        className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:bg-green-700 transition"
      >
        Home
      </button>

      <h2 className="text-3xl font-bold text-center text-gray-800 my-6">Your Wishlist</h2>

      {wishlist.length === 0 ? (
        <p className="text-center text-gray-500">No items in your wishlist.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {wishlist.map((item) => (
            <div key={item.product_id} className={`relative ${item.sale_status === 1 ? "opacity-50" : ""}`}>
              {item.sale_status === 1 && (
                <span className="absolute top-2 left-2 z-10 bg-red-600 text-white px-2 py-1 text-xs font-bold rounded">
                  SOLD
                </span>
              )}

              {/* Only allow clicking if the item is not sold */}
              {item.sale_status !== 1 ? (
                <Link to={`/product/${item.product_id}`} className="block">
                  <WishlistItem item={item} removeFromWishlist={removeFromWishlist} />
                </Link>
              ) : (
                <WishlistItem item={item} removeFromWishlist={removeFromWishlist} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const WishlistItem = ({ item, removeFromWishlist }) => (
  <div className="relative bg-white/80 backdrop-blur-md shadow-lg p-5 rounded-xl border border-gray-200 hover:shadow-xl transition-all">
    <img
      src={item.image_url || "https://via.placeholder.com/300"}
      alt={item.title}
      className="w-full h-48 object-cover rounded-lg"
    />

    <div className="flex items-center justify-between mt-3">
      <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
      <button
        onClick={(e) => {
          e.preventDefault();
          removeFromWishlist(item.product_id);
        }}
        className="text-red-500 hover:text-red-600 transition mr-2"
      >
        <FaTrash size={18} />
      </button>
    </div>

    <p className="text-sm text-gray-500">Location: {item.location}</p>
    <p className="text-lg font-bold text-green-600 mt-1">₹{item.price}</p>
  </div>
);

export default Wishlist;
