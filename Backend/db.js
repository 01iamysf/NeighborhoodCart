const mongoose = require("mongoose");
const User = require("./Models/User");
const Products = require("./Models/Products");
const bcrypt = require("bcryptjs");

const seedDatabase = async () => {
  try {
    // 1. Seed Demo Customer
    const customerExists = await User.findOne({ phone: "1234567890" });
    if (!customerExists) {
      const hashedPassword = await bcrypt.hash("password", 10);
      const demoCustomer = new User({
        name: "Demo Customer",
        phone: "1234567890",
        password: hashedPassword,
        role: "customer",
        creditBalance: 15.50, // default demo credit balance
      });
      await demoCustomer.save();
      console.log("Seeded demo customer account: 1234567890 / password");
    }

    // 2. Seed Demo Shopkeeper
    const shopkeeperExists = await User.findOne({ phone: "0987654321" });
    if (!shopkeeperExists) {
      const hashedPassword = await bcrypt.hash("password", 10);
      const demoShopkeeper = new User({
        name: "Demo Shopkeeper",
        phone: "0987654321",
        password: hashedPassword,
        role: "shopkeeper",
      });
      await demoShopkeeper.save();
      console.log("Seeded demo shopkeeper account: 0987654321 / password");
    }

    // 3. Seed Default Products if empty
    const productCount = await Products.countDocuments();
    if (productCount === 0) {
      const defaultProducts = [
        { ProductName: "White Sugar (1kg)", ProductPrice: 1.50, ProductBarcode: "1111", ProductQuantity: 50, ProductCategory: "Grains" },
        { ProductName: "Urad Daal (1kg)", ProductPrice: 2.20, ProductBarcode: "2222", ProductQuantity: 30, ProductCategory: "Grains" },
        { ProductName: "Fresh Milk (1L)", ProductPrice: 0.99, ProductBarcode: "3333", ProductQuantity: 15, ProductCategory: "Dairy" },
        { ProductName: "Bath Soap", ProductPrice: 1.20, ProductBarcode: "4444", ProductQuantity: 40, ProductCategory: "Household" },
        { ProductName: "Potato Chips", ProductPrice: 1.50, ProductBarcode: "5555", ProductQuantity: 25, ProductCategory: "Snacks" },
      ];
      await Products.insertMany(defaultProducts);
      console.log("Seeded default shop inventory items.");
    }
  } catch (err) {
    console.error("Error seeding database:", err.message);
  }
};

const connectToMongo = async () => {
  try {
    mongoose.set("strictQuery", false);

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");
    await seedDatabase();
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
   //  process.exit(1);
  }
};

module.exports = connectToMongo;
