import express from "express";
import { ObjectId } from "mongodb";
import { getCollections } from "./database.js";

const router = express.Router();

router.get("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const collections = await getCollections();
        
        // Convert id string to ObjectId
        const objectId = new ObjectId(id);
        
        // Get product details
        const product = await collections.products.findOne({ _id: objectId });
        
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        
        // Get seller information
        const seller = await collections.users.findOne(
            { _id: product.user_id },
            { projection: { username: 1, email: 1 } }
        );
        
        if (!seller) {
            return res.status(404).json({ message: "Seller information not found" });
        }
        
        // Combine product and seller information
        const result = {
            ...product,
            seller_email: seller.email,
            seller_name: seller.username
        };
        
        res.json(result);
    } catch (error) {
        console.error("Unexpected server error:", error);
        res.status(500).json({ message: "Unexpected server error" });
    }
});

export default router;