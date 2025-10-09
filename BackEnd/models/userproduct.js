
import express from "express";
import {productDB} from "./database.js";


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




router.get('/:username', (req, res) => {
    const username = req.params.username;
    console.log("Fetching user ID for:", username);

    productDB.query(
        "SELECT id FROM project.login WHERE username = ?",
        [username],
        (err, result) => {
            if (err) {
                console.error("Error fetching user ID:", err);
                return res.status(500).json({ error: 'Database error', details: err });
            }

            if (result.length === 0) {
                console.log("User not found:", username);
                return res.status(404).json({ error: "User not found" });
            }

            const userId = result[0].id;
            console.log("User ID found:", userId);

            const query = `
                SELECT p.*, agg.highest_bid, agg.bid_count
                FROM products p
                LEFT JOIN (
                    SELECT product_id, MAX(amount) AS highest_bid, COUNT(*) AS bid_count
                    FROM bids
                    GROUP BY product_id
                ) agg ON agg.product_id = p.id
                WHERE p.user_id = ?
            `;
            productDB.query(
                query,
                [userId],
                (err, data) => {
                    if (err) {
                        console.error("Error fetching items:", err);
                        return res.status(500).json({ error: 'Failed to fetch user items', details: err });
                    }

                    // Normalize bid_end_time to ISO string when present for consistency
                    const normalized = (data || []).map((p) => ({
                        ...p,
                        bid_end_time: mysqlToIsoUtc(p.bid_end_time),
                    }));

                    console.log("Query Result:", normalized);
                    return res.json(normalized);
                }
            );
        }
    );
});



export default router;