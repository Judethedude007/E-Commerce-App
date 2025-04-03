import express from "express";
import { getCollections } from "./database.js";
import upload from "../middleware/multer.js";
import { ObjectId } from "mongodb";

const router = express.Router();

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const {
      user_id,
      title,
      description = "",
      condition = "",
      location = "",
      price = "",
      category = "",
      used_time = "",
      used_years = "",
      contact_number = "",
    } = req.body;
    
    if (!user_id || !title || !price) {
      return res.status(400).json({ error: 'User ID, title, and price are required' });
    }
    
    const collections = await getCollections();
    
    // Try to find user by ID first
    let user;
    try {
      const objectId = new ObjectId(user_id);
      user = await collections.users.findOne({ _id: objectId });
    } catch (error) {
      // If not a valid ObjectId, try finding by username
      user = await collections.users.findOne({ username: user_id });
    }
    
    if (!user) {
      console.error("User not found:", user_id);
      return res.status(400).json({ error: 'User not found' });
    }
    
    const imageUrl = req.file ? req.file.path : ""; // Use the Cloudinary URL if file exists
    
    console.log("Inserting product with userId:", user._id, "imageUrl:", imageUrl);
    
    // Create a new product document
    const productDoc = {
      user_id: user._id,
      title,
      description,
      condition,
      location,
      contact_number,
      price,
      category,
      used_time,
      used_years,
      image_url: imageUrl,
      sale_status: 0, // Default assuming 0 means not sold
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const result = await collections.products.insertOne(productDoc);
    
    console.log("Product inserted successfully:", result);
    
    return res.json({ 
      message: 'Product added successfully', 
      productId: result.insertedId 
    });
    
  } catch (error) {
    console.error("Failed to add product:", error);
    return res.status(500).json({ 
      error: 'Failed to add product', 
      details: error.message 
    });
  }
});

export default router;