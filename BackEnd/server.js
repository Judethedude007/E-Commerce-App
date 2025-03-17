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

app.listen(8081, () => {
    console.log(" Server running on port 8081");
});
