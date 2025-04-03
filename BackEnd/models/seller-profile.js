import express from "express";
import { ObjectId } from "mongodb";
import { getCollections } from "./database.js";

const router = express.Router();

// 🛒 Fetch Seller Profile with Ratings
router.get("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const collections = await getCollections();
        
        // First try to find by username
        let seller = await collections.users.findOne(
            { username: id },
            { projection: { username: 1, email: 1, _id: 1 } }
        );
        
        // If not found by username, try numeric ID
        if (!seller) {
            seller = await collections.users.findOne(
                { id: parseInt(id) },
                { projection: { username: 1, email: 1, _id: 1 } }
            );
        }
        
        // If still not found, try ObjectId
        if (!seller) {
            try {
                const sellerObjectId = new ObjectId(id);
                seller = await collections.users.findOne(
                    { _id: sellerObjectId },
                    { projection: { username: 1, email: 1, _id: 1 } }
                );
            } catch (error) {
                console.error("Invalid ObjectId format:", error);
            }
        }
        
        if (!seller) {
            return res.status(404).json({ error: "Seller not found" });
        }
        
        // Get rating information
        const ratingAgg = await collections.ratings
            .aggregate([
                { $match: { seller_id: seller._id } },
                { $group: {
                    _id: null,
                    average_rating: { $avg: "$rating" },
                    total_ratings: { $sum: 1 }
                }}
            ])
            .toArray();
        
        // Combine seller details & ratings
        res.json({
            seller_name: seller.username,
            seller_email: seller.email,
            average_rating: ratingAgg.length > 0 ? ratingAgg[0].average_rating.toFixed(1) : "0.0",
            total_ratings: ratingAgg.length > 0 ? ratingAgg[0].total_ratings : 0
        });
    } catch (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error", details: err.message });
    }
});

export default router;