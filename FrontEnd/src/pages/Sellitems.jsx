import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Edit, Trash2, MessageSquare, Plus } from "lucide-react";
import axios from "axios";

const Sellitems = () => {
  const navigate = useNavigate();
  const [userProducts, setUserProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unseenCounts, setUnseenCounts] = useState({});
  const [sellerId, setSellerId] = useState(null);
  const username = localStorage.getItem("username") || "";

  // Fetch user ID (sellerId) from username
  useEffect(() => {
    if (!username) return;
    const fetchUserId = async () => {
      try {
        const res = await axios.get(`http://localhost:8081/get-userid/${username}`);
        setSellerId(res.data.userId);
      } catch {
        setError("Failed to fetch user ID.");
      }
    };
    fetchUserId();
  }, [username]);

  // Fetch user's products
  useEffect(() => {
    if (!sellerId) return;
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:8081/user-products/${username}`);
        setUserProducts(res.data);
      } catch (err) {
        setError("Failed to fetch your products.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [username, sellerId]);

  // Fetch unseen message counts using sellerId
  useEffect(() => {
    if (!sellerId) return;
    const fetchUnseen = async () => {
      try {
        const res = await axios.get(`http://localhost:8081/unseen-msg-count/${sellerId}`);
        setUnseenCounts(res.data);
      } catch (err) {
        setUnseenCounts({});
      }
    };
    fetchUnseen();
  }, [sellerId]);

  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`http://localhost:8081/delete-item/${productId}`);
        setUserProducts(userProducts.filter(product => product.id !== productId));
      } catch (error) {
        alert("Failed to delete product");
      }
    }
  };

  const handleEdit = (productId) => {
    navigate(`/edit-product/${productId}`);
  };

  const handleCreateListing = () => {
    if (!username) {
      alert("You need to log in to create a listing.");
      navigate("/login");
    } else {
      navigate("/Create-listing");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Listings</h1>
          <button
            onClick={handleCreateListing}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-800 transition"
          >
            <Plus size={20} />
            <span>Create Listing</span>
          </button>
        </div>

        {loading ? (
          <p className="text-center py-8">Loading your listings...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : userProducts.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-lg shadow">
            <p className="text-xl font-semibold">No items listed</p>
            <p className="text-gray-500">Click 'Create Listing' to list a new item.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userProducts.map((product) => (
              <div key={product.id} className="relative bg-white rounded-lg shadow p-4 flex">
                <div className="w-24 h-24 mr-4 relative">
                  <img 
                    src={product.image_url} 
                    alt={product.title} 
                    className="w-full h-full object-cover rounded"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/placeholder-image.jpg"; 
                    }}
                  />
                  {product.sale_status === 1 && (
                    <span className="absolute bottom-0 left-0 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded">
                      Sold
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{product.title}</h3>
                  <p className="text-green-600 font-semibold">${product.price}</p>
                  <p className="text-sm text-gray-500">{product.condition} • {product.location}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => handleEdit(product.id)}
                    className="p-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className="p-2 bg-red-50 text-red-700 rounded hover:bg-red-100"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button
                    onClick={() => {
                      if ((unseenCounts[product.id] || 0) > 0) {
                        navigate(`/productmsg/${product.id}`);
                      } else {
                        alert("No messages for this product.");
                      }
                    }}
                    className="relative p-2 bg-yellow-50 text-yellow-700 rounded hover:bg-yellow-100"
                    title="View Messages"
                  >
                    <Bell size={18} />
                    {unseenCounts[product.id] > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                        {unseenCounts[product.id]}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sellitems;