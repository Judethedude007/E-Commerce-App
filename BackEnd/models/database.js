import mysql from "mysql";

const db = mysql.createConnection({
    host: 'mysql-1d992de-second-store.h.aivencloud.com',
    user: 'avnadmin',
    password: 'AVNS_fDglEymAcbSnEJ-9_AZ',
    port:'23654',
    database: 'project'
});
db.connect((err) => {
    if (err) {
        console.error("❌ Database connection failed:", err);
    } else {
        console.log("✅ Connected to MySQL database");
    }
});
export default db;