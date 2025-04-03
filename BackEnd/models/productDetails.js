import express from "express";
import { ObjectId } from "mongodb";
import { getCollections } from "./database.js";

const router = express.Router();

router.get("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const collections = await getCollections();
        
        // Try to convert to ObjectId first
        let query;
        try {
            const objectId = new ObjectId(id);
            query = { _id: objectId };
        } catch (error) {
            // If not a valid ObjectId, try numeric ID
            query = { id: parseInt(id) };
        }

        // Get product details
        const product = await collections.products.findOne(query);
        
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Get seller information - handle both ObjectId and numeric user_ids
        const seller = await collections.users.findOne(
            { $or: [
                { _id: new ObjectId(product.user_id) },
                { id: parseInt(product.user_id) }
            ]},
            { projection: { username: 1, email: 1 } }
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

        // Ensure values exist before assigning
        const seller_name = seller ? seller.username || "Unknown Seller" : "Unknown Seller";
        const seller_email = seller ? seller.email || "Not Available" : "Not Available";

        // Combine the results
        const response = {
            ...product,
            id: product._id ? product._id.toString() : product.id,
            seller_rating: Number(ratingData.avg_rating || 0).toFixed(1),
            total_ratings: ratingData.count || 0,
            seller_name,
            seller_email
        };
        
        return res.json(response);
    } catch (error) {
        console.error("Server error:", error);
        return res.status(500).json({ 
            message: "Server error",
            error: error.message
        });
    }
});

export default router;