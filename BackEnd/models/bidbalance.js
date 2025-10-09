import express from "express";
import { authDB, productDB } from "./database.js";

const router = express.Router();

// MODIFICATION: The endpoint is now more specific to avoid conflicts.
router.post("/place/:productId", (req, res) => {
    const { productId } = req.params;
    const { username, bid } = req.body;

    if (!username || bid === undefined || bid === null) {
        return res.status(400).json({ success: false, message: "Username and bid are required" });
    }

    const bidAmount = Number(bid);
    if (!Number.isFinite(bidAmount) || bidAmount <= 0) {
        return res.status(400).json({ success: false, message: "Invalid bid amount" });
    }

    productDB.getConnection((err, connection) => {
        if (err) {
            console.error("Failed to get DB connection:", err);
            return res.status(500).json({ success: false, message: "Database connection error" });
        }

        connection.beginTransaction((transactionErr) => {
            if (transactionErr) {
                connection.release();
                return res.status(500).json({ success: false, message: "Failed to start transaction" });
            }

            // Step 1: Get user ID and wallet balance
            authDB.query("SELECT id, wallet_balance FROM login WHERE username = ?", [username], (userErr, userRows) => {
                if (userErr) {
                    connection.rollback(() => {
                        connection.release();
                        return res.status(500).json({ success: false, message: "DB error", details: userErr });
                    });
                    return;
                }
                if (!userRows || userRows.length === 0) {
                    connection.rollback(() => {
                        connection.release();
                        return res.status(400).json({ success: false, message: "User not found" });
                    });
                    return;
                }
                const userId = userRows[0].id;
                const walletBalance = parseFloat(userRows[0].wallet_balance || 0);

                // Step 2: Get product price and current highest bid
                connection.query("SELECT price FROM products WHERE id = ?", [productId], (prodErr, prodRows) => {
                    if (prodErr) {
                        connection.rollback(() => {
                            connection.release();
                            return res.status(500).json({ success: false, message: "DB error", details: prodErr });
                        });
                        return;
                    }
                    if (!prodRows || prodRows.length === 0) {
                        connection.rollback(() => {
                            connection.release();
                            return res.status(400).json({ success: false, message: "Product not found" });
                        });
                        return;
                    }
                    connection.query("SELECT MAX(amount) AS highest FROM bids WHERE product_id = ?", [productId], (highErr, highRows) => {
                        if (highErr) {
                            connection.rollback(() => {
                                connection.release();
                                return res.status(500).json({ success: false, message: "DB error", details: highErr });
                            });
                            return;
                        }
                        const highestBid = parseFloat(highRows[0].highest || 0);
                        const minNextBid = Math.max(parseFloat(prodRows[0].price || 0), highestBid);

                        if (bidAmount <= minNextBid) {
                            connection.rollback(() => {
                                connection.release();
                                return res.status(400).json({ success: false, message: `Bid must be greater than ₹${minNextBid.toFixed(2)}` });
                            });
                            return;
                        }

                        // Step 3: Find user's previous highest bid
                        connection.query("SELECT MAX(amount) AS prevAmount FROM bids WHERE user_id = ? AND product_id = ?", [userId, productId], (prevErr, prevRows) => {
                            if (prevErr) {
                                connection.rollback(() => {
                                    connection.release();
                                    return res.status(500).json({ success: false, message: "DB error", details: prevErr });
                                });
                                return;
                            }
                            const prevBidAmount = parseFloat(prevRows[0].prevAmount || 0);

                            // Step 4: Check wallet for increased amount
                            const amountToDeduct = bidAmount - prevBidAmount;
                            if (walletBalance < amountToDeduct) {
                                connection.rollback(() => {
                                    connection.release();
                                    return res.status(400).json({ success: false, message: `Insufficient wallet balance. You need ₹${amountToDeduct.toFixed(2)} more.` });
                                });
                                return;
                            }

                            // Step 5: Deduct wallet
                            authDB.query("UPDATE login SET wallet_balance = ? WHERE id = ?", [walletBalance - amountToDeduct, userId], (updateErr) => {
                                if (updateErr) {
                                    connection.rollback(() => {
                                        connection.release();
                                        return res.status(500).json({ success: false, message: "DB error", details: updateErr });
                                    });
                                    return;
                                }

                                // Step 6: Insert bid
                                connection.query("INSERT INTO bids (product_id, user_id, amount) VALUES (?, ?, ?)", [productId, userId, bidAmount], (insertErr) => {
                                    if (insertErr) {
                                        connection.rollback(() => {
                                            connection.release();
                                            return res.status(500).json({ success: false, message: "Failed to place bid", details: insertErr });
                                        });
                                        return;
                                    }

                                    connection.commit((commitErr) => {
                                        connection.release();
                                        if (commitErr) {
                                            return res.status(500).json({ success: false, message: "Failed to commit transaction", details: commitErr });
                                        }
                                        return res.json({ success: true, message: "Bid placed successfully" });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

export default router;

