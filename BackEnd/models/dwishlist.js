import express from 'express';
import { ObjectId } from 'mongodb';
import { getCollections } from './database.js';

const router = express.Router();

// Delete a wishlist item using username and product ID
router.delete('/:username/:productId', async (req, res) => {
    const { username, productId } = req.params;
    console.log(`Removing product ${productId} from wishlist for user: ${username}`);

    try {
        const collections = await getCollections();
        
        // Get user by username
        const user = await collections.users.findOne({ username });
        
        if (!user) {
            console.log("User not found:", username);
            return res.status(404).json({ error: "User not found" });
        }
        
        // Convert productId string to ObjectId
        const productObjectId = new ObjectId(productId);
        
        // Delete the product from the wishlist
        const result = await collections.wishlist.deleteOne({
            user_id: user._id,
            product_id: productObjectId
        });
        
        if (result.deletedCount === 0) {
            console.log(`Product ${productId} not found in wishlist for user ${username}`);
            return res.status(404).json({ error: "Item not found in wishlist" });
        }
        
        console.log(`Product ${productId} removed from wishlist for user ${username}`);
        return res.json({ message: "Item removed from wishlist" });
    } catch (err) {
        console.error("Error removing item from wishlist:", err);
        return res.status(500).json({ error: 'Failed to remove item', details: err.message });
    }
});

export default router;