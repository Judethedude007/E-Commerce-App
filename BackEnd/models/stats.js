import express from "express";
import { productDB } from "./database.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        // Get total users (unique sellers)
        const userQuery = "SELECT COUNT(DISTINCT user_id) as total_users FROM products";
        
        // Get total items and sold items
        const itemQuery = `
            SELECT 
                COUNT(*) as total_items,
                SUM(CASE WHEN sale_status = 1 THEN 1 ELSE 0 END) as total_sold
            FROM products
        `;
        
        // Get average rating
        const ratingQuery = `
            SELECT 
                COALESCE(ROUND(AVG(rating), 1), 0) as avg_rating,
                COUNT(*) as total_ratings
            FROM ratings
        `;

        // Execute queries
        productDB.query(userQuery, (userErr, userResults) => {
            if (userErr) {
                console.error("Error fetching user count:", userErr);
                return res.status(500).json({ error: "Failed to fetch statistics" });
            }

            productDB.query(itemQuery, (itemErr, itemResults) => {
                if (itemErr) {
                    console.error("Error fetching item stats:", itemErr);
                    return res.status(500).json({ error: "Failed to fetch statistics" });
                }

                productDB.query(ratingQuery, (ratingErr, ratingResults) => {
                    // Even if rating query fails, we'll still return other stats
                    const stats = {
                        totalUsers: userResults[0].total_users || 0,
                        totalItems: itemResults[0].total_items || 0,
                        totalSold: itemResults[0].total_sold || 0,
                        averageRating: ratingResults ? Number(ratingResults[0]?.avg_rating || 0).toFixed(1) : "0.0",
                        totalRatings: ratingResults ? ratingResults[0]?.total_ratings || 0 : 0
                    };

                    res.json(stats);
                });
            });
        });
    } catch (error) {
        console.error("Error fetching stats:", error);
        res.status(500).json({ error: "Failed to fetch statistics" });
    }
});

export default router; 