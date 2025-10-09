import express from "express";
import { authDB } from "./database.js";

const router = express.Router();

// Get wallet balance for a user
router.get("/:username", (req, res) => {
    const username = req.params.username;
    authDB.query(
        "SELECT wallet_balance FROM login WHERE username = ?",
        [username],
        (err, result) => {
            if (err) return res.status(500).json({ error: "Database error", details: err });
            if (result.length === 0) return res.status(404).json({ error: "User not found" });
            res.json({ wallet_balance: result[0].wallet_balance || 0 });
        }
    );
});

// Add amount to wallet
router.post("/:username/add", (req, res) => {
    const username = req.params.username;
    const { amount } = req.body;
    if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
    }
    authDB.query(
        "UPDATE login SET wallet_balance = COALESCE(wallet_balance, 0) + ? WHERE username = ?",
        [amount, username],
        (err, result) => {
            if (err) return res.status(500).json({ error: "Database error", details: err });
            if (result.affectedRows === 0) return res.status(404).json({ error: "User not found" });
            res.json({ message: "Amount added to wallet" });
        }
    );
});

export default router;
