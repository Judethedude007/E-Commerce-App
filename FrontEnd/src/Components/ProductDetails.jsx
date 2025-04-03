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
                console.log("API Response:", res.data); // Debug API response
                if (res.data) {
                    setProduct(res.data);
                    // Set seller information from the response
                    console.log("Setting seller name:", res.data.seller_name); // Debug seller name
                    setSellerName(res.data.seller_name || "Unknown Seller");
                    setSellerEmail(res.data.seller_email || "Not Available");
                    if (res.data.user_id) {
                        fetchUserRating(res.data.user_id);
                    }
                    checkIfWishlisted(res.data.id);
                } else {
                    setError("Product not found");
                }
            } catch (err) {
                console.error("Error fetching product:", err);
                setError(err.response?.data?.message || "Failed to load product details.");
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

    const checkIfWishlisted = async (productId) => {
        if (!username || !productId) return;
        try {
            const res = await axios.get(`http://localhost:8081/wishlist/${username}`);
            const wishlistedProducts = res.data.map(item => 
                item.product_id ? item.product_id.toString() : ''
            );
            setIsWishlisted(wishlistedProducts.includes(productId.toString()));
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
        <div className="min-h-screen bg-gray-50">
            {/* Navigation Bar */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <button
                        onClick={() => navigate("/")}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Back to Home
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                        {error}
                    </div>
                ) : !product ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
                        Product not found
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column - Images */}
                        <div className="space-y-4">
                            {/* Main Image */}
                            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                <div className="relative aspect-square">
                                    <img 
                                        src={images[currentImageIndex]} 
                                        alt={product.title} 
                                        className="w-full h-full object-cover"
                                    />
                                    {images.length > 1 && (
                                        <>
                                            <button
                                                onClick={() => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                                                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
                                            >
                                                <ChevronLeft size={24} />
                                            </button>
                                            <button
                                                onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
                                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
                                            >
                                                <ChevronRight size={24} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Thumbnail Grid */}
                            {images.length > 1 && (
                                <div className="grid grid-cols-4 gap-2">
                                    {images.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition ${
                                                currentImageIndex === index 
                                                    ? 'border-green-500' 
                                                    : 'border-transparent hover:border-gray-300'
                                            }`}
                                        >
                                            <img 
                                                src={image} 
                                                alt={`${product.title} - Image ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right Column - Product Details */}
                        <div className="space-y-6">
                            {/* Product Info */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>
                                
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-2xl font-bold text-green-600">₹{product.price?.toFixed(2)}</span>
                                        {product.condition && (
                                            <span className="px-2 py-1 text-sm bg-gray-100 text-gray-600 rounded-full">
                                                {product.condition}
                                            </span>
                                        )}
                                    </div>
                                    {!id.startsWith("fake-") && (
                                        <button
                                            onClick={handleAddToWishlist}
                                            disabled={isWishlisted}
                                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                                                isWishlisted
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : 'bg-green-600 text-white hover:bg-green-700'
                                            }`}
                                        >
                                            <Heart size={20} className={isWishlisted ? 'fill-current' : ''} />
                                            <span>{isWishlisted ? "Wishlisted" : "Add to Wishlist"}</span>
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Category</p>
                                            <p className="font-medium">{product.category || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Used For</p>
                                            <p className="font-medium">{product.used_time || ""} {product.used_years || "N/A"}</p>
                                        </div>
                                    </div>
                                    {product.description && (
                                        <div>
                                            <p className="text-sm text-gray-500">Description</p>
                                            <p className="font-medium whitespace-pre-wrap">{product.description}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Seller Info */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                            <span className="text-xl font-semibold text-gray-600">
                                                {sellerName?.[0]?.toUpperCase() || 'S'}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{sellerName || "Unknown Seller"}</h3>
                                            <div className="flex items-center space-x-2">
                                                <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full">
                                                    <span className="text-yellow-500 mr-1">⭐</span>
                                                    <span className="font-medium">{product?.seller_rating || "0.0"}</span>
                                                    <span className="text-gray-500 ml-1">({product?.total_ratings || 0})</span>
                                                </div>
                                                <button
                                                    onClick={() => navigate(`/user-profile/${product.user_id}`)}
                                                    className="text-sm text-blue-600 hover:text-blue-800"
                                                >
                                                    View Profile
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <button
                                        onClick={handleEmailSeller}
                                        className="flex items-center justify-center px-4 py-3 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition group"
                                    >
                                        <Mail className="w-5 h-5 text-gray-400 group-hover:text-blue-500 mr-2" />
                                        <span className="font-medium">Contact via Email</span>
                                    </button>
                                    <button
                                        onClick={handleWhatsAppSeller}
                                        className="flex items-center justify-center px-4 py-3 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition group"
                                    >
                                        <Phone className="w-5 h-5 text-gray-400 group-hover:text-green-500 mr-2" />
                                        <span className="font-medium">Contact via WhatsApp</span>
                                    </button>
                                </div>

                                {/* Rating Section */}
                                {showRating && (
                                    <div className="border-t pt-6">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Rate this Seller</h4>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                {renderStars()}
                                                <span className="text-sm text-gray-500">
                                                    {selectedRating > 0 ? `${selectedRating} out of 5` : 'Select rating'}
                                                </span>
                                            </div>
                                            <button
                                                onClick={sendRatingToBackend}
                                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                                                disabled={selectedRating === 0}
                                            >
                                                Submit Rating
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetails;