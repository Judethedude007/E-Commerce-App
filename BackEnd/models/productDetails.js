import express from "express";
import { productDB } from "./database.js";

const router = express.Router();

router.get("/:id", async (req, res) => {
    const { id } = req.params;
    console.log("Fetching product details for ID:", id);

    try {
        // Get product details with seller information from login table
        const productQuery = `
            SELECT p.*, l.username as seller_name, l.email as seller_email
            FROM products p
            LEFT JOIN login l ON p.user_id = l.id
            WHERE p.id = ?`;

        console.log("Executing product query:", productQuery, "with ID:", id);
        
        productDB.query(productQuery, [id], (err, productResults) => {
            if (err) {
                console.error("Product query error details:", {
                    code: err.code,
                    errno: err.errno,
                    sqlState: err.sqlState,
                    sqlMessage: err.sqlMessage,
                    sql: err.sql
                });
                return res.status(500).json({ 
                    message: "Error fetching product details",
                    error: err.message,
                    details: {
                        code: err.code,
                        sqlState: err.sqlState
                    }
                });
            }

            if (!productResults || productResults.length === 0) {
                console.log("No product found with ID:", id);
                return res.status(404).json({ message: "Product not found" });
            }

            const product = productResults[0];
            console.log("Found product:", product);

            // Then get the ratings if they exist
            const ratingQuery = `
                SELECT 
                    COALESCE(AVG(rating), 0) as avg_rating,
                    COUNT(*) as total_ratings
                FROM ratings
                WHERE seller_id = ?`;

            console.log("Executing rating query:", ratingQuery, "with seller_id:", product.user_id);

            productDB.query(ratingQuery, [product.user_id], (ratingErr, ratingResults) => {
                if (ratingErr) {
                    console.error("Rating query error details:", {
                        code: ratingErr.code,
                        errno: ratingErr.errno,
                        sqlState: ratingErr.sqlState,
                        sqlMessage: ratingErr.sqlMessage,
                        sql: ratingErr.sql
                    });

                    // If ratings table doesn't exist, just return the product without ratings
                    if (ratingErr.code === 'ER_NO_SUCH_TABLE') {
                        console.log("Ratings table does not exist, returning product without ratings");
                        const response = {
                            ...product,
                            seller_rating: "0.0",
                            total_ratings: 0,
                            seller_name: product.seller_name || "Unknown Seller",
                            seller_email: product.seller_email || "Not Available"
                        };
                        return res.json(response);
                    }
                    
                    // For any other error, still return the product with default ratings
                    const response = {
                        ...product,
                        seller_rating: "0.0",
                        total_ratings: 0,
                        seller_name: product.seller_name || "Unknown Seller",
                        seller_email: product.seller_email || "Not Available"
                    };
                    return res.json(response);
                }

                // Combine the results
                const response = {
                    ...product,
                    seller_rating: ratingResults ? Number(ratingResults[0]?.avg_rating || 0).toFixed(1) : "0.0",
                    total_ratings: ratingResults ? Number(ratingResults[0]?.total_ratings || 0) : 0,
                    seller_name: product.seller_name || "Unknown Seller",
                    seller_email: product.seller_email || "Not Available"
                };

                console.log("Sending response:", response);
                res.json(response);
            });
        });
    } catch (error) {
        console.error("Unexpected error details:", {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({ 
            message: "Unexpected server error",
            error: error.message,
            details: {
                name: error.name
            }
        });
    }
});

export default router;
