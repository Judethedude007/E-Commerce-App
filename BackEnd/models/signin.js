import express from 'express';
import {authDB} from './database.js';

const router = express.Router();

        
        router.post('/', (req, res) => {
        const { name, email, password } = req.body;
    
        if (!name || !email || !password) {
            console.log("Missing fields:", req.body);
            return res.json({ error: "All fields are required" });
        }
    
        console.log("Signup request received:", req.body);
    
        const checkEmailQuery = "SELECT * FROM `login` WHERE `email` = ?";
        authDB.query(checkEmailQuery, [email], (err, data) => {
            if (err) {
                console.error("Error checking email:", err);
                return res.json({ error: "Error checking email" });
            }
    
            if (data.length > 0) {
                console.log("Email already exists:", email);
                return res.json({ error: "Email already registered" });
            }
    
            const insertQuery = "INSERT INTO `login` (`username`, `email`, `password`) VALUES (?, ?, ?)";
            authDB.query(insertQuery, [name, email, password], (err, result) => {
                if (err) {
                    console.error("Error inserting data:", err);
                    return res.json({ error: "Signup failed" });
                }
                console.log("User registered successfully:", result);
                return res.json({ message: "Signup successful" }); 
            });
        });
    });

    

    export default router;