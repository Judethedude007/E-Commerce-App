import express from "express";
import { ObjectId } from "mongodb";
import { getCollections } from "./database.js";

const router = express.Router();

router.get("/:id", async (req, res) => {
    const userId = req.params.id;
    console.log("Fetching products for User ID:", userId);

    try {
        const collections = await getCollections();
        
        // Try to convert to ObjectId first
        let userQuery;
        try {
            const objectId = new ObjectId(userId);
            userQuery = { user_id: objectId };
        } catch (error) {
            // If not a valid ObjectId, try numeric ID
            userQuery = { user_id: parseInt(userId) };
        }
        
        // Query to fetch products based on user ID
        const products = await collections.products
            .find(userQuery)
            .toArray();
        
        console.log("Query Result:", products);
        return res.json(products);
    } catch (err) {
        console.error("Error fetching products:", err);
        return res.status(500).json({ error: "Failed to fetch products", details: err.message });
    }
});

export default router;