import express from 'express';
import { getCollections } from './database.js';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { email, password } = req.body;
        const collections = await getCollections();
        
        const user = await collections.users.findOne({ email, password });
        
        if (user) {
            return res.json({ message: "Login successful", user });
        } else {
            return res.json({ error: "Invalid credentials" });
        }
    } catch (err) {
        console.error("Login error:", err);
        return res.json({ error: "Login failed", details: err.message });
    }
});

export default router;