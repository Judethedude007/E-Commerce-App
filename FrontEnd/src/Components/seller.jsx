import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const UserProfile = () => {
  const { userId } = useParams();  // Fetch userId from URL
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        // Fetch Seller Profile (name, email, rating)
        const userRes = await axios.get(`http://localhost:8081/seller-profile/${userId}`);
        setUser(userRes.data);

        // Fetch Products by Seller
        const productsRes = await axios.get(`http://localhost:8081/seller-products/${userId}`);
        setProducts(productsRes.data);
      } catch (err) {
        setError("Failed to load user profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!user) return <p>User not found.</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
      {/* Seller Details */}
      <h2 className="text-3xl font-bold text-gray-800 mb-4">{user.seller_name || "Unknown Seller"}</h2>
      <p className="text-gray-600 mb-2"><strong>Email:</strong> {user.seller_email || "Not Available"}</p>
      <p className="text-gray-600 mb-2">
        <strong>Rating:</strong> ⭐ {user.average_rating || "0.0"} ({user.total_ratings || 0} Ratings)
      </p>

      {/* Product Listings */}
      <h3 className="text-xl font-semibold mt-6 mb-3">Products Listed</h3>
      {products.length === 0 ? (
        <p className="text-gray-500">No products added by this user.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((product) => (
            <div 
              key={product.id} 
              className={`relative bg-white rounded-lg shadow p-4 flex ${product.sale_status === 1 ? "opacity-50" : ""}`}
            >
              {/* SOLD Badge */}

              {/* Product Image */}
              <div className="w-24 h-24 mr-4 relative">
                <img 
                  src={product.image_url} 
                  alt={product.title} 
                  className="w-full h-full object-cover rounded"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/placeholder-image.jpg"; // Fallback image
                  }}
                />
              </div>

              {/* Product Info */}
              <div className="flex-1 ">
                <h3 className="font-bold text-lg">{product.title}</h3>
                <p className="text-green-600 font-semibold">₹{product.price}</p>
                <p className="text-sm text-gray-500">{product.condition} • {product.location}</p>
                {product.sale_status === 1 ? (
                  <span className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 text-xs font-bold rounded z-10">
                  SOLD
                </span>
                ) : (
                  <a href={`/product/${product.id}`} className="text-blue-500 hover:underline">
                    View Product
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserProfile;
