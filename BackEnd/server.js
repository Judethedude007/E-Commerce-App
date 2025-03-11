const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json()); 

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'project'
});


app.post('/login', (req, res) => {
    const sql = "SELECT * FROM login WHERE email = ? AND password = ?";
    const values = [req.body.email, req.body.password];

    db.query(sql, values, (err, data) => {
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


app.post('/signup', (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        console.log("Missing fields:", req.body); // Debug log
        return res.json({ error: "All fields are required" });
    }

    console.log("Signup request received:", req.body); // Log request data

    const checkEmailQuery = "SELECT * FROM login WHERE email = ?";
    db.query(checkEmailQuery, [email], (err, data) => {
        if (err) {
            console.error("Error checking email:", err);
            return res.json({ error: "Error checking email", details: err });
        }

        if (data.length > 0) {
            console.log("Email already exists:", email);
            return res.json({ error: "Email already registered" });
        }

        const insertQuery = "INSERT INTO login (name, email, password) VALUES (?, ?, ?)";
        db.query(insertQuery, [name, email, password], (err, result) => {
            if (err) {
                console.error("Error inserting data:", err);
                return res.json({ error: "Signup failed", details: err });
            }
            console.log("User registered successfully:", result);
            return res.json({ message: "Signup successful" });
        });
    });
});


app.listen(8081, () => {
    console.log("Server running on port 8081");
});
