import express from "express";
import { productDB } from "./database.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.put("/:id", upload.single("image"), (req, res) => {
  const productId = req.params.id;
  const { user_id, title, condition, location, price, category, sale_status } = req.body;

  let updateQuery = "UPDATE products SET title = ?, `condition` = ?, location = ?, price = ?, category = ?, sale_status = ?";
  let queryParams = [title, condition, location, price, category, sale_status];

  if (req.file) {
    updateQuery += ", image_url = ?";
    queryParams.push(req.file.path);
  }

  updateQuery += " WHERE id = ?";
  queryParams.push(productId);

  productDB.query(updateQuery, queryParams, (err, result) => {
    if (err) return res.status(500).json({ error: "Database error", details: err });
    res.json({ message: "Product updated successfully" });
  });
});

export default router;
