import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react"; 
import axios from "axios";
import { ChevronLeft, ChevronRight, Heart, Mail, Phone, Star, MessageSquare, Send } from "lucide-react"; 

const ProductDetails = () => {
    // --- STATE MANAGEMENT ---
    const { id } = useParams();
    const navigate = useNavigate();

    // General product state
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // User interaction state
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [showRating, setShowRating] = useState(false);
    const [selectedRating, setSelectedRating] = useState(0);
    const [communicationType, setCommunicationType] = useState(null);
    const [existingRating, setExistingRating] = useState(0);

    // Chat state
    const [isChatOpen, setIsChatOpen] = useState(false); 
    const [messages, setMessages] = useState([]); 
    const [newMessage, setNewMessage] = useState(''); 
    const messagesEndRef = useRef(null); 

    // Bidding state
    const [bidAmount, setBidAmount] = useState("");
    const [bidLoading, setBidLoading] = useState(false);
    const [bidError, setBidError] = useState("");
    const [bidSuccess, setBidSuccess] = useState("");
    const [bids, setBids] = useState([]);
    const [bidsLoading, setBidsLoading] = useState(false);
    const [bidsError, setBidsError] = useState("");

    // Live countdown timer state
    const [nowTs, setNowTs] = useState(Date.now());
    const [timeDrift, setTimeDrift] = useState(0);

    // Wallet balance state
    const [walletBalance, setWalletBalance] = useState(null);

    // --- CONSTANTS & HELPERS ---
    const userIdString = localStorage.getItem("username");
    const senderId = userIdString ? parseInt(userIdString) : null; 
    const username = localStorage.getItem("username");
    const DISPLAY_TZ = 'Asia/Kolkata';
    const isBiddingValue = (v) => (Number(v) === 1 || String(v).toLowerCase() === 'bidding' || String(v) === '1');

    // --- TIME & COUNTDOWN FUNCTIONS ---
    const parseUTCDateTime = (val) => {
        if (!val) return NaN;
        const s = String(val).trim();
        const m = s.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})(?:\.\d+)?$/);
        if (m) {
            const [, y, mo, d, h, mi, se] = m;
            return Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(se));
        }
        const ms = Date.parse(s);
        return Number.isFinite(ms) ? ms : NaN;
    };

    const formatTimeLeft = (ms) => {
        if (!Number.isFinite(ms)) return null;
        if (ms <= 0) return 'Ended';
        const totalSec = Math.floor(ms / 1000);
        const days = Math.floor(totalSec / 86400);
        const hours = Math.floor((totalSec % 86400) / 3600);
        const minutes = Math.floor((totalSec % 3600) / 60);
        const seconds = totalSec % 60;
        if (days > 0) return `${days}d ${hours}h ${minutes}m ${seconds}s`;
        if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
        if (minutes > 0) return `${minutes}m ${seconds}s`;
        return `${seconds}s`;
    };

    const formatInTZ = (msOrIso, tz = DISPLAY_TZ) => {
        const ms = typeof msOrIso === 'number' ? msOrIso : Date.parse(String(msOrIso));
        if (!Number.isFinite(ms)) return '—';
        const fmt = new Intl.DateTimeFormat(undefined, {
            timeZone: tz,
            year: 'numeric', month: 'numeric', day: 'numeric',
            hour: 'numeric', minute: '2-digit', second: '2-digit',
            hour12: true,
        });
        return fmt.format(new Date(ms));
    };

    // --- API & DATA HANDLING FUNCTIONS ---

    const fetchBids = async (productId) => {
        try {
            setBidsLoading(true);
            setBidsError("");
            const res = await axios.get(`http://localhost:8081/bid/${productId}/list`);
            if (res.data?.success) setBids(res.data.bids || []);
            else setBidsError(res.data?.message || "Failed to fetch bids");
        } catch (e) { setBidsError(e?.response?.data?.message || "Failed to fetch bids"); }
        finally { setBidsLoading(false); }
    };
    
    const fetchChatHistory = async (currentSellerId) => {
        if (!userIdString || !currentSellerId) return;
        try {
            const res = await axios.get(`http://localhost:8081/chat/history/${id}/${userIdString}/${currentSellerId}`);
            setMessages(res.data);
        } catch (err) {
            console.error("Failed to load chat history:", err);
        }
    };

    const fetchUserRating = async (sellerId) => {
        if (!sellerId) return;
        try {
            const res = await axios.get(`http://localhost:8081/user-rating/${sellerId}/${userIdString}`);
            setExistingRating(res?.data.rating || 0);
        } catch (error) {
            console.error("Error fetching rating", error);
            setExistingRating(0);
        }
    }
    
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

    const fetchWalletBalance = async () => {
        if (!userIdString) return;
        try {
            const res = await axios.get(`http://localhost:8081/wallet/${userIdString}`);
            setWalletBalance(res.data.wallet_balance);
        } catch (e) {
            setWalletBalance(null);
        }
    };
    
    // --- EVENT HANDLERS ---
    
    const handlePlaceBid = async () => {
    // Validation checks remain the same
    if (!id) {
        setBidError("Product ID is missing.");
        return;
    }
    if (!userIdString) {
        setBidError("You must be logged in to place a bid.");
        return;
    }
    if (!bidAmount || isNaN(bidAmount) || parseFloat(bidAmount) <= 0) {
        setBidError("Please enter a valid, positive bid amount.");
        return;
    }

    try {
        setBidLoading(true);
        setBidError("");
        setBidSuccess("");

        const res = await axios.post(`http://localhost:8081/place-bid/place/${id}`, {
            username: userIdString,
            bid: parseFloat(bidAmount)
        });

        if (res.data?.success) {
            setBidSuccess("Bid placed successfully!");
            setBidAmount("");
            fetchBids(id);
            fetchWalletBalance();
        } else {
            setBidError(res.data?.message || "Failed to place bid");
        }
    } catch (error) {
        // Show backend error message if available
        const errorMessage = error.response?.data?.message || error.message || "An error occurred while placing the bid.";
        setBidError(errorMessage);
        console.error("Error placing bid:", errorMessage);
    } finally {
        setBidLoading(false);
    }
};


    
    const handleSend = async (e) => {
        e.preventDefault();
        const messageText = newMessage.trim();
        const currentSellerId = product?.user_id;
        const senderIdStringForAPI = userIdString; 

        if (!messageText || !product || !senderIdStringForAPI || !currentSellerId) {
            console.error("Send blocked: Missing required data.");
            return;
        }

        const messageData = {
            product_id: parseInt(id),
            sender_id: senderIdStringForAPI,
            receiver_id: currentSellerId,
            message_text: messageText,
        };
        const tempMessage = { ...messageData, timestamp: new Date().toISOString(), sender_id: senderId };

        try {
            setMessages(prev => [...prev, tempMessage]); 
            setNewMessage(''); 
            await axios.post('http://localhost:8081/send-message', messageData); 
            fetchChatHistory(currentSellerId); // Refresh with server data
        } catch (error) {
            console.error("Failed to send message (Backend Error):", error.response?.status, error.message);
            alert(`Failed to send message. Server responded with status ${error.response?.status}.`);
            setMessages(prev => prev.filter(msg => msg !== tempMessage));
            setNewMessage(messageText); 
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

    const startPrompt = (type) => {
        setCommunicationType(type);
        setShowRating(true);
        localStorage.setItem("showRateSeller", "1");
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
        startPrompt('whatsapp');
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
            if (selectedRating === 0) {
                alert("Must submit a rating greater than zero.");
                return;
            }
            await axios.post("http://localhost:8081/rate-seller", {
                sellerId: product.user_id,
                rating: parseInt(selectedRating),
                username: userIdString
            });
            setShowRating(false);
            setExistingRating(selectedRating);
        } catch (error) {
            console.error("Failed to send rating:", error);
            alert("Failed to send rating.");
        } finally {
            setCommunicationType(null);
        }
    };
    
    // --- EFFECTS ---
    
    // Effect for server time synchronization
    useEffect(() => {
        const loadServerTime = async () => {
            try {
                const res = await fetch('http://localhost:8081/time');
                const data = await res.json();
                const serverMs = Number(data?.db_utc_ms || data?.server_ms);
                if (Number.isFinite(serverMs)) setTimeDrift(serverMs - Date.now());
            } catch (e) {
                console.error("Could not fetch server time:", e);
            }
        };
        loadServerTime();
    }, []);

    // Effect for live countdown tick
    useEffect(() => {
        const t = setInterval(() => setNowTs(Date.now() + timeDrift), 1000);
        return () => clearInterval(t);
    }, [timeDrift]);

    // Main data fetching effect
    useEffect(() => {
        const fetchProductDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await axios.get(`http://localhost:8081/product/${id}`);
                const productData = res.data;
                setProduct(productData);
                const currentSellerId = productData.user_id;

                if(senderId !== null && currentSellerId) {
                    fetchChatHistory(currentSellerId);
                }
                fetchUserRating(currentSellerId); 
                checkIfWishlisted(productData.id);
                if(isBiddingValue(productData.listing_type) && username && username === productData.seller_name) {
                    fetchBids(productData.id);
                }
            } catch (err) {
                setError("Failed to load product details.");
            } finally {
                setLoading(false);
            }
        };

        fetchProductDetails();
    }, [id, senderId]); 

    // Polling effect for chat
    useEffect(() => {
        if (!isChatOpen || !product || !userIdString) return;
        
        const currentSellerId = product.user_id;
        const intervalId = setInterval(() => fetchChatHistory(currentSellerId), 3000); 
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        
        return () => clearInterval(intervalId); 
    }, [isChatOpen, product, userIdString, id, messages]); 

    // Effect to show rating prompt after communication
    useEffect(() => {
        if (localStorage.getItem("showRateSeller") === "1") {
            setShowRating(true);
            localStorage.removeItem("showRateSeller");
        }
    }, [id]);

    // Fetch wallet balance on userIdString change
    useEffect(() => {
        fetchWalletBalance();
    }, [userIdString]);

    // --- RENDER LOGIC ---

    const renderStars = () => (
        <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    size={28}
                    className={`cursor-pointer transition-colors ${
                        selectedRating >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                    }`}
                    onClick={() => setSelectedRating(star)}
                />
            ))}
        </div>
    );

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!product) return <p>Product not found</p>;

    const images = Array.isArray(product.images) ? product.images : [product.image || product.image_url];
    
    // --- SUB-COMPONENTS ---

    const ChatWindow = () => {
        if (!isChatOpen || !product) return null;
        const chatName = product?.seller_name || "Seller";
        return (
            <div className="fixed bottom-0 right-0 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg h-96 bg-gray-100 border border-gray-300 shadow-xl rounded-t-lg z-50 flex flex-col">
                <div className="p-3 bg-green-600 text-white flex justify-between items-center rounded-t-lg">
                    <h5 className="font-semibold text-base truncate">Chat with {chatName}</h5>
                    <button onClick={() => setIsChatOpen(false)} className="text-white hover:text-gray-200 text-xl">&times;</button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {messages.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center mt-4">Start the conversation about <b>{product.title}</b></p>
                    ) : (
                        messages.map((msg, index) => {
                            const isBuyer = Number(msg.sender_id) === Number(senderId);
                            return (
                                <div key={index} className={`flex ${isBuyer ? "justify-end" : "justify-start"} mb-1`}>
                                    <div className={`relative px-3 py-2 max-w-[75%] break-words ${isBuyer ? "bg-green-500 text-white rounded-2xl" : "bg-white border border-gray-300 text-gray-900 rounded-2xl"}`} style={{ borderBottomRightRadius: isBuyer ? "0.5rem" : "1rem", borderBottomLeftRadius: !isBuyer ? "0.5rem" : "1rem" }}>
                                        <p className="text-sm">{msg.message_text}</p>
                                        <span className={`text-[10px] block mt-1 text-right ${isBuyer ? "text-green-100" : "text-gray-400"}`}>
                                            {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSend} className="p-2 border-t flex space-x-2 bg-white">
                    <input type="text" placeholder="Type your message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-green-500 text-sm" autoFocus />
                    <button type="submit" disabled={newMessage.trim() === ""} className={`p-2 rounded-full transition-colors ${newMessage.trim() === "" ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 text-white"}`}>
                        <Send size={20} />
                    </button>
                </form>
            </div>
        );
    };

    // --- MAIN COMPONENT RETURN ---
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <button onClick={() => navigate("/")} className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200">
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Back to Home
                    </button>
                </div>
            </div>
            
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Images */}
                    <div className="space-y-4">
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                            <div className="relative aspect-square">
                                <img src={images[currentImageIndex]} alt={product.title} className="w-full h-full object-cover" />
                                {images.length > 1 && (
                                    <>
                                        <button onClick={() => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)} className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"><ChevronLeft size={24} /></button>
                                        <button onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)} className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"><ChevronRight size={24} /></button>
                                    </>
                                )}
                            </div>
                        </div>
                        {images.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {images.map((image, index) => (
                                    <button key={index} onClick={() => setCurrentImageIndex(index)} className={`relative aspect-square rounded-lg overflow-hidden border-2 transition ${currentImageIndex === index ? 'border-green-500' : 'border-transparent hover:border-gray-300'}`}>
                                        <img src={image} alt={`${product.title} - Image ${index + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* Right Column - Product Details */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-2">
                                    <span className="text-2xl font-bold text-green-600">₹{product.price?.toFixed(2)}</span>
                                    {product.condition && (<span className="px-2 py-1 text-sm bg-gray-100 text-gray-600 rounded-full">{product.condition}</span>)}
                                </div>
                                {!id.startsWith("fake-") && (
                                    <button onClick={handleAddToWishlist} disabled={isWishlisted} className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${isWishlisted ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}>
                                        <Heart size={20} className={isWishlisted ? 'fill-current' : ''} />
                                        <span>{isWishlisted ? "Wishlisted" : "Add to Wishlist"}</span>
                                    </button>
                                )}
                            </div>
                            <div className="space-y-4 mb-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div><p className="text-sm text-gray-500">Category</p><p className="font-medium">{product.category || "N/A"}</p></div>
                                    <div><p className="text-sm text-gray-500">Used For</p><p className="font-medium">{product.used_time || ""} {product.used_years || "N/A"}</p></div>
                                </div>
                                {product.description && (<div><p className="text-sm text-gray-500">Description</p><p className="font-medium whitespace-pre-wrap">{product.description}</p></div>)}
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center"><span className="text-xl font-semibold text-gray-600">{product?.seller_name?.[0]?.toUpperCase() || 'S'}</span></div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{product?.seller_name || "Unknown Seller"}</h3>
                                        <div className="flex items-center space-x-2">
                                            <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full">
                                                <span className="text-yellow-500 mr-1">⭐</span>
                                                <span className="font-medium">{product?.seller_rating || "0.0"}</span>
                                                <span className="text-gray-500 ml-1">({product?.total_ratings || 0})</span>
                                            </div>
                                            <button onClick={() => navigate(`/user-profile/${product.user_id}`)} className="text-sm text-blue-600 hover:text-blue-800">View Profile</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <button onClick={handleEmailSeller} className="flex flex-col items-center justify-center px-2 py-3 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition group"><Mail className="w-5 h-5 text-gray-400 group-hover:text-blue-500 mb-1" /><span className="font-medium text-sm">Email</span></button>
                                <button onClick={handleWhatsAppSeller} className="flex flex-col items-center justify-center px-2 py-3 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition group"><Phone className="w-5 h-5 text-gray-400 group-hover:text-green-500 mb-1" /><span className="font-medium text-sm">WhatsApp</span></button>
                                <button onClick={handleChatSeller} className="flex flex-col items-center justify-center px-2 py-3 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition group"><MessageSquare className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 mb-1" /><span className="font-medium text-sm">Chat</span></button>
                            </div>
                            {showRating && (
                                <div className="border-t pt-6">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Rate this Seller</h4>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            {renderStars()}
                                            <span className="text-sm text-gray-500">{selectedRating > 0 ? `${selectedRating} out of 5` : 'Select rating'}</span>
                                        </div>
                                        <button onClick={sendRatingToBackend} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition" disabled={selectedRating === 0}>Submit Rating</button>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Bidding UI */}
                        {isBiddingValue(product?.listing_type) && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Bidding Information</h3>
                                <div className="mb-4">
                                    <p className="text-sm text-gray-500">Current Highest Bid</p>
                                    <p className="text-xl font-bold text-green-600">₹{product.highest_bid?.toFixed(2) || "0.00"}</p>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm text-gray-500 mb-2">Your Bid Amount</label>
                                    <div className="flex items-center border rounded-lg overflow-hidden">
                                        <span className="text-gray-500 bg-gray-100 px-3 py-2 border-r">₹</span>
                                        <input type="number" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} className="flex-1 px-3 py-2 text-gray-900 focus:outline-none" placeholder="Enter your bid" min="0" />
                                    </div>
                                    {walletBalance !== null && (
                                        <p className="text-xs text-gray-500 mt-1">Your wallet balance: ₹{Number(walletBalance).toFixed(2)}</p>
                                    )}
                                    {bidError && <p className="text-red-500 text-sm mt-2">{bidError}</p>}
                                    {bidSuccess && <p className="text-green-500 text-sm mt-2">{bidSuccess}</p>}
                                </div>
                                <button onClick={handlePlaceBid} className={`w-full px-4 py-2 rounded-lg font-semibold transition ${bidLoading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`} disabled={bidLoading}>
                                    {bidLoading ? (<div className="flex items-center justify-center"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Placing Bid...</div>) : ("Place Bid")}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Floating Chat Window */}
            {product && <ChatWindow />}
        </div>
    );
};

export default ProductDetails;