import express from "express";
import { authDB, productDB } from "./database.js";
import upload from "../middleware/multer.js";
import cloudinary from "../config/cloudinary.js";
const router = express.Router();

router.post('/', upload.single('image'), (req, res) => {
    const { user_id, title, condition, location, price, category } = req.body;
    if (!user_id || !title || !price) return res.status(400).json({ error: 'User ID, title, and price are required' });
    
    // First look up the user_id from the username
    const getUserIdQuery = "SELECT id FROM project.login WHERE username = ?";
    authDB.query(getUserIdQuery, [user_id], (err, results) => {
        if (err) {
            console.error("Database error looking up user:", err);
            return res.status(500).json({ error: 'Database error', details: err });
        }
        if (results.length === 0) {
            console.error("User not found:", user_id);
            return res.status(400).json({ error: 'User not found' });
        }
        
        const userId = results[0].id;
        const imageUrl = req.file.path; // Use the Cloudinary URL
        
        console.log("Inserting product with userId:", userId, "imageUrl:", imageUrl);
        
        // Make sure this matches your table structure exactly
        const insertProduct = "INSERT INTO products (user_id, title, `condition`, location, price, category, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)";
        const values = [userId, title, condition, location, price, category, imageUrl];
        
        productDB.query(insertProduct, values, (err, result) => {
            if (err) {
                console.error("Failed to insert product:", err);
                return res.status(500).json({ error: 'Failed to add product', details: err });
            }
            console.log("Product inserted successfully:", result);
            return res.json({ message: 'Product added successfully', productId: result.insertId });
        });
    });
});

export default router;