import express from "express";
import { authDB, productDB } from "./database.js";

const router = express.Router();

// Convert MySQL DATETIME (naive, no TZ) treated as UTC into ISO UTC string
const mysqlToIsoUtc = (val) => {
  if (!val) return null;
  const s = String(val).trim();
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})(?:\.\d+)?$/);
  if (m) {
    const [, y, mo, d, h, mi, se] = m;
    const ms = Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(se));
    return new Date(ms).toISOString();
  }
  const ms = Date.parse(s);
  return Number.isFinite(ms) ? new Date(ms).toISOString() : null;
};

// Produce a human-friendly IST string (YYYY-MM-DD HH:mm:ss) from an ISO UTC string
const toIstStringFromIso = (iso) => {
  if (!iso) return null;
  const ms = Date.parse(String(iso));
  if (!Number.isFinite(ms)) return null;
  const istMs = ms + 330 * 60 * 1000;
  const d = new Date(istMs);
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = d.getUTCFullYear();
  const mm = pad(d.getUTCMonth() + 1);
  const dd = pad(d.getUTCDate());
  const HH = pad(d.getUTCHours());
  const MM = pad(d.getUTCMinutes());
  const SS = pad(d.getUTCSeconds());
  return `${yyyy}-${mm}-${dd} ${HH}:${MM}:${SS}`;
};

// Format a UTC millisecond timestamp into MySQL DATETIME 'YYYY-MM-DD HH:mm:ss' (UTC wall time)
const formatUtcMsToMysql = (msUtc) => {
  const d = new Date(msUtc);
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = d.getUTCFullYear();
  const mm = pad(d.getUTCMonth() + 1);
  const dd = pad(d.getUTCDate());
  const HH = pad(d.getUTCHours());
  const MM = pad(d.getUTCMinutes());
  const SS = pad(d.getUTCSeconds());
  return `${yyyy}-${mm}-${dd} ${HH}:${MM}:${SS}`;
};

// duplicate removed

