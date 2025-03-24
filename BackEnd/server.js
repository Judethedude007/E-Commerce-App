import express from 'express';
import cors from 'cors';

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

app.listen(8081, () => {
    console.log(" Server running on port 8081");
});
