import express from "express";
import { getCollections } from "./database.js";

const router = express.Router();

router.get('/:username', async (req, res) => {
    const username = req.params.username;
    console.log("Fetching user ID for:", username);

    try {
        const collections = await getCollections();
        
        // Get user by username
        const user = await collections.users.findOne({ username });
        
        if (!user) {
            console.log("User not found:", username);
            return res.status(404).json({ error: "User not found" });
        }
        
        const userId = user._id;
        console.log("User ID found:", userId);
        
        // Get products for user
        const products = await collections.products
            .find({ user_id: userId })
            .toArray();
        
        console.log("Query Result:", products);
        return res.json(products);
    } catch (err) {
        console.error("Error fetching items:", err);
        return res.status(500).json({ error: 'Failed to fetch user items', details: err.message });
    }
});

export default router;