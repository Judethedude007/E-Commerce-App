
import express from "express";
import {productDB} from "./database.js";


const router = express.Router();




router.get('/:username', (req, res) => {
    const username = req.params.username;
    console.log("Fetching user ID for:", username);

    productDB.query(
        "SELECT id FROM project.login WHERE username = ?",
        [username],
        (err, result) => {
            if (err) {
                console.error("Error fetching user ID:", err);
                return res.status(500).json({ error: 'Database error', details: err });
            }

            if (result.length === 0) {
                console.log("User not found:", username);
                return res.status(404).json({ error: "User not found" });
            }

            const userId = result[0].id;
            console.log("User ID found:", userId);

            productDB.query(
                "SELECT * FROM products WHERE user_id = ?",
                [userId],
                (err, data) => {
                    if (err) {
                        console.error("Error fetching items:", err);
                        return res.status(500).json({ error: 'Failed to fetch user items', details: err });
                    }

                    console.log("Query Result:", data);
                    return res.json(data);
                }
            );
        }
    );
});



export default router;