import express from 'express';
import { getCollections } from './database.js';

const router = express.Router();

router.post('/', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        console.log("Missing fields:", req.body);
        return res.json({ error: "All fields are required" });
    }

    console.log("Signup request received:", req.body);

    try {
        const collections = await getCollections();
        
        // Check if email already exists
        const existingUser = await collections.users.findOne({ email });
        
        if (existingUser) {
            console.log("Email already exists:", email);
            return res.json({ error: "Email already registered" });
        }
        
        // Insert new user
        const newUser = {
            username: name,
            email,
            password,
            createdAt: new Date()
        };
        
        const result = await collections.users.insertOne(newUser);
        
        console.log("User registered successfully:", result);
        return res.json({ message: "Signup successful" });
    } catch (err) {
        console.error("Error inserting data:", err);
        return res.json({ error: "Signup failed", details: err.message });
    }
});

export default router;