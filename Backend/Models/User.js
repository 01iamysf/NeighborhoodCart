const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            lowercase: true,
            trim: true,
        },
        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ["customer", "shopkeeper"],
            default: "customer",
        },
        creditBalance: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model("User", UserSchema);
module.exports = User;
