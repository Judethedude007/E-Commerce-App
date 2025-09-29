import express from "express";
import { productDB } from "./database.js";
const router = express.Router();

// GET /product-buyers/:productId
router.get("/:productId", (req, res) => {
    const { productId } = req.params;
    // Step 1: Get the seller's user_id for this product
    productDB.query(
        "SELECT user_id FROM project.products WHERE id = ? LIMIT 1",
        [productId],
        (err, productRows) => {
            if (err || !productRows.length) {
                console.error("Failed to fetch product info:", err);
                return res.status(500).json({ error: "Failed to fetch product info" });
            }
            const sellerId = productRows[0].user_id;
            // Step 2: Get all unique buyers (senders) except the seller
            productDB.query(
                `SELECT DISTINCT l.id AS user_id, l.username, l.email
                 FROM project.chat_messages m
                 JOIN project.login l ON m.sender_id = l.id
                 WHERE m.product_id = ? AND m.sender_id != ?`,
                [productId, sellerId],
                (err2, buyers) => {
                    if (err2) {
                        console.error("Failed to fetch buyers:", err2); // <-- This will print the real SQL error
                        return res.status(500).json({ error: "Failed to fetch buyers" });
                    }
                    res.json(buyers);
                }
            );
        }
    );
});

export default router;