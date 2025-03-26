import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { ChevronLeft, ChevronRight, Heart, Mail } from "lucide-react";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const username = localStorage.getItem("username");

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);

      const isFake = id.startsWith("fake-");
      const productId = isFake ? id.replace("fake-", "") : id;
      const url = isFake
        ? `https://api.escuelajs.co/api/v1/products/${productId}`
        : `http://localhost:8081/product/${productId}`;

      try {
        const res = await axios.get(url);
        setProduct(res.data);
        if (!isFake) checkIfWishlisted(productId);
      } catch (err) {
        setError("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const checkIfWishlisted = async (productId) => {
    if (!username) return;
    try {
      const res = await axios.get(`http://localhost:8081/wishlist/${username}`);
      const wishlistedProducts = res.data.map((item) => item.product_id);
      setIsWishlisted(wishlistedProducts.includes(parseInt(productId)));
    } catch (error) {
      console.error("Error checking wishlist status:", error);
    }
  };

  const handleAddToWishlist = async () => {
    if (!username) {
      alert("Please log in to add items to your wishlist.");
      return;
    }

    try {
      await axios.post("http://localhost:8081/iwishlist", {
        username,
        product_id: id,
      });

      setIsWishlisted(true);
      alert("Item added to wishlist!");
    } catch (error) {
      alert("Failed to add item to wishlist.");
    }
  };

  const handleEmailSeller = async () => {
    try {
      const res = await axios.get(`http://localhost:8081/email/${id}`);
      const sellerEmail = res.data.seller_email;

      if (!sellerEmail) {
        alert("Seller email not available.");
        return;
      }

      window.location.href = `mailto:${sellerEmail}?subject=Interest in ${product.title}`;
    } catch (error) {
      alert("Failed to fetch seller email.");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!product) return <p>Product not found</p>;

  const images = Array.isArray(product.images) ? product.images : [product.image || product.image_url];

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4">
      {/* Home Button - Positioned Properly */}
      <div className="w-full max-w-4xl">
        <button
          onClick={() => navigate("/")}
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:bg-green-700 transition"
        >
          Home
        </button>
      </div>

      {/* Product Card */}
      <div className="max-w-4xl w-full bg-white shadow-xl rounded-lg overflow-hidden mt-4">
        {/* Image Carousel */}
        <div className="relative w-full h-96 bg-gray-200">
          {images.length > 1 && (
            <button
              onClick={() => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black"
            >
              <ChevronLeft size={28} />
            </button>
          )}
          <img src={images[currentImageIndex]} alt={product.title} className="w-full h-full object-cover" />
          {images.length > 1 && (
            <button
              onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black"
            >
              <ChevronRight size={28} />
            </button>
          )}
        </div>

        {/* Product Details */}
        <div className="p-6">
          <h2 className="text-3xl font-bold text-gray-800">{product.title || product.name}</h2>
          <p className="text-gray-600 mt-2">
            <span className="font-semibold">Condition:</span> {product.condition || "N/A"}
          </p>
          <p className="text-gray-600 mt-1">
            <span className="font-semibold">Category:</span> {product.category || "N/A"}
          </p>
          <p className="text-green-600 text-3xl font-bold mt-3">
            ₹{product.price || product.price?.toFixed(2)}
          </p>

          {/* Buttons: Wishlist & Contact Seller */}
          <div className="mt-5 flex space-x-4">
            {!id.startsWith("fake-") && (
              <button
                className={`flex-1 py-3 rounded-lg font-semibold shadow-md text-lg flex items-center justify-center space-x-2 transition ${
                  isWishlisted
                    ? "bg-green-800 text-white cursor-not-allowed"
                    : "bg-green-700 hover:bg-green-800 text-white cursor-pointer"
                }`}
                onClick={handleAddToWishlist}
                disabled={isWishlisted}
              >
                <Heart size={20} />
                <span>{isWishlisted ? "Wishlisted" : "Add to Wishlist"}</span>
              </button>
            )}

            <button
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg cursor-pointer font-semibold shadow-md text-lg flex items-center justify-center space-x-2 hover:bg-blue-700 transition"
              onClick={handleEmailSeller}
            >
              <Mail size={20} />
              <span>Email Seller</span>
            </button>
          </div>

          {id.startsWith("fake-") && (
            <p className="mt-4 text-gray-500 text-center italic">This is a demo product from EscuelaJS API.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
