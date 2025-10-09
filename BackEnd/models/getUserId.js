import express from "express";
import { productDB } from "./database.js";

const router = express.Router();

router.get("/:username", (req, res) => {
    const { username } = req.params;
    productDB.query(
        "SELECT id FROM project.login WHERE username = ? LIMIT 1",
        [username],
        (err, rows) => {
            if (err || !rows.length) return res.status(404).json({ error: "User not found" });
            res.json({ userId: rows[0].id });
        }
    );
});

export default router;