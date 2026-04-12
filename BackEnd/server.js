import express from 'express';
import cors from 'cors';
import dotenv from "dotenv";

// ===== ROUTE IMPORTS =====
import signinRouter from "./models/signin.js";
import loginRouter from "./models/login.js";
import productRouter from "./models/product.js";
import addproductRouter from "./models/addproduct.js";
import productDetailsRouter from "./models/productDetails.js";
import userproductRouter from "./models/userproduct.js";
import sellerproductRouter from "./models/sellerproduct.js";
import dproductRouter from "./models/delete.js";
import eproductRouter from "./models/edit.js";
import bidBalanceRouter from "./models/bidbalance.js";
import wproductRouter from "./models/wishlist.js";
import dwproductRouter from "./models/dwishlist.js";
import iwproductRouter from "./models/iwishlist.js";
import sellerRouter from "./models/seller.js";
import sellerprofileRouter from "./models/seller-profile.js";
import rsellerRouter from "./models/rate.js";
import statsRouter from "./models/stats.js";
import userRatingRouter from "./models/userRating.js";

// ===== CHAT SYSTEM =====
import sendMessageRouter from "./models/message.js";
import chatHistoryRouter from "./models/history.js";
import markReadRouter from "./models/markmsg.js";
import productBuyersRouter from "./models/productBuyers.js";
import unseenMsgCountRouter from "./models/unseenMsgCount.js";
import getUserIdRouter from "./models/getUserId.js";

// ===== WALLET & BIDDING SYSTEM =====
import bidRouter from "./models/bid.js";
import timeRouter from "./models/time.js";
import walletRouter from "./models/wallet.js";

// ===== GOOGLE AUTH =====
import googleAuth from "./auth/googleAuth.js";

// ===== APP INIT =====
dotenv.config();

const app = express();

// ===== ✅ FINAL FIXED CORS CONFIG =====
const corsOptions = {
  origin: (origin, callback) => {
    console.log("Incoming Origin:", origin);

    // Allow requests without origin (Postman, mobile apps)
    if (!origin) return callback(null, true);

    // Allow ALL Vercel deployments
    if (origin.includes("vercel.app")) {
      return callback(null, true);
    }

    // Allow your main production domain (if set)
    if (origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }

    // ✅ TEMP: Allow everything (prevents silent CORS failure)
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Apply CORS globally
app.use(cors(corsOptions));

// Handle preflight requests
app.options("*", cors(corsOptions));

app.use(express.json());

// ===== ROUTES =====
app.use("/signin", signinRouter);
app.use("/login", loginRouter);
app.use("/products", productRouter);
app.use("/add-product", addproductRouter);
app.use("/product", productDetailsRouter);
app.use("/user-products", userproductRouter);
app.use("/seller-products", sellerproductRouter);
app.use("/delete-item", dproductRouter);
app.use("/update-item", eproductRouter);
app.use("/place-bid", bidBalanceRouter);
app.use("/wishlist", wproductRouter);
app.use("/dwishlist", dwproductRouter);
app.use("/iwishlist", iwproductRouter);
app.use("/seller", sellerRouter);
app.use("/seller-profile", sellerprofileRouter);
app.use("/rate-seller", rsellerRouter);
app.use("/stats", statsRouter);
app.use("/user-rating", userRatingRouter);

// ===== CHAT SYSTEM ROUTES =====
app.use("/send-message", sendMessageRouter);
app.use("/chat", chatHistoryRouter);
app.use("/mark-read", markReadRouter);
app.use("/product-buyers", productBuyersRouter);
app.use("/unseen-msg-count", unseenMsgCountRouter);
app.use("/get-userid", getUserIdRouter);

// ===== WALLET & BIDDING ROUTES =====
app.use("/auth/google", googleAuth);
app.use("/bid", bidRouter);
app.use("/time", timeRouter);
app.use("/wallet", walletRouter);

// ===== GLOBAL ERROR HANDLER =====
app.use((err, req, res, next) => {
  console.error("ERROR:", err.message);
  res.status(500).json({ error: err.message || 'Something went wrong!' });
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
