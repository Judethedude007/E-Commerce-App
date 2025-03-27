import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { ChevronLeft, ChevronRight, Heart, Mail, Phone, Star } from "lucide-react";

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [sellerName, setSellerName] = useState(""); // Seller's name
    const [sellerEmail, setSellerEmail] = useState(""); // Seller's email
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [showRating, setShowRating] = useState(false); // Control the prompt to rate.
    const [selectedRating, setSelectedRating] = useState(0); // Track the selected rating.
    const [communicationType, setCommunicationType] = useState(null); // Track which is clicked
    const [existingRating, setExistingRating] = useState(0); // track rating

    const username = localStorage.getItem("username");

    useEffect(() => {
        const fetchProductDetails = async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await axios.get(`http://localhost:8081/product/${id}`);
                setProduct(res.data);
                fetchUserRating(res.data.user_id) // new function
                if (res.data.user_id) {
                    // fetchSellerDetails(res.data.user_id); // Fetch seller details using user_id
                }
                checkIfWishlisted(res.data.id);
            } catch (err) {
                setError("Failed to load product details.");
            } finally {
                setLoading(false);
            }
        };

        fetchProductDetails();
    }, [id]);

    const fetchUserRating = async (sellerId) => {
        if (!sellerId) return;
        try {
            const res = await axios.get(`http://localhost:8081/user-rating/${sellerId}/${username}`);
            //This should be some int from the data being returned as well.
            setExistingRating(res?.data.rating || 0);
        } catch (error) {
            console.error("Error fetching rating", error);
            setExistingRating(0);
        }
    }

    // Fetch seller's name and email from backend
    const fetchSellerDetails = async (userId) => {
        if (!userId) return;
        try {
            const res = await axios.get(`http://localhost:8081/seller/${userId}`);
            setSellerName(res.data.seller_name || "Unknown Seller");
            setSellerEmail(res.data.seller_email || "Not Available");
        } catch (error) {
            console.error("Error fetching seller details:", error);
            setSellerName("Unknown Seller");
            setSellerEmail("Not Available");
        }
    };

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

    const startPrompt = (type) => {
        setCommunicationType(type); // Set which is selected
        setSelectedRating(existingRating) // load the current ones
        setShowRating(true); // Activate the UI for the prompt.
    };

    const handleEmailSeller = () => {
        window.location.href = `mailto:${product?.seller_email}?subject=Interest in ${product.title}`;
        startPrompt('email');
    };

    const handleWhatsAppSeller = () => {
        if (!product?.contact_number) {
            alert("Seller's WhatsApp number is not available.");
            return;
        }
        const message = `I am interested in your listing: ${product.title}`;
        const whatsappLink = `https://wa.me/${product.contact_number}?text=${encodeURIComponent(message)}`;
        window.open(whatsappLink, '_blank');
        startPrompt('whatapp');
    };

    const sendRatingToBackend = async () => {
        try {
            if (selectedRating == 0) {
                alert("Must submit value greater than zero.");
                return;
            }

            //Call the API here.
            const res = await axios.post("http://localhost:8081/rate-seller", {
                sellerId: product.user_id,
                rating: parseInt(selectedRating),
                username: username
            });

            if (communicationType === 'email') {
                window.location.href = `mailto:${product?.seller_email}?subject=Interest in ${product.title}`;
            }

            //Add in backend information
            setShowRating(false);
            setExistingRating(selectedRating); // this works because we are tracking success
        } catch (error) {
            console.error("Failed to send rating:", error);
            alert("Failed to send rating.");
        } finally {
            //Reset
            //   setSelectedRating(0);  no longer clearing ratings for editing
            //   setShowRating(false);
            setCommunicationType(null);
        }
    };

    const renderStars = () => {
        return (
            <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={24}
                        className={`cursor-pointer ${star <= selectedRating ? "text-yellow-500" : "text-gray-400"}`}
                        onClick={() => setSelectedRating(star)}
                    />
                ))}
            </div>
        );
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!product) return <p>Product not found</p>;

    const images = Array.isArray(product.images) ? product.images : [product.image || product.image_url];

    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4">
            {/* Home Button */}
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
                    <p className="text-gray-600"><span className="font-semibold">Used for:</span> {product.used_time || ""} {product.used_years || "N/A"}</p>
                    <p className="text-green-600 text-3xl font-bold mt-3">
                        ₹{product.price || product.price?.toFixed(2)}
                    </p>

                    {/* Wishlist & Contact Seller Buttons */}
                    <div className="mt-5 flex space-x-4">
                        {!id.startsWith("fake-") && (
                            <button
                                className={`flex-1 py-3 rounded-lg font-semibold shadow-md text-lg flex items-center justify-center space-x-2 transition ${isWishlisted
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
                    </div>

                    {/* Seller Profile */}
                    <div className="mt-8 border-t pt-4">
                        <h3 className="text-xl font-semibold text-gray-700">Seller Profile</h3>
                        <p className="text-gray-800 font-semibold">Name: {product?.seller_name}</p>
                        <p className="text-gray-500 text-sm">Email: {product?.seller_email}</p>
                       

                        {/* Contact Options */}
                        <div className="flex mt-4 space-x-4">

                            <button
                                onClick={handleEmailSeller}
                                className="flex items-center justify-center px-4 py-2 border rounded-lg text-blue-600 hover:bg-blue-50 transition"
                            >
                                <Mail size={16} className="mr-2" /> Email
                            </button>
                            <button
                                onClick={handleWhatsAppSeller}
                                className="flex items-center justify-center px-4 py-2 border rounded-lg text-green-600 hover:bg-green-50 transition"
                            >
                                <Phone size={16} className="mr-2" /> WhatsApp
                            </button>
                        </div>

                        {/* Rating Area */}
                        <div className="mt-8 border-t pt-4">
                            {showRating && (
                                <>
                                    <h4 className="text-lg font-semibold text-gray-700">Rate the Seller:</h4>
                                    <div className="flex items-center mt-2">
                                        {renderStars()}
                                        <button
                                            onClick={sendRatingToBackend}
                                            className="ml-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
                                        >
                                            Submit Rating
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        <button
                            onClick={() => navigate(`/user-profile/${product.user_id}`)}
                            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
                        >
                            View Seller Profile
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;