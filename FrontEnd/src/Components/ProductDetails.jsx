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
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showContactOptions, setShowContactOptions] = useState(false);

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
        if (!isFake) checkIfWishlisted(productId); // Wishlist only for real products
      } catch (err) {
        console.error("Error fetching product details:", err);
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
      console.error("Error adding item to wishlist:", error);
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
      console.error("Error fetching seller email:", error);
      alert("Failed to fetch seller email. Please try again.");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!product) return <p>Product not found</p>;

  const images = Array.isArray(product.images) ? product.images : [product.image || product.image_url];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl w-full bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Image Carousel */}
        <div className="relative w-full h-80 bg-gray-200">
          {images.length > 1 && (
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full"
            >
              <ChevronLeft size={24} />
            </button>
          )}
          <img src={images[currentImageIndex]} alt={product.title} className="w-full h-full object-cover" />
          {images.length > 1 && (
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full"
            >
              <ChevronRight size={24} />
            </button>
          )}
        </div>

        {/* Product Details */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800">{product.title || product.name}</h2>
          <p className="text-gray-600 mt-1">
            Condition: <span className="font-medium">{product.condition || "N/A"}</span>
          </p>
          <p className="text-gray-600 mt-1">
            Category: <span className="font-medium">{product.category?.name || "N/A"}</span>
          </p>
          <p className="text-green-600 text-2xl font-semibold mt-3">
            ₹{product.price || product.price?.toFixed(2)}
          </p>

          {/* Buttons: Wishlist & Contact Seller */}
          <div className="mt-4 flex space-x-4">
            {!id.startsWith("fake-") && (
              <button
                className={`flex-1 py-2 rounded-lg font-semibold shadow transition ${
                  isWishlisted ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
                onClick={handleAddToWishlist}
                disabled={isWishlisted}
              >
                {isWishlisted ? "Added to Wishlist" : "Add to Wishlist"}
              </button>
            )}

            <button
              className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold shadow hover:bg-green-700 transition"
              onClick={() => setShowContactOptions(!showContactOptions)}
            >
              Contact Seller
            </button>
          </div>

          {/* Contact Seller Options */}
          {showContactOptions && !id.startsWith("fake-") && (
            <div className="mt-3 p-4 bg-gray-200 rounded-lg shadow-md">
              <p className="font-semibold">Choose how to contact the seller:</p>
              <div className="flex space-x-4 mt-2">
                <button
                  className="flex-1 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow hover:bg-yellow-600 transition"
                  onClick={handleEmailSeller}
                >
                  Email Seller
                </button>
                <button
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition"
                  onClick={() => alert("Message feature coming soon!")}
                >
                  Message Seller
                </button>
              </div>
            </div>
          )}

          {id.startsWith("fake-") && (
            <p className="mt-4 text-gray-500 text-center">This is a demo product from EscuelaJS API.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
