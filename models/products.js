const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true }, // URL to image
  mainCategory: {
    type: String,
    enum: ["Supermarket", "Taste"],
    required: true,
  },
  subCategory: { type: String, required: true },
  // e.g., 'Beverages' or 'Pastries'
});

module.exports = mongoose.model("Product", productSchema, "products");
