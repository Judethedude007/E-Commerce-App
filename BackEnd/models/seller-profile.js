import express from "express";
import { ObjectId } from "mongodb";
import { getCollections } from "./database.js";

const router = express.Router();

// 🛒 Fetch Seller Profile with Ratings
router.get("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const collections = await getCollections();
        
        // Convert id string to ObjectId
        const sellerObjectId = new ObjectId(id);
        
        // Get seller information
        const seller = await collections.users.findOne(
            { _id: sellerObjectId },
            { projection: { username: 1, email: 1 } }
        );
        
        if (!seller) {
            return res.status(404).json({ error: "Seller not found" });
        }
        
        // Get rating information
        const ratingAgg = await collections.ratings
            .aggregate([
                { $match: { seller_id: sellerObjectId } },
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