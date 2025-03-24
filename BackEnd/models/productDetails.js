import express from "express";
import { productDB } from "./database.js";

const router = express.Router();

// Get product details by ID
router.get("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        productDB.query("SELECT * FROM products WHERE id = ?", [id], (err, results) => {
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
