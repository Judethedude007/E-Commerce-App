
import express from "express";
import {productDB} from "./database.js";


const router = express.Router();




router.get('/', (req, res) => {
    productDB.query("SELECT * FROM products ORDER BY id DESC", (err, data) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch products', details: err });
        return res.json({ products: data });
    });
});



export default router;