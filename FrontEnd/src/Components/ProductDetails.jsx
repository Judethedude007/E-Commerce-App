import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);

      const isFake = id.startsWith("fake-"); // Check if it's a fake product
      const productId = isFake ? id.replace("fake-", "") : id;
      const url = isFake
        ? `https://api.escuelajs.co/api/v1/products/${productId}`
        : `http://localhost:8081/product/${productId}`;

      try {
        const res = await axios.get(url);
        setProduct(res.data);
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!product) return <p>Product not found</p>;

  const images = product.images || [product.image_url];
  const sellerContact = product.seller_contact || "Not available"; // Handling missing seller info

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl w-full bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="relative w-full h-80 bg-gray-200">
          {images.length > 1 && (
            <button onClick={prevImage} className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full">
              <ChevronLeft size={24} />
            </button>
          )}
          <img src={images[currentImageIndex]} alt={product.title} className="w-full h-full object-cover" />
          {images.length > 1 && (
            <button onClick={nextImage} className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full">
              <ChevronRight size={24} />
            </button>
          )}
        </div>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800">{product.title}</h2>
          <p className="text-gray-600 mt-1">Condition: <span className="font-medium">{product.condition || "N/A"}</span></p>
          <p className="text-gray-600 mt-1">Category: <span className="font-medium">{product.category?.name || "N/A"}</span></p>
          <p className="text-green-600 text-2xl font-semibold mt-3">₹{product.price}</p>

          <div className="mt-4 flex space-x-4">
            <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition">
              Add to Wishlist
            </button>
            <button
              className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold shadow hover:bg-green-700 transition"
              onClick={() => alert(`Contact Seller: ${sellerContact}`)}
            >
              Contact Seller
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
