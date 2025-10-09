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

// POST /send-message
router.post("/", (req, res) => {
    const { product_id, sender_id, receiver_id, message_text } = req.body;

    if (!product_id || !sender_id || !receiver_id || !message_text) {
        return res.status(400).json({ error: "Missing required fields for message." });
    }

    // Resolve both sender and receiver IDs
    resolveUserId(sender_id, (err, senderIdNum) => {
        if (err) return res.status(404).json({ error: "Sender not found" });
        resolveUserId(receiver_id, (err2, receiverIdNum) => {
            if (err2) return res.status(404).json({ error: "Receiver not found" });

            const insertQuery = `
                INSERT INTO chat_messages 
                    (product_id, sender_id, receiver_id, message_text, is_read) 
                VALUES (?, ?, ?, ?, FALSE);
            `;

            productDB.query(insertQuery, [product_id, senderIdNum, receiverIdNum, message_text], (err, result) => {
                if (err) {
                    console.error("Database error during message insert:", err);
                    return res.status(500).json({ error: "Failed to send message", details: err.message });
                }
                return res.status(201).json({ 
                    message: "Message sent successfully.", 
                    message_id: result.insertId,
                    timestamp: new Date().toISOString() 
                });
            });
        });
    });
});

export default router;
