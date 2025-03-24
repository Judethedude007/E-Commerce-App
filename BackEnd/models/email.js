import express from "express";
import { productDB } from "./database.js";

const router = express.Router();

router.get("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const query = `
    SELECT 
        p.*, 
        l.email AS seller_email  
    FROM 
        products p
    JOIN 
        login l ON p.user_id = l.id  -- If login table has 'id' instead of 'user_id'
    WHERE 
        p.id = ?`;

        productDB.query(query, [id], (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: "Server error" });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: "Product not found" });
            }

            res.json(results[0]); 
        });
    } catch (error) {
        res.status(500).json({ message: "Unexpected server error" });
    }
});

export default router;
