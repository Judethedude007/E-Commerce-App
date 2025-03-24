import { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const username = localStorage.getItem("username"); // Get logged-in username
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
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Your Wishlist</h2>
      {wishlist.length === 0 ? (
        <p>No items in your wishlist.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item) => (
            <div key={item.product_id} className="border p-4 shadow-md rounded-lg">
              <img
                src={item.image_url || "https://via.placeholder.com/150"}
                alt={item.title}
                className="w-full h-40 object-cover rounded"
              />
              <h3 className="text-lg font-semibold mt-2">{item.title}</h3>
              <p className="text-gray-600">Location: {item.location}</p>
              <p className="text-green-600 font-bold">₹{item.price}</p>
              <button
                onClick={() => removeFromWishlist(item.product_id)}
                className="mt-2 bg-red-500 text-white px-3 py-1 rounded flex items-center"
              >
                <FaTrash className="mr-2" /> Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
