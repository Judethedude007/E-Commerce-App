import express from "express";
import {authDB} from "./database.js";
const router = express.Router();

router.post('/', (req, res) => {
    const sql = "SELECT * FROM login WHERE email = ? AND password = ?";
    const values = [req.body.email, req.body.password];

    authDB.query(sql, values, (err, data) => {
        if (err) {
            return res.json({ error: "Login failed", details: err });
        }
        if (data.length > 0) {
            return res.json({ message: "Login successful", user: data[0] });
        } else {
            return res.json({ error: "Invalid credentials" });
        }
    });
});
export default router;