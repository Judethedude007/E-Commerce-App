import express from 'express';
import { getCollections } from './database.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const collections = await getCollections();
        
        // Get all products that are not sold
        const products = await collections.products
            .find({ sale_status: { $ne: 1 } })
            .sort({ _id: -1 })
            .toArray();
            
        // For each product, get the seller info and ratings
        const productsWithDetails = await Promise.all(products.map(async (product) => {
            // Get seller info
            const seller = await collections.users.findOne(
                { _id: product.user_id },
                { projection: { username: 1 } }
            );
            
            // Get seller ratings
            const ratingsAgg = await collections.ratings
                .aggregate([
                    { $match: { seller_id: product.user_id } },
                    { $group: {
                        _id: null,
                        avg_rating: { $avg: "$rating" },
                        count: { $sum: 1 }
                    }}
                ])
                .toArray();
                
            const ratingData = ratingsAgg.length > 0 ? ratingsAgg[0] : { avg_rating: 0, count: 0 };
            
            return {
                ...product,
                seller_name: seller ? seller.username : "Unknown Seller",
                seller_rating: ratingData.avg_rating || 0,
                total_ratings: ratingData.count || 0
            };
        }));
        
        return res.json({ products: productsWithDetails });
    } catch (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: 'Failed to fetch products', details: err.message });
    }
});

export default router;