// Ensure bids table exists
const createBidsTable = `
CREATE TABLE IF NOT EXISTS bids (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  user_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (product_id),
  INDEX (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

productDB.query(createBidsTable, (err) => {
  if (err) {
    console.error("Failed to ensure bids table exists:", err);
  } else {
    console.log("Bids table ensured.");
  }
});

// Ensure products has bid_end_time column (for scheduling bid end)
// Use a portable approach: try to add column; if it exists (ER_DUP_FIELDNAME), ignore.
const addBidEndTimeColumn = `ALTER TABLE products ADD COLUMN bid_end_time DATETIME NULL`;
productDB.query(addBidEndTimeColumn, (err) => {
  if (err) {
    // MySQL duplicate column error code is ER_DUP_FIELDNAME (1060)
    if (err.code === 'ER_DUP_FIELDNAME' || err.errno === 1060) {
      console.log("products.bid_end_time column already exists.");
    } else {
      console.error("Failed to add products.bid_end_time column:", err);
    }
  } else {
    console.log("products.bid_end_time column added.");
  }
});

// Place a bid for a product
router.post("/:productId", (req, res) => {
  const { productId } = req.params;
  const { username, bid } = req.body;

  if (!username || bid === undefined || bid === null) {
    return res.status(400).json({ success: false, message: "username and bid are required" });
  }

  const bidAmount = Number(bid);
  if (!Number.isFinite(bidAmount) || bidAmount <= 0) {
    return res.status(400).json({ success: false, message: "Invalid bid amount" });
  }

  // Validate product exists and is a bidding product
  const productQuery = "SELECT id, price, listing_type, user_id, bid_end_time FROM products WHERE id = ?";
  productDB.query(productQuery, [productId], (perr, pres) => {
    if (perr) return res.status(500).json({ success: false, message: "DB error", details: perr });
    if (!pres || pres.length === 0) return res.status(404).json({ success: false, message: "Product not found" });

    const product = pres[0];
    const lt = product.listing_type;
    const isBidding = Number(lt) === 1 || String(lt).toLowerCase() === 'bidding' || String(lt) === '1';
    if (!isBidding) {
      return res.status(400).json({ success: false, message: "Bidding is not enabled for this product" });
    }

    // Enforce bid end time if set
    if (product.bid_end_time) {
      const now = new Date();
      const end = new Date(product.bid_end_time);
      if (now > end) {
        return res.status(400).json({ success: false, message: "Bidding has ended for this product" });
      }
    }

    // Get current highest bid
    const highestQuery = "SELECT MAX(amount) AS highest FROM bids WHERE product_id = ?";
    productDB.query(highestQuery, [productId], (herr, hres) => {
      if (herr) return res.status(500).json({ success: false, message: "DB error", details: herr });
      const highest = Number(hres?.[0]?.highest || 0);
      const currentMin = Math.max(Number(product.price) || 0, highest);
      if (bidAmount <= currentMin) {
        return res.status(400).json({ success: false, message: `Bid must be greater than ${currentMin}` });
      }

      // Lookup user id by username
      const userQuery = "SELECT id FROM login WHERE username = ?";
      authDB.query(userQuery, [username], (uerr, ures) => {
        if (uerr) return res.status(500).json({ success: false, message: "DB error", details: uerr });
        if (!ures || ures.length === 0) return res.status(400).json({ success: false, message: "User not found" });
        const userId = ures[0].id;

        const insertQuery = "INSERT INTO bids (product_id, user_id, amount) VALUES (?, ?, ?)";
        productDB.query(insertQuery, [productId, userId, bidAmount], (ierr) => {
          if (ierr) return res.status(500).json({ success: false, message: "Failed to place bid", details: ierr });
          return res.json({ success: true, message: "Bid placed successfully" });
        });
      });
    });
  });
});

// Get recent bids for a product (for seller visibility)
router.get("/:productId/list", (req, res) => {
  const { productId } = req.params;
  const q = `
    SELECT b.id, b.amount, b.created_at, l.username as bidder
    FROM bids b
    LEFT JOIN login l ON l.id = b.user_id
    WHERE b.product_id = ?
    ORDER BY b.created_at DESC
    LIMIT 20
  `;
  productDB.query(q, [productId], (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: "DB error", details: err });
    res.json({ success: true, bids: rows || [] });
  });
});

// Schedule to stop bidding in 10 minutes (seller-only)
router.post("/:productId/stop-in-10", (req, res) => {
  const { productId } = req.params;
  const { username } = req.body;

  if (!username) return res.status(400).json({ success: false, message: "username is required" });

  // Resolve user id
  const userQuery = "SELECT id FROM login WHERE username = ?";
  authDB.query(userQuery, [username], (uerr, ures) => {
    if (uerr) return res.status(500).json({ success: false, message: "DB error", details: uerr });
    if (!ures || ures.length === 0) return res.status(404).json({ success: false, message: "User not found" });
    const userId = ures[0].id;

    // Verify ownership and bidding enabled
    const pq = "SELECT user_id, listing_type FROM products WHERE id = ?";
    productDB.query(pq, [productId], (perr, pres) => {
      if (perr) return res.status(500).json({ success: false, message: "DB error", details: perr });
      if (!pres || pres.length === 0) return res.status(404).json({ success: false, message: "Product not found" });
      const p = pres[0];
      const isBidding = Number(p.listing_type) === 1 || String(p.listing_type).toLowerCase() === 'bidding' || String(p.listing_type) === '1';
      if (!isBidding) return res.status(400).json({ success: false, message: "Bidding is not enabled for this product" });
      if (p.user_id !== userId) return res.status(403).json({ success: false, message: "Not authorized" });

  // Compute end time in Node (UTC) to avoid relying on DB server clock drift
  const endMs = Date.now() + 10 * 60 * 1000;
  const endIso = new Date(endMs).toISOString();
  const endMysql = formatUtcMsToMysql(endMs);
  const update = "UPDATE products SET bid_end_time = ? WHERE id = ?";
      productDB.query(update, [endMysql, productId], (uerr2) => {
        if (uerr2) {
          // If column is missing, add it and retry once
          if (uerr2.code === 'ER_BAD_FIELD_ERROR' || uerr2.errno === 1054) {
            const addCol = "ALTER TABLE products ADD COLUMN bid_end_time DATETIME NULL";
            productDB.query(addCol, (aerr) => {
              if (aerr && !(aerr.code === 'ER_DUP_FIELDNAME' || aerr.errno === 1060)) {
                return res.status(500).json({ success: false, message: "Failed to schedule bid end", details: aerr });
              }
              // retry update
              productDB.query(update, [endMysql, productId], (uerr3) => {
                if (uerr3) return res.status(500).json({ success: false, message: "Failed to schedule bid end", details: uerr3 });
                const fetch = "SELECT bid_end_time FROM products WHERE id = ?";
                productDB.query(fetch, [productId], (ferr, fres) => {
                  if (ferr) return res.status(500).json({ success: false, message: "DB error", details: ferr });
                  const ts = fres?.[0]?.bid_end_time;
                  const iso = mysqlToIsoUtc(ts) || endIso;
                  return res.json({ 
                    success: true, 
                    bid_end_time: iso, 
                    bid_end_time_ist: toIstStringFromIso(iso),
                    server_now: new Date().toISOString(),
                    server_now_ist: toIstStringFromIso(new Date().toISOString())
                  });
                });
              });
            });
          } else {
            return res.status(500).json({ success: false, message: "Failed to schedule bid end", details: uerr2 });
          }
        } else {
          const fetch = "SELECT bid_end_time FROM products WHERE id = ?";
          productDB.query(fetch, [productId], (ferr, fres) => {
            if (ferr) return res.status(500).json({ success: false, message: "DB error", details: ferr });
            const ts = fres?.[0]?.bid_end_time;
            const iso = mysqlToIsoUtc(ts) || endIso;
            return res.json({ 
              success: true, 
              bid_end_time: iso,
              bid_end_time_ist: toIstStringFromIso(iso),
              server_now: new Date().toISOString(),
              server_now_ist: toIstStringFromIso(new Date().toISOString())
            });
          });
        }
      });
    });
  });
});

// Set custom expiry for bidding (seller-only)
router.post("/:productId/set-expiry", (req, res) => {
  const { productId } = req.params;
  const { username, expiry } = req.body;
  if (!username || !expiry) return res.status(400).json({ success: false, message: "username and expiry are required" });

  // Validate expiry is a valid ISO string
  const expiryDate = new Date(expiry);
  if (!Number.isFinite(expiryDate.getTime())) return res.status(400).json({ success: false, message: "Invalid expiry date" });

  // Resolve user id
  const userQuery = "SELECT id FROM login WHERE username = ?";
  authDB.query(userQuery, [username], (uerr, ures) => {
    if (uerr) return res.status(500).json({ success: false, message: "DB error", details: uerr });
    if (!ures || ures.length === 0) return res.status(404).json({ success: false, message: "User not found" });
    const userId = ures[0].id;

    // Verify ownership and bidding enabled
    const pq = "SELECT user_id, listing_type FROM products WHERE id = ?";
    productDB.query(pq, [productId], (perr, pres) => {
      if (perr) return res.status(500).json({ success: false, message: "DB error", details: perr });
      if (!pres || pres.length === 0) return res.status(404).json({ success: false, message: "Product not found" });
      const p = pres[0];
      const isBidding = Number(p.listing_type) === 1 || String(p.listing_type).toLowerCase() === 'bidding' || String(p.listing_type) === '1';
      if (!isBidding) return res.status(400).json({ success: false, message: "Bidding is not enabled for this product" });
      if (p.user_id !== userId) return res.status(403).json({ success: false, message: "Not authorized" });

      // Set expiry
      const mysqlExpiry = formatUtcMsToMysql(expiryDate.getTime());
      const update = "UPDATE products SET bid_end_time = ? WHERE id = ?";
      productDB.query(update, [mysqlExpiry, productId], (uerr2) => {
        if (uerr2) return res.status(500).json({ success: false, message: "Failed to set expiry", details: uerr2 });
        return res.json({ success: true, bid_end_time: mysqlExpiry });
      });
    });
  });
});

// Finalize bidding and transfer funds to seller
router.post("/:productId/finalize", (req, res) => {
  const { productId } = req.params;
  const { username } = req.body; // seller username

  // Get seller id
  authDB.query("SELECT id FROM login WHERE username = ?", [username], (sellerErr, sellerRows) => {
    if (sellerErr) return res.status(500).json({ success: false, message: "DB error", details: sellerErr });
    if (!sellerRows || sellerRows.length === 0) return res.status(404).json({ success: false, message: "Seller not found" });
    const sellerId = sellerRows[0].id;

    // Get product info
    productDB.query("SELECT user_id, bid_end_time FROM products WHERE id = ?", [productId], (prodErr, productRows) => {
      if (prodErr) return res.status(500).json({ success: false, message: "DB error", details: prodErr });
      if (!productRows || productRows.length === 0) return res.status(404).json({ success: false, message: "Product not found" });
      const product = productRows[0];
      if (product.user_id !== sellerId) return res.status(403).json({ success: false, message: "Not authorized" });

      // Check if bidding has ended
      const now = new Date();
      const end = new Date(product.bid_end_time);
      if (now < end) return res.status(400).json({ success: false, message: "Bidding has not ended yet" });

      // Get highest bid and buyer
      productDB.query(
        "SELECT user_id, amount FROM bids WHERE product_id = ? ORDER BY amount DESC LIMIT 1",
        [productId],
        (bidErr, bidRows) => {
          if (bidErr) return res.status(500).json({ success: false, message: "DB error", details: bidErr });
          if (!bidRows || bidRows.length === 0) return res.status(400).json({ success: false, message: "No bids to finalize" });
          const highestBid = bidRows[0];
          const buyerId = highestBid.user_id;
          const amount = Number(highestBid.amount);

          // Transfer funds: add amount to seller wallet (buyer wallet already deducted during bidding)
          authDB.query("UPDATE login SET wallet_balance = wallet_balance + ? WHERE id = ?", [amount, sellerId], (walletErr) => {
            if (walletErr) return res.status(500).json({ success: false, message: "DB error", details: walletErr });

            // Optionally, mark product as sold
            productDB.query("UPDATE products SET sale_status = 1 WHERE id = ?", [productId], (soldErr) => {
              if (soldErr) return res.status(500).json({ success: false, message: "DB error", details: soldErr });

              res.json({ success: true, message: "Bidding finalized, funds transferred", amount, buyerId, sellerId });
            });
          });
        }
      );
    });
  });
});

export default router;
