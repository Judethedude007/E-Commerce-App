import { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Sellitems = () => {
  const navigate = useNavigate();
  const [userProducts, setUserProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      setLoading(false);
      setError("User not logged in. Please log in to view your listings.");
    }
  }, []);

  useEffect(() => {
    if (!username) return;
    const fetchUserProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8081/user-products/${username}`);
        setUserProducts(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user products:", error);
        setLoading(false);
      }
    };
    fetchUserProducts();
  }, [username]);

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