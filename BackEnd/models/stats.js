import express from "express";
import { getCollections } from "./database.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const collections = await getCollections();
        
        // Get total users (unique sellers)
        const totalUsers = await collections.products.distinct("user_id");
        
        // Get total items
        const totalItems = await collections.products.countDocuments();
        
        // Get total sold items
        const totalSold = await collections.products.countDocuments({ sale_status: 1 });
        
        // Get average rating and total ratings
        const ratingAgg = await collections.ratings
            .aggregate([
                { $group: {
                    _id: null,
                    avg_rating: { $avg: "$rating" },
                    total_ratings: { $sum: 1 }
                }}
            ])
            .toArray();
        
        const stats = {
            totalUsers: totalUsers.length,
            totalItems: totalItems,
            totalSold: totalSold,
            averageRating: ratingAgg.length > 0 ? Number(ratingAgg[0].avg_rating).toFixed(1) : "0.0",
            totalRatings: ratingAgg.length > 0 ? ratingAgg[0].total_ratings : 0
        };
        
        res.json(stats);
    } catch (error) {
        console.error("Error fetching stats:", error);
        res.status(500).json({ error: "Failed to fetch statistics" });
    }
});

export default router;