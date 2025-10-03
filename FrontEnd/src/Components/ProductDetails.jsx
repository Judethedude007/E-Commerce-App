import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Heart, Mail, Phone, Star } from "lucide-react";

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [showRating, setShowRating] = useState(false); // Control the prompt to rate.
    const [selectedRating, setSelectedRating] = useState(0); // Track the selected rating.
    const [communicationType, setCommunicationType] = useState(null); // Track which is clicked
    const [existingRating, setExistingRating] = useState(0); // track rating

    // Bidding state
    const [bidAmount, setBidAmount] = useState("");
    const [bidLoading, setBidLoading] = useState(false);
    const [bidError, setBidError] = useState("");
    const [bidSuccess, setBidSuccess] = useState("");
    const [bids, setBids] = useState([]);
    const [bidsLoading, setBidsLoading] = useState(false);
    const [bidsError, setBidsError] = useState("");

    const username = localStorage.getItem("username");

    const isBiddingValue = (v) => (Number(v) === 1 || String(v).toLowerCase() === 'bidding' || String(v) === '1');

    // Live countdown timer state (used for bidding end time UI)
    const [nowTs, setNowTs] = useState(Date.now());
    const [timeDrift, setTimeDrift] = useState(0); // server-now minus client-now
    const DISPLAY_TZ = 'Asia/Kolkata';

    // Fetch server time once on mount to establish drift
    useEffect(() => {
        const loadServerTime = async () => {
            try {
                const res = await fetch('http://localhost:8081/time');
                const data = await res.json();
                const serverMs = Number(data?.db_utc_ms || data?.server_ms);
                if (Number.isFinite(serverMs)) {
                    setTimeDrift(serverMs - Date.now());
                }
            } catch {
                // ignore – fall back to client clock
            }
        };
        loadServerTime();
    }, []);

    // Tick every second to update countdowns using drift-corrected now
    useEffect(() => {
        const t = setInterval(() => setNowTs(Date.now() + timeDrift), 1000);
        return () => clearInterval(t);
    }, [timeDrift]);

    // Robust UTC parser for MySQL-like 'YYYY-MM-DD HH:mm:ss' or 'YYYY-MM-DDTHH:mm:ss'
    // Treats the timestamp as UTC when no timezone is present, then converts to local for display
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

    useEffect(() => {
        const fetchProductDetails = async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await axios.get(`http://localhost:8081/product/${id}`);
                setProduct(res.data);
                fetchUserRating(res.data.user_id) // new function
                // Seller details already included in this endpoint
                checkIfWishlisted(res.data.id);
                if (isBiddingValue(res.data.listing_type) && username && username === res.data.seller_name) {
                    fetchBids(res.data.id);
                }
            } catch {
                setError("Failed to load product details.");
            } finally {
                setLoading(false);
            }
        };

        fetchProductDetails();
        // Intentionally not adding fetchUserRating/checkIfWishlisted to deps to avoid refetch loops
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchUserRating = async (sellerId) => {
        if (!sellerId) return;
        try {
            const res = await axios.get(`http://localhost:8081/user-rating/${sellerId}/${username}`);
            //This should be some int from the data being returned as well.
            setExistingRating(res?.data.rating || 0);
        } catch (e) {
            console.error("Error fetching rating", e);
            setExistingRating(0);
        }
    }

    const fetchBids = async (productId) => {
        try {
            setBidsLoading(true);
            setBidsError("");
            const res = await axios.get(`http://localhost:8081/bid/${productId}/list`);
            if (res.data?.success) setBids(res.data.bids || []);
            else setBidsError(res.data?.message || "Failed to fetch bids");
        } catch (e) {
            setBidsError(e?.response?.data?.message || "Failed to fetch bids");
        } finally {
            setBidsLoading(false);
        }
    };

    // Refresh product details (to update highest_bid and bid_count from backend)
    const refreshProduct = async () => {
        try {
            const res = await axios.get(`http://localhost:8081/product/${id}`);
            setProduct(res.data);
        } catch (e) {
            console.error("Failed to refresh product:", e);
        }
    };

    // Bidding: place a bid
    const handlePlaceBid = async () => {
        if (!product) return;
        setBidError("");
        setBidSuccess("");

        const amount = Number(bidAmount);
        if (!Number.isFinite(amount) || amount <= 0) {
            setBidError("Please enter a valid amount.");
            return;
        }
        if (amount <= Math.max(Number(product.price) || 0, Number(product.highest_bid) || 0)) {
            setBidError(`Bid must be greater than ₹${Math.max(Number(product.price) || 0, Number(product.highest_bid) || 0).toFixed(2)}`);
            return;
        }
        if (!username) {
            setBidError("Please log in to place a bid.");
            return;
        }

        try {
            setBidLoading(true);
            const res = await axios.post(`http://localhost:8081/bid/${product.id}`, {
                username,
                bid: amount,
            });
            if (res.data?.success) {
                setBidSuccess("Bid placed successfully!");
                // Update local highest bid and count to avoid full reload
                setProduct((prev) => ({
                    ...prev,
                    highest_bid: Math.max(Number(prev?.highest_bid) || 0, amount),
                    bid_count: (Number(prev?.bid_count) || 0) + 1,
                }));
                setBidAmount("");
                // Also pull authoritative values from backend (covers concurrency)
                await refreshProduct();
                // If the current user is the seller, refresh recent bids list
                if (username && product && username === product.seller_name) {
                    fetchBids(product.id);
                }
            } else {
                setBidError(res.data?.message || "Failed to place bid.");
            }
        } catch (e) {
            setBidError(e?.response?.data?.message || "Failed to place bid.");
        } finally {
            setBidLoading(false);
        }
    };

    const checkIfWishlisted = async (productId) => {
        if (!username) return;
        try {
            const res = await axios.get(`http://localhost:8081/wishlist/${username}`);
            const wishlistedProducts = res.data.map((item) => ({
                ...item,
                isSold: item.sale_status === 1, // Add `isSold` flag based on sale_status
            }));
            setIsWishlisted(wishlistedProducts.some((item) => item.product_id === parseInt(productId)));
            setProduct((prev) => ({
                ...prev,
                isSold: wishlistedProducts.some((item) => item.product_id === parseInt(productId) && item.isSold),
            }));
        } catch (e) {
            console.error("Error checking wishlist status:", e);
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
        } catch {
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
            await axios.post("http://localhost:8081/rate-seller", {
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

    // Derived bidding timing (mirror Sellitems behavior using Date directly)
    const endTs = isBiddingValue(product?.listing_type) && product?.bid_end_time
        ? parseUTCDateTime(product.bid_end_time)
        : null;
    const timeLeftMs = Number.isFinite(endTs) ? endTs - nowTs : null;
    const hasEnded = Number.isFinite(endTs) ? timeLeftMs <= 0 : false;

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
                                        <span className="text-2xl font-bold text-green-600">
                                            {isBiddingValue(product.listing_type) && product.highest_bid
                                                ? `₹${Number(product.highest_bid).toFixed(2)}`
                                                : `₹${product.price?.toFixed(2)}`}
                                        </span>
                                        {product.condition && (
                                            <span className="px-2 py-1 text-sm bg-gray-100 text-gray-600 rounded-full">
                                                {product.condition}
                                            </span>
                                        )}
                                        {isBiddingValue(product.listing_type) && (
                                            <span className="px-2 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-full">
                                                {product.bid_count ? `${product.bid_count} bid${product.bid_count > 1 ? 's' : ''}` : 'No bids yet'}
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
                                    {/* Show bidding/factual type and starting price */}
                                    {isBiddingValue(product.listing_type) && (
                                        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded space-y-2">
                                            <p className="text-sm text-yellow-700 font-semibold">Bidding Product</p>
                                            <p className="text-sm text-yellow-800">Starting Price: ₹{product.price?.toFixed(2)}</p>
                                            <p className="text-sm text-yellow-800">
                                                Current highest bid: {product.highest_bid ? `₹${Number(product.highest_bid).toFixed(2)}` : '—'}
                                            </p>
                                            {product?.bid_end_time && (
                                                <div className="flex items-center gap-3 text-sm">
                                                    <span className="text-yellow-800">Ends at: {(() => {
                                                        const ts = parseUTCDateTime(product.bid_end_time);
                                                        return Number.isFinite(ts) ? formatInTZ(ts) : '—';
                                                    })()}</span>
                                                    <span className={`px-2 py-0.5 rounded ${hasEnded ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                        Time left: {Number.isFinite(endTs) ? formatTimeLeft(timeLeftMs) ?? '—' : '—'}
                                                    </span>
                                                </div>
                                            )}
                                            {!id.startsWith("fake-") && (
                                                <div className="pt-1">
                                                    <label className="block mb-1 font-medium">Place Your Bid</label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="number"
                                                            min={Math.max(Number(product.price) || 0, Number(product.highest_bid) || 0) + 1}
                                                            step="1"
                                                            value={bidAmount}
                                                            onChange={(e) => setBidAmount(e.target.value)}
                                                            className="border p-2 rounded-lg flex-grow"
                                                            placeholder={`Enter amount > ₹${Math.max(Number(product.price) || 0, Number(product.highest_bid) || 0).toFixed(2)}`}
                                                            disabled={bidLoading || hasEnded}
                                                        />
                                                        <button
                                                            onClick={handlePlaceBid}
                                                            className="bg-yellow-600 text-white px-4 py-2 rounded-lg shadow hover:bg-yellow-700 transition"
                                                            disabled={bidLoading || hasEnded}
                                                        >
                                                            {hasEnded ? "Bidding ended" : (bidLoading ? "Bidding..." : "Bid")}
                                                        </button>
                                                    </div>
                                                    {bidError && <p className="text-red-600 mt-2">{bidError}</p>}
                                                    {bidSuccess && <p className="text-green-600 mt-2">{bidSuccess}</p>}
                                                    {hasEnded && !bidError && (
                                                        <p className="text-red-600 mt-2">Bidding for this item has ended.</p>
                                                    )}
                                                </div>
                                            )}
                                            {username && username === product.seller_name && (
                                                <div className="mt-3 border-t border-yellow-200 pt-3">
                                                    <p className="text-sm font-semibold text-yellow-900">Recent bids (seller view)</p>
                                                    {bidsLoading ? (
                                                        <p className="text-sm text-yellow-800">Loading bids…</p>
                                                    ) : bidsError ? (
                                                        <p className="text-sm text-red-600">{bidsError}</p>
                                                    ) : bids.length === 0 ? (
                                                        <p className="text-sm text-yellow-800">No bids yet.</p>
                                                    ) : (
                                                        <ul className="text-sm text-yellow-900 space-y-1 max-h-40 overflow-auto">
                                                            {bids.map((b) => (
                                                                <li key={b.id} className="flex justify-between">
                                                                    <span>₹{Number(b.amount).toFixed(2)}</span>
                                                                    <span className="text-yellow-700">{b.bidder || 'Unknown'}</span>
                                                                    <span className="text-yellow-700">{formatInTZ(b.created_at)}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
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

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <button
                                        onClick={handleEmailSeller}
                                        className={`flex items-center justify-center px-4 py-3 border border-gray-200 rounded-lg text-gray-700 ${
                                            product?.isSold ? "cursor-not-allowed opacity-50" : "hover:bg-red-100 hover:text-red-600"
                                        } transition group`}
                                        disabled={product?.isSold}
                                    >
                                        <Mail className={`w-5 h-5 text-gray-400 ${product?.isSold ? "" : "group-hover:text-red-600"} mr-2`} />
                                        <span className="font-medium">{product?.isSold ? "Sold" : "Contact via Email"}</span>
                                    </button>
                                    <button
                                        onClick={handleWhatsAppSeller}
                                        className={`flex items-center justify-center px-4 py-3 border border-gray-200 rounded-lg text-gray-700 ${
                                            product?.isSold ? "cursor-not-allowed opacity-50" : "hover:bg-green-100 hover:text-green-600"
                                        } transition group`}
                                        disabled={product?.isSold}
                                    >
                                        <Phone className={`w-5 h-5 text-gray-400 ${product?.isSold ? "" : "group-hover:text-green-600"} mr-2`} />
                                        <span className="font-medium">{product?.isSold ? "Sold" : "Contact via WhatsApp"}</span>
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