import express from 'express';
import { getCollections } from './database.js';

const router = express.Router();

router.get('/:username', async (req, res) => {
    const username = req.params.username;
    console.log("Fetching wishlist for user:", username);

    try {
        const collections = await getCollections();
        
        // Get user by username
        const user = await collections.users.findOne({ username });
        
        if (!user) {
            console.log("User not found:", username);
            return res.status(404).json({ error: "User not found" });
        }
        
        // Get wishlist items with product details
        const wishlistItems = await collections.wishlist
            .aggregate([
                { $match: { user_id: user._id } },
                { $lookup: {
                    from: 'products',
                    localField: 'product_id',
                    foreignField: '_id',
                    as: 'product'
                }},
                { $unwind: '$product' },
                { $project: {
                    product_id: '$product._id',
                    title: '$product.title',
                    price: '$product.price',
                    image_url: '$product.image_url',
                    location: '$product.location',
                    sale_status: '$product.sale_status'
                }}
            ])
            .toArray();
        
        console.log("Wishlist Query Result:", wishlistItems);
        return res.json(wishlistItems);
    } catch (err) {
        console.error("Error fetching wishlist items:", err);
        return res.status(500).json({ error: 'Failed to fetch wishlist', details: err.message });
    }
});

export default router;