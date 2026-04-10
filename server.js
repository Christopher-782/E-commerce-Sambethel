const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const Product = require("./models/products");
require("dotenv").config();

const app = express();

// ✅ CORS must be BEFORE other middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "Origin",
      "X-Requested-With",
    ],
    credentials: false,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  }),
);

// Handle preflight for all routes
app.options("*", cors());

app.use(express.json());
app.use(express.static("public"));

mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log("MONGO IS CONNECTED");
  })
  .catch((err) => {
    console.log(`MONGO CONNECTION FAILED:`, err.message);
  });

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Sambethel Server running on ${PORT}`));
