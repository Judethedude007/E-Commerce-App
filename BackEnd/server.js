const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json()); // Middleware to parse JSON

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'project'
});

// Login Route
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

app.listen(8081, () => {
    console.log("Server running on port 8081");
});
