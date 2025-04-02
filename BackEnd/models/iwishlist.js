import express from "express";
import { productDB } from "./database.js";

const router = express.Router();


router.post("/", (req, res) => {
    const { username, product_id } = req.body;

    if (!username || !product_id) {
        return res.status(400).json({ error: "Username and Product ID are required" });
    }

    // Fetch user ID from username
    productDB.query(
        "SELECT id FROM project.login WHERE username = ?",
        [username],
        (err, result) => {
            if (err) {
                console.error("Error fetching user ID:", err);
                return res.status(500).json({ error: "Database error", details: err });
            }

            if (result.length === 0) {
                return res.status(404).json({ error: "User not found" });
            }

            const userId = result[0].id;

            // Insert wishlist entry
            productDB.query(
                "INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)",
                [userId, product_id],
                (err, result) => {
                    if (err) {
                        console.error("Error adding to wishlist:", err);
                        return res.status(500).json({ error: "Failed to add to wishlist", details: err });
                    }
                    return res.json({ message: "Item added to wishlist" });
                }
            );
        }
    );
});

export default router;