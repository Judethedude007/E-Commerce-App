import express from "express";
import { productDB } from "./database.js";

const router = express.Router();

// Helper to get user ID from username or numeric ID
function resolveUserId(userOrId, cb) {
    if (!isNaN(userOrId)) return cb(null, parseInt(userOrId));
    productDB.query(
        "SELECT id FROM project.login WHERE username = ?",
        [userOrId],
        (err, result) => {
            if (err) return cb(err);
            if (!result.length) return cb(new Error("User not found"));
            cb(null, result[0].id);
        }
    );
}

// GET /chat/history/:productId/:user1/:user2
router.get("/history/:productId/:user1/:user2", (req, res) => {
    const { productId, user1, user2 } = req.params;

    resolveUserId(user1, (err, user1Id) => {
        if (err) return res.status(404).json({ error: "User1 not found" });
        resolveUserId(user2, (err2, user2Id) => {
            if (err2) return res.status(404).json({ error: "User2 not found" });

            const selectQuery = `
                SELECT 
                    message_id, product_id, sender_id, receiver_id, message_text, timestamp, is_read
                FROM chat_messages 
                WHERE product_id = ? 
                  AND (
                        (sender_id = ? AND receiver_id = ?) 
                     OR 
                        (sender_id = ? AND receiver_id = ?)
                  )
                ORDER BY timestamp ASC;
            `;
            const params = [productId, user1Id, user2Id, user2Id, user1Id];

            productDB.query(selectQuery, params, (err, results) => {
                if (err) {
                    console.error("Database error fetching chat history:", err);
                    return res.status(500).json({ error: "Failed to fetch chat history", details: err.message });
                }
                res.json(results);
            });
        });
    });
});

export default router;
