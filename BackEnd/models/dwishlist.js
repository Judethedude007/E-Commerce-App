import express from "express";
import { productDB } from "./database.js";

const router = express.Router();

// Delete a wishlist item using username and product ID
router.delete('/:username/:productId', (req, res) => {
    const { username, productId } = req.params;
    console.log(`Removing product ${productId} from wishlist for user: ${username}`);

    // Get user ID from username
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

            // Delete the product from the wishlist
            productDB.query(
                "DELETE FROM wishlist WHERE user_id = ? AND product_id = ?",
                [userId, productId],
                (err, result) => {
                    if (err) {
                        console.error("Error removing item from wishlist:", err);
                        return res.status(500).json({ error: 'Failed to remove item', details: err });
                    }

                    if (result.affectedRows === 0) {
                        console.log(`Product ${productId} not found in wishlist for user ${username}`);
                        return res.status(404).json({ error: "Item not found in wishlist" });
                    }

                    console.log(`Product ${productId} removed from wishlist for user ${username}`);
                    return res.json({ message: "Item removed from wishlist" });
                }
            );
        }
    );
});

export default router;
