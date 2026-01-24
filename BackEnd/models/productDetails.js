import express from "express";
import { productDB } from "./database.js";

const router = express.Router();

// Convert MySQL DATETIME to ISO UTC string
const mysqlToIsoUtc = (val) => {
    if (!val) return null;
    const s = String(val).trim();
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})(?:\.\d+)?$/);
    if (m) {
        const [, y, mo, d, h, mi, se] = m;
        const ms = Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(se));
        return new Date(ms).toISOString();
    }
    const ms = Date.parse(s);
    return Number.isFinite(ms) ? new Date(ms).toISOString() : null;
};

// Produce human-friendly IST string from ISO UTC
const toIstStringFromIso = (iso) => {
    if (!iso) return null;
    const ms = Date.parse(String(iso));
    if (!Number.isFinite(ms)) return null;
    const istMs = ms + 330 * 60 * 1000; // +05:30
    const d = new Date(istMs);
    const pad = (n) => String(n).padStart(2, '0');
    const yyyy = d.getUTCFullYear();
    const mm = pad(d.getUTCMonth() + 1);
    const dd = pad(d.getUTCDate());
    const HH = pad(d.getUTCHours());
    const MM = pad(d.getUTCMinutes());
    const SS = pad(d.getUTCSeconds());
    return `${yyyy}-${mm}-${dd} ${HH}:${MM}:${SS}`;
};

router.get("/:id", async (req, res) => {
    const { id } = req.params;
    console.log("Fetching product details for ID:", id);

    try {
        // Get product details with seller information from login table
        const productQuery = `
            SELECT p.*, l.username as seller_name, l.email as seller_email
            FROM products p
            LEFT JOIN login l ON p.user_id = l.id
            WHERE p.id = ?`;

        console.log("Executing product query:", productQuery, "with ID:", id);
        
        productDB.query(productQuery, [id], (err, productResults) => {
            if (err) {
                console.error("Product query error details:", {
                    code: err.code,
                    errno: err.errno,
                    sqlState: err.sqlState,
                    sqlMessage: err.sqlMessage,
                    sql: err.sql
                });
                return res.status(500).json({ 
                    message: "Error fetching product details",
                    error: err.message,
                    details: {
                        code: err.code,
                        sqlState: err.sqlState
                    }
                });
            }

            if (!productResults || productResults.length === 0) {
                console.log("No product found with ID:", id);
                return res.status(404).json({ message: "Product not found" });
            }

            const product = productResults[0];
            console.log("Found product:", product);

            // Then get the ratings if they exist
            const ratingQuery = `
                SELECT 
                    COALESCE(AVG(rating), 0) as avg_rating,
                    COUNT(*) as total_ratings
                FROM ratings
                WHERE seller_id = ?`;

            console.log("Executing rating query:", ratingQuery, "with seller_id:", product.user_id);

            productDB.query(ratingQuery, [product.user_id], (ratingErr, ratingResults) => {
                if (ratingErr) {
                    console.error("Rating query error details:", {
                        code: ratingErr.code,
                        errno: ratingErr.errno,
                        sqlState: ratingErr.sqlState,
                        sqlMessage: ratingErr.sqlMessage,
                        sql: ratingErr.sql
                    });

                    // If ratings table doesn't exist, just return the product without ratings
                    if (ratingErr.code === 'ER_NO_SUCH_TABLE') {
                        console.log("Ratings table does not exist, returning product without ratings");
                        const response = {
                            ...product,
                            seller_rating: "0.0",
                            total_ratings: 0,
                            seller_name: product.seller_name || "Unknown Seller",
                            seller_email: product.seller_email || "Not Available"
                        };
                        return res.json(response);
                    }
                    
                    // For any other error, still return the product with default ratings
                    const response = {
                        ...product,
                        seller_rating: "0.0",
                        total_ratings: 0,
                        seller_name: product.seller_name || "Unknown Seller",
                        seller_email: product.seller_email || "Not Available"
                    };
                    return res.json(response);
                }

                // If product is bidding, also include highest bid and bid count
                const finalizeAndSend = (extra = {}) => {
                    const response = {
                        ...product,
                        seller_rating: ratingResults ? Number(ratingResults[0]?.avg_rating || 0).toFixed(1) : "0.0",
                        total_ratings: ratingResults ? Number(ratingResults[0]?.total_ratings || 0) : 0,
                        seller_name: product.seller_name || "Unknown Seller",
                        seller_email: product.seller_email || "Not Available",
                        ...extra
                    };
                    console.log("Sending response:", response);
                    res.json(response);
                };

                const lt = product.listing_type;
                const isBidding = Number(lt) === 1 || String(lt).toLowerCase() === 'bidding' || String(lt) === '1';
                if (isBidding) {
                    const bidAgg = `SELECT MAX(amount) as highest_bid, COUNT(*) as bid_count FROM bids WHERE product_id = ?`;
                    productDB.query(bidAgg, [product.id], (berr, bres) => {
                        if (berr) {
                            console.error("Bid aggregation error:", berr);
                            return finalizeAndSend({ highest_bid: null, bid_count: 0 });
                        }
                        const highest_bid = bres?.[0]?.highest_bid ? Number(bres[0].highest_bid) : null;
                        const bid_count = bres?.[0]?.bid_count ? Number(bres[0].bid_count) : 0;
                        const bid_end_time = mysqlToIsoUtc(product.bid_end_time);
                        const bid_end_time_ist = toIstStringFromIso(bid_end_time);
                        finalizeAndSend({ highest_bid, bid_count, bid_end_time, bid_end_time_ist });
                    });
                } else {
                    finalizeAndSend();
                }
            });
        });
    } catch (error) {
        console.error("Unexpected error details:", {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({ 
            message: "Unexpected server error",
            error: error.message,
            details: {
                name: error.name
            }
        });
    }
});

export default router;
