import express from "express";
import { productDB } from "./database.js";

const router = express.Router();

// GET /unseen-msg-count/:sellerId
router.get("/:sellerId", (req, res) => {
    const { sellerId } = req.params;
    // 1. Get all product IDs for this seller
    productDB.query(
        "SELECT id FROM project.products WHERE user_id = ?",
        [sellerId],
        (err, products) => {
            if (err) return res.status(500).json({ error: "Failed to fetch products" });
            if (!products.length) return res.json({});
            const productIds = products.map(p => p.id);

            // 2. If there are no products, return empty object
            if (productIds.length === 0) return res.json({});

            // 3. Count unseen messages for each product
            productDB.query(
                `SELECT product_id, COUNT(*) AS unseen_count
                 FROM project.chat_messages
                 WHERE receiver_id = ?
                   AND is_read = 0
                   AND product_id IN (${productIds.map(() => '?').join(',')})
                 GROUP BY product_id`,
                [sellerId, ...productIds],
                (err2, rows) => {
                    if (err2) return res.status(500).json({ error: "Failed to fetch unseen counts" });
                    // 4. Map: { productId: unseenCount }
                    const result = {};
                    rows.forEach(r => { result[r.product_id] = r.unseen_count; });
                    res.json(result);
                }
            );
        }
    );
});

export default router;