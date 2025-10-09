import express from "express";
import { productDB } from "./database.js";

const router = express.Router();


router.get("/:id", (req, res) => {
    const userId = req.params.id;
    console.log("Fetching products for User ID:", userId);

    // Query to fetch products based on user ID
    const query = "SELECT * FROM products WHERE user_id = ?";
    productDB.query(query, [userId], (err, data) => {
        if (err) {
            console.error("Error fetching products:", err);
            return res.status(500).json({ error: "Failed to fetch products", details: err });
        }

        console.log("Query Result:", data);
        return res.json(data);
    });
});

export default router;
