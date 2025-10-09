import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Edit, Trash2, Plus, Clock, Users, X } from "lucide-react";
import axios from "axios";

const Sellitems = () => {
    const navigate = useNavigate();
    const [userProducts, setUserProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [unseenCounts, setUnseenCounts] = useState({});
    const [sellerId, setSellerId] = useState(null);
    const [username, setUsername] = useState("");
    const [bidsByProduct, setBidsByProduct] = useState({});
    const [loadingBidsFor, setLoadingBidsFor] = useState(null);
    const [now, setNow] = useState(Date.now());
    const [timeDrift, setTimeDrift] = useState(0);
    const [customExpiry, setCustomExpiry] = useState({});
    const [finalizeLoading, setFinalizeLoading] = useState(null);
    const [showBidModal, setShowBidModal] = useState(false);
    const [bidModalProductId, setBidModalProductId] = useState(null);
    const DISPLAY_TZ = "Asia/Kolkata";

    useEffect(() => {
        const storedUsername = localStorage.getItem("username");
        if (storedUsername) {
            setUsername(storedUsername);
        } else {
            setLoading(false);
            // Optional: Redirect to login if no user is found
            // navigate("/login");
        }
    }, []);

    // Fetch userId (sellerId) based on username
    useEffect(() => {
        if (!username) return;
        const fetchUserId = async () => {
            try {
                const res = await axios.get(`http://localhost:8081/get-userid/${username}`);
                setSellerId(res.data.userId);
            } catch {
                setError("Failed to fetch user ID.");
            }
        };
        fetchUserId();
    }, [username]);

    // Fetch user's products once the sellerId is available
    useEffect(() => {
        if (!sellerId) return;
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`http://localhost:8081/user-products/${username}`);
                setUserProducts(res.data);
            } catch (err) {
                setError("Failed to fetch your products.");
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [username, sellerId]);

    // Fetch unseen message counts for all products
    useEffect(() => {
        if (!sellerId) return;
        const fetchUnseen = async () => {
            try {
                const res = await axios.get(`http://localhost:8081/unseen-msg-count/${sellerId}`);
                setUnseenCounts(res.data);
            } catch {
                setUnseenCounts({});
            }
        };
        fetchUnseen();
    }, [sellerId]);

    // Synchronize with server time to get an accurate countdown
    useEffect(() => {
        const loadServerTime = async () => {
            try {
                const res = await fetch("http://localhost:8081/time");
                const data = await res.json();
                const serverMs = Number(data?.db_utc_ms || data?.server_ms);
                if (Number.isFinite(serverMs)) {
                    setTimeDrift(serverMs - Date.now());
                }
            } catch (e) {
                console.error("Could not fetch server time", e);
            }
        };
        loadServerTime();
    }, []);

    // Update the 'now' state every second for the countdown timer
    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now() + timeDrift), 1000);
        return () => clearInterval(timer);
    }, [timeDrift]);


    // Helper function to parse UTC date strings
    const parseUTCDateTime = (val) => {
        if (!val) return NaN;
        const ms = Date.parse(String(val));
        return Number.isFinite(ms) ? ms : NaN;
    };

    // Helper function to format the remaining time
    const formatTimeLeft = (end) => {
        if (!end) return null;
        const endMs = parseUTCDateTime(end);
        if (!Number.isFinite(endMs)) return null;
        const diff = endMs - now;
        if (diff <= 0) return "Ended";

        const s = Math.floor(diff / 1000);
        const d = Math.floor(s / 86400);
        const h = Math.floor((s % 86400) / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;

        if (d > 0) return `${d}d ${h}h ${m}m`;
        if (h > 0) return `${h}h ${m}m ${sec}s`;
        if (m > 0) return `${m}m ${sec}s`;
        return `${sec}s`;
    };

    // Helper function to format a timestamp into a readable IST string
    const formatInTZ = (msOrIso, tz = DISPLAY_TZ) => {
        const ms = typeof msOrIso === "number" ? msOrIso : Date.parse(String(msOrIso));
        if (!Number.isFinite(ms)) return "—";
        return new Intl.DateTimeFormat("en-IN", { timeZone: tz, dateStyle: 'medium', timeStyle: 'short' }).format(new Date(ms));
    };

    const fetchRecentBids = async (productId) => {
        try {
            setLoadingBidsFor(productId);
            const res = await axios.get(`http://localhost:8081/bid/${productId}/list`);
            if (res.data?.success) {
                setBidsByProduct((prev) => ({ ...prev, [productId]: res.data.bids || [] }));
            }
        } catch (e) {
            console.error("Failed to fetch recent bids", e);
        } finally {
            setLoadingBidsFor(null);
        }
    };

    const scheduleStopBidIn10 = async (productId) => {
        try {
            const res = await axios.post(`http://localhost:8081/bid/${productId}/stop-in-10`, { username });
            if (res.data?.success) {
                const effectiveIso = res.data.bid_end_time;
                alert(`Bidding will stop at ${formatInTZ(effectiveIso)}`);
                setUserProducts((prev) =>
                    prev.map((p) => (p.id === productId ? { ...p, bid_end_time: effectiveIso } : p))
                );
            } else {
                alert(res.data?.message || "Failed to schedule bid end");
            }
        } catch (e) {
            alert(e?.response?.data?.message || "Failed to schedule bid end");
        }
    };

    const handleDelete = async (productId) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await axios.delete(`http://localhost:8081/delete-item/${productId}`);
                setUserProducts(userProducts.filter((product) => product.id !== productId));
            } catch (e) {
                alert("Failed to delete product: " + (e?.response?.data?.error || "unknown error"));
            }
        }
    };

    const handleEdit = (productId) => navigate(`/edit-product/${productId}`);

    const handleCreateListing = () => {
        if (!username) {
            alert("You need to log in to create a listing.");
            navigate("/login");
        } else {
            navigate("/Create-listing");
        }
    };

    const handleSetExpiry = async (productId) => {
        const expiry = customExpiry[productId];
        if (!expiry) {
            alert("Please select an expiry date and time.");
            return;
        }
        try {
            const res = await axios.post(`http://localhost:8081/bid/${productId}/set-expiry`, {
                username,
                expiry,
            });
            if (res.data?.success) {
                alert("Expiry time has been set!");
                setUserProducts((prev) =>
                    prev.map((p) => (p.id === productId ? { ...p, bid_end_time: expiry } : p))
                );
            } else {
                alert(res.data?.message || "Failed to set expiry");
            }
        } catch (e) {
            alert(e?.response?.data?.message || "Failed to set expiry");
        }
    };

    const handleFinalizeBid = async (productId) => {
        if (!window.confirm("Are you sure you want to finalize bidding? This will transfer the winning amount to your wallet and mark the item as sold.")) return;
        setFinalizeLoading(productId);
        try {
            const res = await axios.post(`http://localhost:8081/bid/${productId}/finalize`, { username });
            if (res.data?.success) {
                alert("Bidding finalized! The amount has been transferred to your wallet.");
                setUserProducts((prev) =>
                    prev.map((p) => (p.id === productId ? { ...p, sale_status: 1, bid_end_time: new Date().toISOString() } : p))
                );
            } else {
                alert(res.data?.message || "Failed to finalize bidding");
            }
        } catch (e) {
            alert(e?.response?.data?.message || "Failed to finalize bidding");
        } finally {
            setFinalizeLoading(null);
        }
    };

    // Modal Controls
    const openBidModal = (productId) => {
        setBidModalProductId(productId);
        setShowBidModal(true);
        fetchRecentBids(productId);
    };

    const closeBidModal = () => {
        setShowBidModal(false);
        setBidModalProductId(null);
    };

    // Find the product to display in the modal
    const modalProduct = userProducts.find((p) => p.id === bidModalProductId);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
            <div className="w-full max-w-5xl">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">My Listings</h1>
                    <button onClick={handleCreateListing} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition-colors">
                        <Plus size={20} />
                        <span>Create Listing</span>
                    </button>
                </div>

                {loading ? (<p className="text-center py-8">Loading your listings...</p>)
                : error ? (<p className="text-center text-red-500">{error}</p>)
                : userProducts.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-lg shadow">
                        <p className="text-xl font-semibold text-gray-700">You haven't listed any items yet.</p>
                        <p className="text-gray-500 mt-2">Click 'Create Listing' to get started!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {userProducts.map((product) => (
                            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden transition hover:shadow-xl">
                                <div className="p-4 flex">
                                    <div className="w-28 h-28 mr-4 relative flex-shrink-0">
                                        <img src={product.image_url} alt={product.title} className="w-full h-full object-cover rounded-md" />
                                        {product.sale_status === 1 && (
                                            <span className="absolute bottom-1 left-1 bg-red-500 text-white px-2 py-0.5 text-xs font-bold rounded">Sold</span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg text-gray-900">{product.title}</h3>
                                        <p className="text-green-600 font-semibold text-xl">
                                            {Number(product.listing_type) === 1 && product.highest_bid ? `₹${Number(product.highest_bid).toFixed(2)}` : `₹${Number(product.price).toFixed(2)}`}
                                        </p>
                                        {Number(product.listing_type) === 1 && (
                                            <div className="mt-1 text-sm">
                                                <p className="text-gray-600">Highest bid: <span className="font-semibold text-yellow-800">{product.highest_bid ? `₹${Number(product.highest_bid).toFixed(2)}` : "—"}</span></p>
                                                <p className="text-gray-600">{product.bid_count ? `${product.bid_count} bid${product.bid_count > 1 ? "s" : ""}` : "No bids yet"}</p>
                                                {product.bid_end_time && (<p className={`text-xs font-medium ${formatTimeLeft(product.bid_end_time) === "Ended" ? "text-red-600" : "text-blue-600"}`}>Time left: {formatTimeLeft(product.bid_end_time)}</p>)}
                                            </div>
                                        )}
                                        <p className="text-sm text-gray-500 mt-1">{product.condition} • {product.location}</p>
                                    </div>
                                    <div className="flex flex-col gap-2 ml-2">
                                        <button onClick={() => handleEdit(product.id)} className="p-2 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100" title="Edit"><Edit size={18} /></button>
                                        <button onClick={() => handleDelete(product.id)} className="p-2 bg-red-50 text-red-700 rounded-full hover:bg-red-100" title="Delete"><Trash2 size={18} /></button>
                                        <button onClick={() => unseenCounts[product.id] > 0 ? navigate(`/productmsg/${product.id}`) : alert("No new messages for this product.")} className="relative p-2 bg-yellow-50 text-yellow-700 rounded-full hover:bg-yellow-100" title="View Messages">
                                            <Bell size={18} />
                                            {unseenCounts[product.id] > 0 && (<span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">{unseenCounts[product.id]}</span>)}
                                        </button>
                                        {Number(product.listing_type) === 1 && (<button onClick={() => openBidModal(product.id)} className="p-2 bg-purple-50 text-purple-700 rounded-full hover:bg-purple-100" title="View Bids"><Users size={18} /></button>)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* --- Bid Modal --- */}
                {/* FIX: Modal is defined only once outside the map loop for better performance */}
                {showBidModal && modalProduct && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full p-6 relative animate-fade-in-up">
                            <button onClick={closeBidModal} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition-colors"><X size={24} /></button>
                            <h3 className="text-2xl font-bold mb-2 text-gray-900">{modalProduct.title} - Bidding Controls</h3>
                            
                            <div className="mb-4 bg-gray-50 p-3 rounded-md">
                                {modalProduct.bid_end_time && (
                                     <p className={`text-center font-semibold mb-2 ${formatTimeLeft(modalProduct.bid_end_time) === "Ended" ? "text-red-600" : "text-blue-600"}`}>
                                        {formatTimeLeft(modalProduct.bid_end_time)} left
                                     </p>
                                )}
                                <p className="text-gray-600 text-sm">Ends at: {formatInTZ(modalProduct.bid_end_time)}</p>
                            </div>

                            <div className="mb-4">
                                <h4 className="font-semibold text-gray-800 flex items-center gap-2 mb-2"><Users size={18} /> Recent Bids</h4>
                                {loadingBidsFor === modalProduct.id ? (<p className="text-sm text-gray-500">Loading Bids...</p>)
                                : !bidsByProduct[modalProduct.id] || bidsByProduct[modalProduct.id].length === 0 ? (<p className="text-sm text-gray-500">No bids have been placed yet.</p>)
                                : (
                                    <ul className="text-sm text-gray-800 space-y-1 max-h-40 overflow-auto border rounded-md p-2 bg-gray-50">
                                        {bidsByProduct[modalProduct.id].map((b) => (
                                            <li key={b.id} className="flex justify-between items-center p-1 rounded hover:bg-gray-100">
                                                <span className="font-semibold">₹{Number(b.amount).toFixed(2)}</span>
                                                <span className="text-gray-600">{b.bidder || "Unknown"}</span>
                                                <span className="text-gray-500 text-xs">{formatInTZ(b.created_at)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                <button onClick={() => fetchRecentBids(modalProduct.id)} className="mt-2 text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">Refresh Bids</button>
                            </div>
                            
                            <div className="border-t pt-4">
                                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2"><Clock size={18} /> Actions</h4>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <button onClick={() => scheduleStopBidIn10(modalProduct.id)} className="w-full px-3 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition">Stop in 10 mins</button>
                                    <button onClick={() => handleFinalizeBid(modalProduct.id)} className={`w-full px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed`} disabled={finalizeLoading === modalProduct.id || modalProduct.sale_status === 1}>
                                        {finalizeLoading === modalProduct.id ? "Finalizing..." : modalProduct.sale_status === 1 ? "Finalized" : "Finalize & Sell"}
                                    </button>
                                </div>
                                <div className="mt-3 text-sm">
                                    <label className="block text-xs text-gray-500 mb-1">Set custom expiry time:</label>
                                    <div className="flex gap-2">
                                        <input type="datetime-local" value={customExpiry[modalProduct.id] || ""} onChange={(e) => setCustomExpiry((prev) => ({ ...prev, [modalProduct.id]: e.target.value }))} className="border px-2 py-1 rounded-md w-full text-sm"/>
                                        <button onClick={() => handleSetExpiry(modalProduct.id)} className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs">Set</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sellitems;
