import express from "express";
import { ObjectId } from "mongodb";
import { getCollections } from "./database.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const productId = req.params.id;
    const { user_id, title, condition, location, price, category, sale_status } = req.body;
    const collections = await getCollections();

    // Create update object
    const updateData = {
      title,
      condition,
      location,
      price: parseFloat(price), // Convert to number
      category,
      sale_status: parseInt(sale_status), // Convert to number
      updated_at: new Date()
    };

    // Add image path if a new image was uploaded
    if (req.file) {
      updateData.image_url = req.file.path;
    }

    // Convert productId string to ObjectId
    const objectId = new ObjectId(productId);
    
    // Update product
    const result = await collections.products.updateOne(
      { _id: objectId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product updated successfully" });
  } catch (err) {
    console.error("Update error:", err);
    return res.status(500).json({ error: "Database error", details: err.message });
  }
});

export default router;