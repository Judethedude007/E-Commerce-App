
import express from "express";
import {productDB} from "./database.js";


const router = express.Router();




router.delete('/:id', (req, res) => {
    const itemId = req.params.id;
    
    productDB.query(
        "DELETE FROM products WHERE id = ?",
        [itemId],
        (err, result) => {
            if (err) return res.status(500).json({ 
                error: 'Failed to delete item', 
                details: err 
            });
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Item not found' });
            }
            
            return res.json({ 
                message: 'Item deleted successfully',
                id: itemId
            });
        }
    );
});



export default router;