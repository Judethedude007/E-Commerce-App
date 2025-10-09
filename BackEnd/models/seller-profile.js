import express from "express";
import { productDB } from "./database.js";

const router = express.Router();

// 🛒 Fetch Seller Profile with Ratings
router.get("/:id", (req, res) => {
    const { id } = req.params;

   
    
    
        const sellerQuery = `
            SELECT 
                username AS seller_name, 
                email AS seller_email
            FROM login 
            WHERE id = ?`;
    
        productDB.query(sellerQuery, [id], (err, sellerResults) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Database error", details: err });
            }
    
            if (sellerResults.length === 0) {
                return res.status(404).json({ error: "Seller not found" });
            }
    
            const seller = sellerResults[0];
    
            // Query to get seller's rating
            const ratingQuery = `
                SELECT 
                    IFNULL(AVG(rating), 0) AS average_rating, 
                    COUNT(*) AS total_ratings 
                FROM ratings 
                WHERE seller_id = ?`;
    
            productDB.query(ratingQuery, [id], (err, ratingResults) => {
                if (err) {
                    console.error("Database error:", err);
                    return res.status(500).json({ error: "Database error", details: err });
                }
    
                // Combine seller details & ratings
                res.json({
                    seller_name: seller.seller_name,
                    seller_email: seller.seller_email,
                    average_rating: ratingResults[0].average_rating.toFixed(1),
                    total_ratings: ratingResults[0].total_ratings
                });
            });
        });
    });
export default router;
