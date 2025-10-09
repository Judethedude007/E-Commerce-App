import express from "express";
import { productDB } from "./database.js";

const router = express.Router();

// Get the rating given by a user to a seller
router.get("/:sellerId/:username", (req, res) => {
    const { sellerId, username } = req.params;
    const getUserIdQuery = "SELECT id FROM login WHERE username = ?";
    productDB.query(getUserIdQuery, [username], (err, results) => {
        if (err) return res.status(500).json({ error: "Database error", details: err });
        if (results.length === 0) return res.status(404).json({ error: "User not found" });

        const ratedBy = results[0].id;
        const getRatingQuery = "SELECT rating FROM ratings WHERE seller_id = ? AND rated_by = ?";
        productDB.query(getRatingQuery, [sellerId, ratedBy], (err, ratingResults) => {
            if (err) return res.status(500).json({ error: "Database error", details: err });
            if (ratingResults.length === 0) return res.json({ rating: 0 }); // No rating yet
            return res.json({ rating: ratingResults[0].rating });
        });
    });
});

export default router;