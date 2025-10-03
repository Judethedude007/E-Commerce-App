import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Clock, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Sellitems = () => {
  const navigate = useNavigate();
  const [userProducts, setUserProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [bidsByProduct, setBidsByProduct] = useState({});
  const [loadingBidsFor, setLoadingBidsFor] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [timeDrift, setTimeDrift] = useState(0); // server-now minus client-now
  const DISPLAY_TZ = 'Asia/Kolkata';
  // const [error, setError] = useState(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!username) return;
    const fetchUserProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8081/user-products/${username}`);
        setUserProducts(response.data);
        setLoading(false);
      } catch (e) {
        console.error("Error fetching user products:", e);
        setLoading(false);
      }
    };
    fetchUserProducts();
  }, [username]);

  // Fetch drift once on mount
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
        // ignore – fallback to client clock
      }
    };
    loadServerTime();
  }, []);

  // Tick every second using drift-corrected now
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now() + timeDrift), 1000);
    return () => clearInterval(t);
  }, [timeDrift]);

  // Auto-refresh recent bids for active bidding products every 12s until end time
  useEffect(() => {
    if (!userProducts || userProducts.length === 0) return;
    const interval = setInterval(() => {
      const current = Date.now();
      const active = userProducts.filter((p) => Number(p.listing_type) === 1 && p.bid_end_time && new Date(p.bid_end_time).getTime() > current);
      active.forEach((p) => {
        // Only refresh if we've already loaded once or just refresh anyway to keep it simple
        fetchRecentBids(p.id);
      });
    }, 12000);
    return () => clearInterval(interval);
  }, [userProducts]);

  // Treat MySQL-like timestamps without TZ as UTC for consistency
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
        const serverEndIso = res.data.bid_end_time;
        const serverEndIstStr = res.data.bid_end_time_ist;
        const clientEndIso = new Date(Date.now() + 10 * 60 * 1000).toISOString();
        const effectiveIso = serverEndIso || clientEndIso;
        const alertText = serverEndIstStr || formatInTZ(effectiveIso);
        alert(`Bidding will stop at ${alertText}`);
        // Immediately update local with a future end so countdown starts; prefer server end if provided
        setUserProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, bid_end_time: effectiveIso } : p)));
        // Also refresh products to stay authoritative
        try {
          const response = await axios.get(`http://localhost:8081/user-products/${username}`);
          setUserProducts(response.data);
        } catch {
          // ignore refresh failure; we already updated local state
        }
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
        setUserProducts(userProducts.filter(product => product.id !== productId));
      } catch (e) {
        alert("Failed to delete product: " + (e?.response?.data?.error || e.message || 'unknown error'));
      }
    }
  };

  const handleEdit = (productId) => {
    navigate(`/edit-product/${productId}`);
  };

  const handleCreateListing = () => {
    if (!username) {
      alert("You need to log in to create a listing.");
      navigate("/login");
    } else {
      navigate("/Create-listing");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Listings</h1>
          <button
            onClick={handleCreateListing}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-800 transition"
          >
            <Plus size={20} />
            <span>Create Listing</span>
          </button>
        </div>

        {loading ? (
          <p className="text-center py-8">Loading your listings...</p>
        ) : userProducts.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-lg shadow">
            <p className="text-xl font-semibold">No items listed</p>
            <p className="text-gray-500">Click &#39;Create Listing&#39; to list a new item.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userProducts.map((product) => (
              <div key={product.id} className="space-y-2">
                <div className="relative bg-white rounded-lg shadow p-4 flex">
                  <div className="w-24 h-24 mr-4 relative">
                  <img 
                    src={product.image_url} 
                    alt={product.title} 
                    className="w-full h-full object-cover rounded"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/placeholder-image.jpg"; 
                    }}
                  />
                  {product.sale_status === 1 && (
                    <span className="absolute bottom-0 left-0 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded">
                      Sold
                    </span>
                  )}
                  </div>
                  <div className="flex-1">
                  <h3 className="font-bold text-lg">{product.title}</h3>
                  <p className="text-green-600 font-semibold">
                    {Number(product.listing_type) === 1 && product.highest_bid
                      ? `₹${Number(product.highest_bid).toFixed(2)}`
                      : `₹${Number(product.price).toFixed(2)}`}
                  </p>
                  {Number(product.listing_type) === 1 && (
                    <div className="mt-1 text-sm">
                      <p className="text-yellow-700">Highest bid: {product.highest_bid ? `₹${Number(product.highest_bid).toFixed(2)}` : '—'}</p>
                      <p className="text-yellow-700">{product.bid_count ? `${product.bid_count} bid${product.bid_count > 1 ? 's' : ''}` : 'No bids yet'}</p>
                      {product.bid_end_time && (
                        <>
                          <p className="text-xs text-gray-500">Ends at: {(() => { const ts = parseUTCDateTime(product.bid_end_time); return Number.isFinite(ts) ? formatInTZ(ts) : '—'; })()}</p>
                          <p className={`text-xs font-medium ${formatTimeLeft(product.bid_end_time) === 'Ended' ? 'text-red-600' : 'text-green-600'}`}>Time left: {formatTimeLeft(product.bid_end_time)}</p>
                        </>
                      )}
                    </div>
                  )}
                  <p className="text-sm text-gray-500">{product.condition} • {product.location}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => handleEdit(product.id)}
                    className="p-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className="p-2 bg-red-50 text-red-700 rounded hover:bg-red-100"
                  >
                    <Trash2 size={18} />
                  </button>
                  </div>
                </div>
                {Number(product.listing_type) === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {/* Box 1: Recent bids */}
                    <div className="bg-white rounded-lg shadow p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-yellow-800 flex items-center gap-1">
                          <Users size={16} /> Recent bids
                        </h4>
                        <button
                          onClick={() => fetchRecentBids(product.id)}
                          className="text-xs px-2 py-1 bg-yellow-50 text-yellow-800 rounded hover:bg-yellow-100"
                        >
                          {loadingBidsFor === product.id ? 'Loading…' : 'Refresh'}
                        </button>
                      </div>
                      {!bidsByProduct[product.id] ? (
                        <p className="text-sm text-gray-500">Click Refresh to load bids.</p>
                      ) : bidsByProduct[product.id].length === 0 ? (
                        <p className="text-sm text-gray-500">No bids yet.</p>
                      ) : (
                        <ul className="text-sm text-gray-800 space-y-1 max-h-40 overflow-auto">
                          {bidsByProduct[product.id].map((b) => (
                            <li key={b.id} className="flex justify-between">
                              <span>₹{Number(b.amount).toFixed(2)}</span>
                              <span className="text-gray-600">{b.bidder || 'Unknown'}</span>
                              <span className="text-gray-600">{formatInTZ(b.created_at)}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    {/* Box 2: Stop bid in 10 minutes */}
                    <div className="bg-white rounded-lg shadow p-4">
                      <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-1">
                        <Clock size={16} /> Bidding controls
                      </h4>
                      <button
                        onClick={() => scheduleStopBidIn10(product.id)}
                        className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                      >
                        Stop bidding in 10 minutes
                      </button>
                      {product.bid_end_time && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">Ends at: {formatInTZ(product.bid_end_time)}</p>
                          <p className={`text-xs font-medium ${formatTimeLeft(product.bid_end_time) === 'Ended' ? 'text-red-600' : 'text-green-600'}`}>
                            Time left: {formatTimeLeft(product.bid_end_time)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sellitems;