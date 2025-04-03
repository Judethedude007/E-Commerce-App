import express from 'express';
import { ObjectId } from 'mongodb';
import { getCollections } from './database.js';

const router = express.Router();

router.post("/", async (req, res) => {
    const { sellerId, rating, username } = req.body;

    if (!sellerId || !rating || !username) {
        return res.status(400).json({ error: "Seller ID, rating, and username are required" });
    }

    try {
        const collections = await getCollections();
        
        // Get user by username
        const user = await collections.users.findOne({ username });
        
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }
        
        // Convert sellerId to ObjectId
        const sellerObjectId = new ObjectId(sellerId);
        
        // Check if user has already rated this seller
        const existingRating = await collections.ratings.findOne({
            seller_id: sellerObjectId,
            rated_by: user._id
        });
        
        if (existingRating) {
            // Update existing rating
            await collections.ratings.updateOne(
                { seller_id: sellerObjectId, rated_by: user._id },
                { 
                    $set: { 
                        rating: rating,
                        updated_at: new Date()
                    }
                }
            );
            
            return res.json({ message: "Rating updated successfully!" });
        } else {
            // Insert new rating
            await collections.ratings.insertOne({
                seller_id: sellerObjectId,
                rated_by: user._id,
                rating: rating,
                created_at: new Date()
            });
            
            return res.json({ message: "Rating added successfully!" });
        }
    } catch (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error", details: err.message });
    }
});

export default router;