const express = require("express");
const router = express.Router();
const Products = require("../Models/Products");
const Order = require("../Models/Order");
const User = require("../Models/User");
const authMiddleware = require("./authMiddleware");

// Role checker helper
const checkShopkeeper = (req, res, next) => {
  if (req.user?.role !== "shopkeeper") {
    return res.status(403).json({ error: "Forbidden. Shopkeeper access required." });
  }
  next();
};

// ==========================================
// PRODUCT ROUTES
// ==========================================

// INSERT PRODUCT (Shopkeeper only)
router.post("/insertproduct", authMiddleware, checkShopkeeper, async (req, res) => {
  try {
    const { ProductName, ProductPrice, ProductBarcode, ProductQuantity, ProductCategory } = req.body;

    if (!ProductName || !ProductPrice || !ProductBarcode) {
      return res.status(422).json({ error: "Name, price and barcode are required" });
    }

    const exists = await Products.findOne({ ProductBarcode });
    if (exists) {
      return res.status(422).json({ error: "Product already exists with this barcode" });
    }

    const addProduct = new Products({
      ProductName,
      ProductPrice,
      ProductBarcode,
      ProductQuantity: ProductQuantity || 0,
      ProductCategory: ProductCategory || "General",
      IsAvailable: ProductQuantity > 0,
    });

    await addProduct.save();
    return res.status(201).json(addProduct);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// GET ALL PRODUCTS (Accessible to both shopkeeper and customer)
router.get("/products", authMiddleware, async (req, res) => {
  try {
    const products = await Products.find({});
    return res.status(200).json(products);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// GET SINGLE PRODUCT
router.get("/products/:id", authMiddleware, async (req, res) => {
  try {
    const product = await Products.findById(req.params.id);
    return res.status(200).json(product);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// UPDATE PRODUCT (Shopkeeper only)
router.put("/updateproduct/:id", authMiddleware, checkShopkeeper, async (req, res) => {
  try {
    const { ProductName, ProductPrice, ProductBarcode, ProductQuantity, ProductCategory, IsAvailable } = req.body;
    
    // Auto-update IsAvailable based on quantity if not explicitly provided
    const updateData = { ...req.body };
    if (ProductQuantity !== undefined && IsAvailable === undefined) {
      updateData.IsAvailable = ProductQuantity > 0;
    }

    const updated = await Products.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    return res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// DELETE PRODUCT (Shopkeeper only)
router.delete("/deleteproduct/:id", authMiddleware, checkShopkeeper, async (req, res) => {
  try {
    const deleted = await Products.findByIdAndDelete(req.params.id);
    return res.status(200).json(deleted);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// ==========================================
// ORDER ROUTES
// ==========================================

// PLACE ORDER (Customer only/mostly)
router.post("/orders", authMiddleware, async (req, res) => {
  try {
    const { items, paymentMethod } = req.body; // items: [{ product: id, quantity: number }]

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    let totalAmount = 0;
    const orderItems = [];

    // Verify stock and calculate price
    for (const item of items) {
      const product = await Products.findById(item.product);
      if (!product) {
        return res.status(404).json({ error: `Product not found` });
      }

      if (product.ProductQuantity < item.quantity) {
        return res.status(400).json({ 
          error: `Insufficient stock for ${product.ProductName}. Available: ${product.ProductQuantity}` 
        });
      }

      // Deduct stock
      product.ProductQuantity -= item.quantity;
      if (product.ProductQuantity === 0) {
        product.IsAvailable = false;
      }
      await product.save();

      totalAmount += product.ProductPrice * item.quantity;
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        priceAtOrder: product.ProductPrice
      });
    }

    const newOrder = new Order({
      customer: req.user.userId,
      items: orderItems,
      totalAmount,
      paymentMethod: paymentMethod || "cash",
      status: "pending"
    });

    await newOrder.save();

    // If payment method is "credit" (Khata), update customer's credit balance
    if (paymentMethod === "credit") {
      await User.findByIdAndUpdate(req.user.userId, {
        $inc: { creditBalance: totalAmount }
      });
    }

    return res.status(201).json(newOrder);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error placing order" });
  }
});

// GET ORDERS (All for shopkeeper, user-specific for customer)
router.get("/orders", authMiddleware, async (req, res) => {
  try {
    let orders;
    if (req.user.role === "shopkeeper") {
      // Shopkeeper sees all orders, populated with customer info and product details
      orders = await Order.find({})
        .populate("customer", "name phone creditBalance")
        .populate("items.product", "ProductName ProductCategory ProductBarcode")
        .sort({ createdAt: -1 });
    } else {
      // Customer sees only their own orders
      orders = await Order.find({ customer: req.user.userId })
        .populate("items.product", "ProductName ProductCategory ProductBarcode")
        .sort({ createdAt: -1 });
    }
    return res.status(200).json(orders);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error fetching orders" });
  }
});

// UPDATE ORDER STATUS (Shopkeeper only)
router.put("/orders/:id/status", authMiddleware, checkShopkeeper, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "packed", "out_for_delivery", "delivered", "cancelled"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // If order was credit and is now cancelled, revert credit balance
    if (status === "cancelled" && order.status !== "cancelled" && order.paymentMethod === "credit") {
      await User.findByIdAndUpdate(order.customer, {
        $inc: { creditBalance: -order.totalAmount }
      });
    }

    order.status = status;
    await order.save();

    return res.status(200).json(order);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error updating status" });
  }
});

// ==========================================
// KHATA LEDGER ROUTES (Shopkeeper only)
// ==========================================

// GET CUSTOMERS WITH BALANCES
router.get("/ledger", authMiddleware, checkShopkeeper, async (req, res) => {
  try {
    // Fetch users who are customers
    const customers = await User.find({ role: "customer" }, "name phone creditBalance email")
      .sort({ creditBalance: -1 });
    return res.status(200).json(customers);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error fetching ledger" });
  }
});

// RECORD CUSTOMER PAYMENT (Deductions from creditBalance)
router.put("/ledger/:id/pay", authMiddleware, checkShopkeeper, async (req, res) => {
  try {
    const { amount } = req.body; // Amount paid in cash
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Valid payment amount required" });
    }

    const customer = await User.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    customer.creditBalance = Math.max(0, customer.creditBalance - amount);
    await customer.save();

    return res.status(200).json({ 
      message: "Payment recorded successfully", 
      creditBalance: customer.creditBalance 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error recording payment" });
  }
});

module.exports = router;
