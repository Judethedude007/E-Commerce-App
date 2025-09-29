import express from "express";
import { authDB } from "./database.js"; // import existing connection

const router = express.Router();

// GET /wallet/:username - fetch wallet by username
router.get("/:username", (req, res) => {
  const { username } = req.params;

  const query = `
    SELECT w.balance, w.updated_at
    FROM wallets w
    JOIN login l ON w.user_id = l.id
    WHERE l.username = ?
  `;

  authDB.query(query, [username], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    res.json(results[0]);
  });
});

export default router;
