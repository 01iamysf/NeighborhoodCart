require("dotenv").config();
console.log("DEBUG MONGO_URI:", process.env.MONGO_URI);

const express = require("express");
const cors = require("cors");

const connectToMongo = require("./db");
const router = require("./Routes/router");
const authRoutes = require("./Routes/auth");

const app = express();

// Connect to MongoDB
connectToMongo();

// CORS
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://ims-blush.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.options("*", cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("Neighborhood Cart Backend is running");
});

// Routes
app.use("/auth", authRoutes);
app.use(router);

// Port
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Neighborhood Cart Backend listening on port ${PORT}`);
});
