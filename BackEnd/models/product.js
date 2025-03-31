import express from "express";
import {productDB} from "./database.js";

const router = express.Router();

router.get('/', (req, res) => {
    const query = `
        SELECT 
            p.*,
            l.username AS seller_name,
            COALESCE(AVG(r.rating), 0) AS seller_rating,
            COUNT(DISTINCT r.id) AS total_ratings
        FROM products p
        LEFT JOIN login l ON p.user_id = l.id
        LEFT JOIN ratings r ON p.user_id = r.seller_id
        WHERE p.sale_status != 1
        GROUP BY p.id, p.title, p.description, p.price, p.category, p.condition, p.location, p.image_url, p.used_time, p.used_years, p.contact_number, p.sale_status, p.user_id, l.username
        ORDER BY p.id DESC`;

    productDB.query(query, (err, data) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: 'Failed to fetch products', details: err });
        }
        return res.json({ products: data });
    });
});

export default router;