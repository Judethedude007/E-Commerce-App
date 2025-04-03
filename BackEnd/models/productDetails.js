import express from "express";
import { ObjectId } from "mongodb";
import { getCollections } from "./database.js";

const router = express.Router();

router.get("/:id", async (req, res) => {
    const { id } = req.params;
    console.log("Fetching product details for ID:", id);

    try {
        const collections = await getCollections();
        
        // Convert id string to ObjectId
        const objectId = new ObjectId(id);
        
        // Get product details
        const product = await collections.products.findOne({ _id: objectId });
        
        if (!product) {
            console.log("No product found with ID:", id);
            return res.status(404).json({ message: "Product not found" });
        }
        
        console.log("Found product:", product);
        
        // Get seller information
        const seller = await collections.users.findOne(
            { _id: product.user_id },
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
        
        // Combine the results
        const response = {
            ...product,
            seller_rating: Number(ratingData.avg_rating || 0).toFixed(1),
            total_ratings: ratingData.count || 0,
            seller_name: seller ? seller.username : "Unknown Seller",
            seller_email: seller ? seller.email : "Not Available"
        };
        
        console.log("Sending response:", response);
        res.json(response);
    } catch (error) {
        console.error("Unexpected error details:", {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({ 
            message: "Unexpected server error",
            error: error.message,
            details: {
                name: error.name
            }
        });
    }
});

export default router;