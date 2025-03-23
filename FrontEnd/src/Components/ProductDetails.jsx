import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:8081/product/${id}`)
      .then((res) => {
        setProduct(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching product details:", err);
        setError("Failed to load product details.");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!product) return <p>Product not found</p>;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="max-w-3xl w-full bg-white shadow-xl rounded-xl overflow-hidden transform transition duration-500 hover:scale-[1.02]">
        <img src={product.image_url} alt={product.title} className="w-full h-72 object-cover" />
        <div className="p-8">
          <h2 className="text-3xl font-extrabold text-gray-800">{product.title}</h2>
          <p className="text-gray-500 text-lg mt-2">Condition: <span className="font-medium">{product.condition}</span></p>
          <p className="text-gray-500 text-lg mt-2">Location: <span className="font-medium">{product.location}</span></p>
          <p className="text-green-700 text-2xl font-bold mt-4">₹{product.price}</p>
          <div className="mt-6 flex space-x-4">
            <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold shadow-md hover:bg-blue-700 transition">
              Add to Wishlist
            </button>
            <button className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold shadow-md hover:bg-green-700 transition">
              Contact Seller
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
