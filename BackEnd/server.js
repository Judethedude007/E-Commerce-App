import express from 'express';
import cors from 'cors';
import googleAuth from "./auth/googleAuth.js"; // Updated path
import dotenv from "dotenv";

dotenv.config(); // Load .env variables

const app = express();

app.use(cors());
app.use(express.json());

import signinRouter from "./models/signin.js";
app.use("/signin", signinRouter);

import loginRouter from "./models/login.js";
app.use("/login", loginRouter);

import productRouter from "./models/product.js";
app.use("/products", productRouter);

import addproductRouter from "./models/addproduct.js";
app.use("/add-product", addproductRouter);

import productDetailsRouter from "./models/productDetails.js";  
app.use("/product", productDetailsRouter);  

import userproductRouter from "./models/userproduct.js";
app.use("/user-products", userproductRouter);
import sellerproductRouter from "./models/sellerproduct.js";
app.use("/seller-products", sellerproductRouter);

import dproductRouter from "./models/delete.js";
app.use("/delete-item", dproductRouter);

import eproductRouter from "./models/edit.js";
app.use("/update-item", eproductRouter);

import wproductRouter from "./models/wishlist.js";
app.use("/wishlist", wproductRouter);

import dwproductRouter from "./models/dwishlist.js";
app.use("/dwishlist", dwproductRouter);

import iwproductRouter from "./models/iwishlist.js";
app.use("/iwishlist", iwproductRouter);

import sellerRouter from "./models/seller.js";
app.use("/seller", sellerRouter);

import sellerprofileRouter from "./models/seller-profile.js";
app.use("/seller-profile", sellerprofileRouter);

import rsellerRouter from "./models/rate.js";
app.use("/rate-seller", rsellerRouter);

import statsRouter from "./models/stats.js";
app.use("/stats", statsRouter);

app.use("/auth/google", googleAuth);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(8081, () => {
    console.log("Server running on http://localhost:8081");
});