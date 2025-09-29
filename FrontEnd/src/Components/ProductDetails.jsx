import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react"; 
import axios from "axios";
import { ChevronLeft, ChevronRight, Heart, Mail, Phone, Star, MessageSquare, Send } from "lucide-react"; 

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [sellerName, setSellerName] = useState("");
    const [sellerEmail, setSellerEmail] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [showRating, setShowRating] = useState(false);
    const [selectedRating, setSelectedRating] = useState(0);
    const [communicationType, setCommunicationType] = useState(null);
    const [existingRating, setExistingRating] = useState(0);
    const [isChatOpen, setIsChatOpen] = useState(false); 

    // FIX 1: The key "username" stores the numerical User ID (string format)
    const userIdString = localStorage.getItem("username");
    
    // We KEEP the senderId (parsed integer) for local UI comparison logic (msg.sender_id === senderId)
    const senderId = userIdString ? parseInt(userIdString) : null; 
    
    // State for messages and input
    const [messages, setMessages] = useState([]); 
    const [newMessage, setNewMessage] = useState(''); 
    const messagesEndRef = useRef(null); 
    // =========================================================================

    // --- API CALLS AND POLLING ---

    const fetchChatHistory = async (currentSellerId) => {
        // Use username string for API (backend will resolve to ID)
        if (!userIdString || !currentSellerId) return;

        try {
            const res = await axios.get(
                `http://localhost:8081/chat/history/${id}/${userIdString}/${currentSellerId}`
            );
            setMessages(res.data);
        } catch (err) {
            console.error("Failed to load chat history:", err);
        }
    };
    
    const handleSend = async (e) => {
        e.preventDefault();
        const messageText = newMessage.trim();
        const currentSellerId = product?.user_id;

        // Use username string for API (backend will resolve to ID)
        const senderIdStringForAPI = userIdString; 

        if (!messageText || !product || !senderIdStringForAPI || !currentSellerId) {
            console.error("Send blocked: Missing text, product info, or sender ID.", { senderId: senderIdStringForAPI, currentSellerId, messageText: !!messageText });
            return;
        }

        const messageData = {
            product_id: parseInt(id),
            sender_id: senderIdStringForAPI, // username string
            receiver_id: currentSellerId,    // can be username or ID
            message_text: messageText,
        };

        try {
            const tempMessage = { ...messageData, timestamp: new Date().toISOString(), sender_id: senderId };
            setMessages(prev => [...prev, tempMessage]); 
            setNewMessage(''); 

            await axios.post('http://localhost:8081/send-message', messageData); 
            fetchChatHistory(currentSellerId);

        } catch (error) {
            console.error("Failed to send message (Backend Error):", error.response?.status, error.message);
            alert(`Failed to send message. Server responded with status ${error.response?.status}. Ensure all IDs (Sender, Receiver, Product) are loaded.`);
            setMessages(prev => prev.filter(msg => msg !== tempMessage));
            setNewMessage(messageText); 
        }
    };


    // --- MAIN PRODUCT FETCH & EFFECTS (UNCHANGED) ---
    useEffect(() => {
        const fetchProductDetails = async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await axios.get(`http://localhost:8081/product/${id}`);
                setProduct(res.data);
                
                const currentSellerId = res.data.user_id;
                
                if(senderId !== null && currentSellerId) {
                    fetchChatHistory(currentSellerId);
                }
                
                fetchUserRating(res.data.user_id); 
                checkIfWishlisted(res.data.id);
            } catch (err) {
                setError("Failed to load product details.");
            } finally {
                setLoading(false);
            }
        };

        fetchProductDetails();
    }, [id, senderId]); 

    // Polling Effect
    useEffect(() => {
        if (!isChatOpen || !product || !userIdString) return;
        
        const currentSellerId = product.user_id;

        const intervalId = setInterval(() => fetchChatHistory(currentSellerId), 3000); 

        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

        return () => clearInterval(intervalId); 

    }, [isChatOpen, product, userIdString, id]); 

    // --- REST OF EXISTING FUNCTIONS ---

    const fetchUserRating = async (sellerId) => {
        if (!sellerId) return;
        try {
            // This API uses the raw username/ID string stored in localStorage
            const res = await axios.get(`http://localhost:8081/user-rating/${sellerId}/${userIdString}`);
            setExistingRating(res?.data.rating || 0);
        } catch (error) {
            console.error("Error fetching rating", error);
            setExistingRating(0);
        }
    }

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
        if (!userIdString) return;
        try {
            const res = await axios.get(`http://localhost:8081/wishlist/${userIdString}`);
            const wishlistedProducts = res.data.map((item) => item.product_id);
            setIsWishlisted(wishlistedProducts.includes(parseInt(productId)));
        } catch (error) {
            console.error("Error checking wishlist status:", error);
        }
    };

    const handleAddToWishlist = async () => {
        if (!userIdString) {
            alert("Please log in to add items to your wishlist.");
            return;
        }

        try {
            await axios.post("http://localhost:8081/iwishlist", {
                username: userIdString, 
                product_id: id,
            });

            setIsWishlisted(true);
            alert("Item added to wishlist!");
        } catch (error) {
            alert("Failed to add item to wishlist.");
        }
    };

    const startPrompt = (type) => { /* ... (unchanged) ... */ };

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
    
    const handleChatSeller = () => {
        if (!userIdString) {
            alert("Please log in to start a chat.");
            return;
        }
        setIsChatOpen(true);
        startPrompt('chat');
    };

    const sendRatingToBackend = async () => {
        try {
            if (selectedRating == 0) {
                alert("Must submit value greater than zero.");
                return;
            }

            const res = await axios.post("http://localhost:8081/rate-seller", {
                sellerId: product.user_id,
                rating: parseInt(selectedRating),
                username: userIdString // Pass the ID string as 'username'
            });

            if (communicationType === 'email') {
                window.location.href = `mailto:${product?.seller_email}?subject=Interest in ${product.title}`;
            }

            setShowRating(false);
            setExistingRating(selectedRating);
        } catch (error) {
            console.error("Failed to send rating:", error);
            alert("Failed to send rating.");
        } finally {
            setCommunicationType(null);
        }
    };

    const renderStars = () => { /* ... (unchanged) ... */ };


    if (loading) return <p>Loading...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!product) return <p>Product not found</p>;

    const images = Array.isArray(product.images) ? product.images : [product.image || product.image_url];
    
    // --- ChatWindow Component ---
    const ChatWindow = () => {
        if (!isChatOpen || !product) return null;

        const chatName = product?.seller_name || "Seller";
        
        return (
            <div className="fixed bottom-0 right-0 w-80 h-96 bg-white border border-gray-300 shadow-xl rounded-t-lg z-50 flex flex-col">
                {/* Chat Header */}
                <div className="p-3 bg-green-600 text-white flex justify-between items-center rounded-t-lg">
                    <h5 className="font-semibold">Chat with {chatName}</h5>
                    <button onClick={() => setIsChatOpen(false)} className="text-white hover:text-gray-200">
                        &times;
                    </button>
                </div>

                {/* Chat Messages Display Area */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {messages.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center mt-4">
                            Start the conversation about **{product.title}**
                        </p>
                    ) : (
                        messages.map((msg, index) => (
                            <div 
                                key={index} 
                                className={`flex ${msg.sender_id === senderId ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[80%] p-2 rounded-xl ${
                                    msg.sender_id === senderId 
                                        ? 'bg-green-100 text-gray-800 rounded-br-none'
                                        : 'bg-gray-200 text-gray-800 rounded-tl-none'
                                }`}>
                                    <p className="text-sm">{msg.message_text}</p>
                                    <span className="text-xs text-gray-500 block text-right mt-1">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Chat Input Form */}
                <form onSubmit={handleSend} className="p-3 border-t flex space-x-2"> 
                    <input
                        type="text"
                        placeholder="Type your message..."
                        value={newMessage} 
                        onChange={(e) => setNewMessage(e.target.value)} 
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                        autoFocus
                    />
                    <button 
                        type="submit" 
                        disabled={newMessage.trim() === ''}
                        className={`p-2 rounded-lg transition-colors ${
                            newMessage.trim() === '' 
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        );
    };

    // --- Main Component Return ---
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation Bar - (Unchanged) */}
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
                {/* ... (Product Details UI) ... */}
                {loading || error || !product ? (
                    <div className="flex justify-center items-center h-64">
                         {loading && <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>}
                         {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>}
                         {!loading && !error && !product && <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">Product not found</div>}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column - Images (Unchanged) */}
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
                            {/* Product Info (Unchanged) */}
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
                                                {product?.seller_name?.[0]?.toUpperCase() || 'S'}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{product?.seller_name || "Unknown Seller"}</h3>
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

                                {/* Communication Buttons: Added an extra column for Chat */}
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <button
                                        onClick={handleEmailSeller}
                                        className="flex flex-col items-center justify-center px-2 py-3 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition group"
                                    >
                                        <Mail className="w-5 h-5 text-gray-400 group-hover:text-blue-500 mb-1" />
                                        <span className="font-medium text-sm">Email</span>
                                    </button>
                                    <button
                                        onClick={handleWhatsAppSeller}
                                        className="flex flex-col items-center justify-center px-2 py-3 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition group"
                                    >
                                        <Phone className="w-5 h-5 text-gray-400 group-hover:text-green-500 mb-1" />
                                        <span className="font-medium text-sm">WhatsApp</span>
                                    </button>
                                    {/* New Chat Button */}
                                    <button
                                        onClick={handleChatSeller}
                                        className="flex flex-col items-center justify-center px-2 py-3 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition group"
                                    >
                                        <MessageSquare className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 mb-1" />
                                        <span className="font-medium text-sm">Chat</span>
                                    </button>
                                </div>

                                {/* Rating Section (Unchanged) */}
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

            {/* Floating Chat Window (Rendered if product is loaded) */}
            {product && <ChatWindow />}
        </div>
    );
};

export default ProductDetails;
