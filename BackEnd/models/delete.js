import express from 'express';
import { ObjectId } from 'mongodb';
import { getCollections } from './database.js';

const router = express.Router();

router.delete('/:id', async (req, res) => {
    try {
        const itemId = req.params.id;
        const collections = await getCollections();
        
        // Convert string ID to MongoDB ObjectId
        const objectId = new ObjectId(itemId);
        
        const result = await collections.products.deleteOne({ _id: objectId });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }
        
        return res.json({ 
            message: 'Item deleted successfully',
            id: itemId
        });
    } catch (err) {
        console.error("Delete error:", err);
        return res.status(500).json({ 
            error: 'Failed to delete item', 
            details: err.message 
        });
    }
});

export default router;