import express from "express";
import { productDB } from "./database.js";

const router = express.Router();


router.post("/", (req, res) => {
    const { sellerId, rating, username } = req.body;

    if (!sellerId || !rating || !username) {
        return res.status(400).json({ error: "Seller ID, rating, and username are required" });
    }

    
    const getUserIdQuery = "SELECT id FROM login WHERE username = ?";
    productDB.query(getUserIdQuery, [username], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database error", details: err });
        }

        if (results.length === 0) {
            return res.status(400).json({ error: "User not found" });
        }

        const ratedBy = results[0].id;

        // Check if user has already rated this seller
        const checkRatingQuery = "SELECT * FROM ratings WHERE seller_id = ? AND rated_by = ?";
        productDB.query(checkRatingQuery, [sellerId, ratedBy], (err, existingRatings) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Database error", details: err });
            }

            if (existingRatings.length > 0) {
                // Update existing rating
                const updateQuery = "UPDATE ratings SET rating = ?, created_at = CURRENT_TIMESTAMP WHERE seller_id = ? AND rated_by = ?";
                productDB.query(updateQuery, [rating, sellerId, ratedBy], (err, result) => {
                    if (err) {
                        console.error("Database error:", err);
                        return res.status(500).json({ error: "Failed to update rating", details: err });
                    }
                    return res.json({ message: "Rating updated successfully!" });
                });
            } else {
                // Insert new rating
                const insertQuery = "INSERT INTO ratings (seller_id, rated_by, rating) VALUES (?, ?, ?)";
                productDB.query(insertQuery, [sellerId, ratedBy, rating], (err, result) => {
                    if (err) {
                        console.error("Database error:", err);
                        return res.status(500).json({ error: "Failed to add rating", details: err });
                    }
                    return res.json({ message: "Rating added successfully!" });
                });
            }
        });
    });
});

export default router;
