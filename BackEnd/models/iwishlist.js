import express from 'express';
import { ObjectId } from 'mongodb';
import { getCollections } from './database.js';

const router = express.Router();

router.post("/", async (req, res) => {
    const { username, product_id } = req.body;

    if (!username || !product_id) {
        return res.status(400).json({ error: "Username and Product ID are required" });
    }

    try {
        const collections = await getCollections();
        
        // Fetch user by username
        const user = await collections.users.findOne({ username });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Convert product_id string to ObjectId
        const productObjectId = new ObjectId(product_id);
        
        // Check if the product exists
        const product = await collections.products.findOne({ _id: productObjectId });
        
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Check if this item is already in the wishlist
        const existingItem = await collections.wishlist.findOne({
            user_id: user._id,
            product_id: productObjectId
        });

        if (existingItem) {
            return res.json({ message: "Item already in wishlist" });
        }

        // Insert wishlist entry
        await collections.wishlist.insertOne({
            user_id: user._id,
            product_id: productObjectId,
            added_at: new Date()
        });
        
        return res.json({ message: "Item added to wishlist" });
    } catch (err) {
        console.error("Error adding to wishlist:", err);
        return res.status(500).json({ error: "Failed to add to wishlist", details: err.message });
    }
});

export default router;