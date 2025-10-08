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
    const userIdString = localStorage.getItem("username");
    const senderId = userIdString ? parseInt(userIdString) : null; 
    const [messages, setMessages] = useState([]); 
    const [newMessage, setNewMessage] = useState(''); 
    const messagesEndRef = useRef(null); 

    // --- Bidding states ---
    const [bidAmount, setBidAmount] = useState("");
    const [bidLoading, setBidLoading] = useState(false);
    const [bidError, setBidError] = useState("");
    const [bidSuccess, setBidSuccess] = useState("");
    const [bids, setBids] = useState([]);
    const [bidsLoading, setBidsLoading] = useState(false);
    const [bidsError, setBidsError] = useState("");
    const username = localStorage.getItem("username");

    // Helper for listing type
    const isBiddingValue = (v) => (Number(v) === 1 || String(v).toLowerCase() === 'bidding' || String(v) === '1');

    // Live countdown timer
    const [nowTs, setNowTs] = useState(Date.now());
    const [timeDrift, setTimeDrift] = useState(0);
    const DISPLAY_TZ = 'Asia/Kolkata';

    useEffect(() => {
        const loadServerTime = async () => {
            try {
                const res = await fetch('http://localhost:8081/time');
                const data = await res.json();
                const serverMs = Number(data?.db_utc_ms || data?.server_ms);
                if (Number.isFinite(serverMs)) setTimeDrift(serverMs - Date.now());
            } catch {}
        };
        loadServerTime();
    }, []);

    useEffect(() => {
        const t = setInterval(() => setNowTs(Date.now() + timeDrift), 1000);
        return () => clearInterval(t);
    }, [timeDrift]);

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
                fetchUserRating(res.data.user_id);
                checkIfWishlisted(res.data.id);
                if(isBiddingValue(res.data.listing_type) && username && username === res.data.seller_name) {
                    fetchBids(res.data.id);
                }
            } catch {
                setError("Failed to load product details.");
            } finally { setLoading(false); }
        };
        fetchProductDetails();
    }, [id]);

    const fetchUserRating = async (sellerId) => {
        if (!sellerId) return;
        try {
            const res = await axios.get(`http://localhost:8081/user-rating/${sellerId}/${userIdString}`);
            setExistingRating(res?.data.rating || 0);
        } catch (e) { setExistingRating(0); }
    };

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

    const checkIfWishlisted = async (productId) => {
        if (!userIdString) return;
        try {
            const res = await axios.get(`http://localhost:8081/wishlist/${userIdString}`);
            const wishlistedProducts = res.data.map((item) => item.product_id);
            setIsWishlisted(wishlistedProducts.includes(parseInt(productId)));
        } catch (e) { console.error(e); }
    };

    // ...rest of functions (handleAddToWishlist, handleChatSeller, sendRatingToBackend, handlePlaceBid)...
    
    if (loading) return <p>Loading...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!product) return <p>Product not found</p>;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Main UI here */}
        </div>
    );
};

export default ProductDetails;
