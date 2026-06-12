const mongoose = require('mongoose');
const ProductSchema = new mongoose.Schema(
    {
        ProductName: {
            type: String,
            required: true,
        },
        ProductPrice: {
            type: Number,
            required: true,
        },
        ProductBarcode: {
            type: String,
            required: true,
        },
        ProductQuantity: {
            type: Number,
            default: 0,
        },
        ProductCategory: {
            type: String,
            required: true,
            default: "General",
        },
        IsAvailable: {
            type: Boolean,
            default: true,
        },
    });

const Products = mongoose.model("Products", ProductSchema)
module.exports = Products;
