import express from "express";
import { productDB } from "./database.js";

const router = express.Router();

// Returns authoritative time from the DB (UTC) and the app server clock
router.get("/", (req, res) => {
  const sql = "SELECT UTC_TIMESTAMP() AS db_utc, UNIX_TIMESTAMP(UTC_TIMESTAMP()) * 1000 AS db_utc_ms";
  productDB.query(sql, (err, rows) => {
    const server_iso = new Date().toISOString();
    const server_ms = Date.now();
    if (err || !rows || rows.length === 0) {
      return res.json({
        ok: true,
        // Fallback to server clock if DB query fails
        db_utc_iso: null,
        db_utc_ms: null,
        server_iso,
        server_ms,
      });
    }
    const r = rows[0];
    const db_utc_iso = r.db_utc instanceof Date ? r.db_utc.toISOString() : String(r.db_utc);
    const db_utc_ms = Number(r.db_utc_ms);
    return res.json({ ok: true, db_utc_iso, db_utc_ms, server_iso, server_ms });
  });
});

export default router;
