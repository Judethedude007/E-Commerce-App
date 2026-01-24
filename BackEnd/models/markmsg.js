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

// POST /mark-read
router.post("/", (req, res) => {
    const { userId, productId } = req.body;
    
    if (!userId || !productId) {
        return res.status(400).json({ error: "User ID and Product ID are required." });
    }

    resolveUserId(userId, (err, userIdNum) => {
        if (err) return res.status(404).json({ error: "User not found" });

        const updateQuery = `
            UPDATE chat_messages 
            SET is_read = TRUE 
            WHERE receiver_id = ? AND product_id = ? AND is_read = FALSE;
        `;
        
        productDB.query(updateQuery, [userIdNum, productId], (err, result) => {
            if (err) {
                console.error("Database error marking read:", err);
                return res.status(500).json({ error: "Failed to mark messages as read", details: err.message });
            }
            res.json({ message: `Successfully marked ${result.affectedRows} message(s) as read.` });
        });
    });
});

export default router;
