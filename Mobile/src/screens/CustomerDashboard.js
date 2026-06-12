import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../api/api";

export default function CustomerDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("shop"); // shop, quick_list, orders
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState({}); // { productId: quantity }
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cartVisible, setCartVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash"); // cash, credit
  const [quickListText, setQuickListText] = useState("");
  const [userCredit, setUserCredit] = useState(user.creditBalance || 0);

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    updateCreditBalance();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await API.get("/products");
      setProducts(res.data);
      
      // Extract unique categories
      const cats = ["All", ...new Set(res.data.map(p => p.ProductCategory || "General"))];
      setCategories(cats);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not fetch products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders");
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const updateCreditBalance = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        // Fetch fresh profile details from DB if needed, or stick to login values
        setUserCredit(parsed.creditBalance || 0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateCart = (productId, change) => {
    const product = products.find(p => p._id === productId);
    if (!product) return;

    setCart(prevCart => {
      const currentQty = prevCart[productId] || 0;
      const newQty = currentQty + change;
      
      if (newQty <= 0) {
        const updated = { ...prevCart };
        delete updated[productId];
        return updated;
      }

      if (newQty > product.ProductQuantity) {
        Alert.alert("Out of Stock", `Only ${product.ProductQuantity} units of ${product.ProductName} available.`);
        return prevCart;
      }

      return { ...prevCart, [productId]: newQty };
    });
  };

  const getCartTotal = () => {
    return Object.entries(cart).reduce((total, [productId, qty]) => {
      const product = products.find(p => p._id === productId);
      return total + (product ? product.ProductPrice * qty : 0);
    }, 0);
  };

  const getCartItemCount = () => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  };

  const handleCheckout = async () => {
    if (Object.keys(cart).length === 0) return;

    setLoading(true);
    try {
      const items = Object.entries(cart).map(([productId, qty]) => ({
        product: productId,
        quantity: qty
      }));

      await API.post("/orders", {
        items,
        paymentMethod
      });

      Alert.alert("Success 🎉", "Your order has been placed successfully! The shop owner is packing it.");
      setCart({});
      setCartVisible(false);
      fetchProducts();
      fetchOrders();
      updateCreditBalance();
      setActiveTab("orders");
    } catch (err) {
      console.error(err);
      Alert.alert("Checkout Failed", err.response?.data?.error || "Error placing order.");
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = (orderItems) => {
    const newCart = {};
    let stockAlert = false;

    orderItems.forEach(item => {
      const product = products.find(p => p._id === item.product?._id);
      if (product) {
        const qtyToAdd = Math.min(item.quantity, product.ProductQuantity);
        if (qtyToAdd > 0) {
          newCart[product._id] = qtyToAdd;
        }
        if (qtyToAdd < item.quantity) {
          stockAlert = true;
        }
      }
    });

    setCart(newCart);
    if (stockAlert) {
      Alert.alert("Notice", "Some items were adjusted based on currently available shop stock.");
    } else {
      Alert.alert("Cart Loaded", "Order items added to cart.");
    }
    setCartVisible(true);
  };

  // Smart regex text parser to decode lists like "2 kg sugar, 1 daal"
  const parseQuickList = () => {
    if (!quickListText.trim()) {
      Alert.alert("Empty List", "Please type something before parsing.");
      return;
    }

    const lines = quickListText.split(/[\n,]+/);
    const updatedCart = { ...cart };
    let itemsMatched = 0;

    lines.forEach(line => {
      const trimmed = line.trim().toLowerCase();
      if (!trimmed) return;

      // Extract leading numbers
      const qtyMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*(?:kg|pcs|pkt|packet|liter|ltr)?\s+(.+)$/) 
        || trimmed.match(/^(.+?)\s*-\s*(\d+(?:\.\d+)?)$/) // matches product - quantity
        || trimmed.match(/^(.+?)\s+(\d+(?:\.\d+)?)$/); // matches product quantity

      let qty = 1;
      let query = trimmed;

      if (qtyMatch) {
        if (isNaN(parseFloat(qtyMatch[1]))) {
          // Format was product quantity
          query = qtyMatch[1].trim();
          qty = parseFloat(qtyMatch[2]);
        } else {
          // Format was quantity product
          qty = parseFloat(qtyMatch[1]);
          query = qtyMatch[2].trim();
        }
      }

      // Try to find matching product in catalog
      const matchedProduct = products.find(p => 
        p.ProductName.toLowerCase().includes(query) || 
        query.includes(p.ProductName.toLowerCase())
      );

      if (matchedProduct && matchedProduct.ProductQuantity > 0) {
        const finalQty = Math.min(qty, matchedProduct.ProductQuantity);
        updatedCart[matchedProduct._id] = (updatedCart[matchedProduct._id] || 0) + finalQty;
        itemsMatched++;
      }
    });

    if (itemsMatched > 0) {
      setCart(updatedCart);
      setQuickListText("");
      Alert.alert(
        "List Parsed ✔",
        `Successfully matched ${itemsMatched} items to our shop catalog and added them to your cart!`
      );
      setCartVisible(true);
    } else {
      Alert.alert(
        "No matches found",
        "We couldn't match any items in your list to our current catalog. Please check spellings."
      );
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === "All" || p.ProductCategory === selectedCategory;
    const matchesSearch = p.ProductName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderProductItem = ({ item }) => {
    const cartQty = cart[item._id] || 0;
    const isOutOfStock = item.ProductQuantity <= 0;

    return (
      <View style={styles.productCard}>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.ProductName}</Text>
          <Text style={styles.productCategory}>{item.ProductCategory || "General"}</Text>
          <Text style={styles.productPrice}>${item.ProductPrice.toFixed(2)}</Text>
          {isOutOfStock ? (
            <Text style={styles.outOfStockBadge}>Out of Stock</Text>
          ) : (
            <Text style={styles.stockText}>Available Stock: {item.ProductQuantity}</Text>
          )}
        </View>

        <View style={styles.quantityControls}>
          {cartQty > 0 ? (
            <>
              <TouchableOpacity
                style={styles.qtyButton}
                onPress={() => handleUpdateCart(item._id, -1)}
              >
                <Text style={styles.qtyButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.cartQtyText}>{cartQty}</Text>
            </>
          ) : null}

          <TouchableOpacity
            style={[styles.qtyButton, isOutOfStock && styles.disabledButton]}
            onPress={() => handleUpdateCart(item._id, 1)}
            disabled={isOutOfStock}
          >
            <Text style={styles.qtyButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "pending": return { color: "#d97706", bg: "#fef3c7", label: "🕒 Pending" };
      case "packed": return { color: "#2563eb", bg: "#dbeafe", label: "📦 Packed / Ready" };
      case "out_for_delivery": return { color: "#7c3aed", bg: "#f3e8ff", label: "🛵 Out for Delivery" };
      case "delivered": return { color: "#059669", bg: "#d1fae5", label: "✅ Delivered" };
      case "cancelled": return { color: "#dc2626", bg: "#fee2e2", label: "❌ Cancelled" };
      default: return { color: "#64748b", bg: "#f1f5f9", label: status };
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Hello, {user.name} 👋</Text>
          <Text style={styles.creditText}>Unpaid Balance (Khata): ${userCredit.toFixed(2)}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "shop" && styles.activeTab]}
          onPress={() => setActiveTab("shop")}
        >
          <Text style={[styles.tabText, activeTab === "shop" && styles.activeTabText]}>🛒 Shop</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "quick_list" && styles.activeTab]}
          onPress={() => setActiveTab("quick_list")}
        >
          <Text style={[styles.tabText, activeTab === "quick_list" && styles.activeTabText]}>✍️ Quick List</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "orders" && styles.activeTab]}
          onPress={() => setActiveTab("orders")}
        >
          <Text style={[styles.tabText, activeTab === "orders" && styles.activeTabText]}>📦 Orders</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content Area */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059669" />
        </View>
      ) : (
        <View style={styles.content}>
          
          {/* SHOP TAB */}
          {activeTab === "shop" && (
            <>
              {/* Search Bar */}
              <TextInput
                style={styles.searchBar}
                placeholder="Search products (e.g., Sugar)..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />

              {/* Categories horizontal scroll */}
              <View style={styles.categoriesWrapper}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesList}>
                  {categories.map(cat => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.categoryPill, selectedCategory === cat && styles.activeCategoryPill]}
                      onPress={() => setSelectedCategory(cat)}
                    >
                      <Text style={[styles.categoryText, selectedCategory === cat && styles.activeCategoryText]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Product List */}
              <FlatList
                data={filteredProducts}
                renderItem={renderProductItem}
                keyExtractor={item => item._id}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No items found matching criteria.</Text>
                }
              />
            </>
          )}

          {/* QUICK LIST TAB */}
          {activeTab === "quick_list" && (
            <ScrollView contentContainerStyle={styles.quickListContainer}>
              <Text style={styles.sectionTitle}>Type or Paste Your List</Text>
              <Text style={styles.sectionSubtitle}>
                No need to browse! Type your items line-by-line (e.g., "2 kg Sugar", "1 kg Daal", "2 Soap") and the app will parse them into your cart instantly.
              </Text>
              <TextInput
                style={styles.quickListTextArea}
                multiline
                numberOfLines={8}
                placeholder="Example:&#10;2 kg sugar&#10;1 daal&#10;3 soap"
                value={quickListText}
                onChangeText={setQuickListText}
                textAlignVertical="top"
              />
              <TouchableOpacity style={styles.parseButton} onPress={parseQuickList}>
                <Text style={styles.parseButtonText}>Analyze and Add to Cart</Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          {/* ORDERS TAB */}
          {activeTab === "orders" && (
            <FlatList
              data={orders}
              keyExtractor={item => item._id}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={
                <Text style={styles.emptyText}>You haven't placed any orders yet.</Text>
              }
              renderItem={({ item }) => {
                const statusInfo = getStatusStyle(item.status);
                return (
                  <View style={styles.orderCard}>
                    <View style={styles.orderHeader}>
                      <Text style={styles.orderDate}>
                        {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </Text>
                      <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                        <Text style={[styles.statusText, { color: statusInfo.color }]}>
                          {statusInfo.label}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.orderDivider} />

                    <View style={styles.orderItems}>
                      {item.items.map((it, idx) => (
                        <View key={idx} style={styles.orderItemRow}>
                          <Text style={styles.orderItemDetails}>
                            {it.quantity}x {it.product?.ProductName || "Unknown Product"}
                          </Text>
                          <Text style={styles.orderItemPrice}>
                            ${(it.priceAtOrder * it.quantity).toFixed(2)}
                          </Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.orderDivider} />

                    <View style={styles.orderFooter}>
                      <Text style={styles.orderTotalLabel}>Total Amount: ${item.totalAmount.toFixed(2)}</Text>
                      <Text style={styles.paymentMethodLabel}>Pay via: {item.paymentMethod.toUpperCase()}</Text>
                      <TouchableOpacity
                        style={styles.reorderButton}
                        onPress={() => handleReorder(item.items)}
                      >
                        <Text style={styles.reorderButtonText}>🔁 Reorder List</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }}
            />
          )}

        </View>
      )}

      {/* Floating Cart Button */}
      {getCartItemCount() > 0 && (
        <TouchableOpacity style={styles.cartFloatingButton} onPress={() => setCartVisible(true)}>
          <Text style={styles.cartFloatingText}>
            Review Cart ({getCartItemCount()} items) • ${getCartTotal().toFixed(2)} ➡️
          </Text>
        </TouchableOpacity>
      )}

      {/* Shopping Cart Modal */}
      <Modal visible={cartVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Shopping Cart</Text>
              <TouchableOpacity onPress={() => setCartVisible(false)}>
                <Text style={styles.closeModalText}>Close</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {Object.entries(cart).map(([productId, qty]) => {
                const product = products.find(p => p._id === productId);
                if (!product) return null;

                return (
                  <View key={productId} style={styles.cartItemRow}>
                    <View>
                      <Text style={styles.cartItemName}>{product.ProductName}</Text>
                      <Text style={styles.cartItemSub}>${product.ProductPrice.toFixed(2)} each</Text>
                    </View>
                    <View style={styles.modalQtyControls}>
                      <TouchableOpacity
                        style={styles.modalQtyBtn}
                        onPress={() => handleUpdateCart(productId, -1)}
                      >
                        <Text style={styles.qtyButtonText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.modalQtyText}>{qty}</Text>
                      <TouchableOpacity
                        style={styles.modalQtyBtn}
                        onPress={() => handleUpdateCart(productId, 1)}
                      >
                        <Text style={styles.qtyButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}

              <View style={styles.cartTotalContainer}>
                <Text style={styles.cartTotalLabel}>Total Order Cost:</Text>
                <Text style={styles.cartTotalAmount}>${getCartTotal().toFixed(2)}</Text>
              </View>

              {/* Payment selector */}
              <Text style={styles.paymentSelectorTitle}>Choose Payment Method</Text>
              <View style={styles.paymentSelectorWrapper}>
                <TouchableOpacity
                  style={[styles.paymentMethodCard, paymentMethod === "cash" && styles.activePaymentMethodCard]}
                  onPress={() => setPaymentMethod("cash")}
                >
                  <Text style={[styles.paymentMethodText, paymentMethod === "cash" && styles.activePaymentMethodText]}>
                    💵 Cash on Delivery
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.paymentMethodCard, paymentMethod === "credit" && styles.activePaymentMethodCard]}
                  onPress={() => setPaymentMethod("credit")}
                >
                  <Text style={[styles.paymentMethodText, paymentMethod === "credit" && styles.activePaymentMethodText]}>
                    📒 Add to Khata (Credit)
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.checkoutButtonText}>Place Order Now</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    backgroundColor: "#ffffff",
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: "#e2e8f0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
  },
  creditText: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: "#ef4444",
    fontSize: 14,
    fontWeight: "bold",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderColor: "#e2e8f0",
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 3,
    borderColor: "#059669",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  activeTabText: {
    color: "#059669",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  searchBar: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 12,
  },
  categoriesWrapper: {
    height: 40,
    marginBottom: 12,
  },
  categoriesList: {
    flexDirection: "row",
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: 20,
    marginRight: 8,
  },
  activeCategoryPill: {
    backgroundColor: "#059669",
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },
  activeCategoryText: {
    color: "#ffffff",
  },
  listContainer: {
    paddingBottom: 80,
  },
  productCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f172a",
  },
  productCategory: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#059669",
    marginTop: 6,
  },
  stockText: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 4,
  },
  outOfStockBadge: {
    color: "#ef4444",
    fontSize: 11,
    fontWeight: "bold",
    marginTop: 4,
    backgroundColor: "#fef2f2",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  qtyButton: {
    width: 32,
    height: 32,
    backgroundColor: "#e2e8f0",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 6,
  },
  qtyButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
  },
  disabledButton: {
    opacity: 0.4,
  },
  cartQtyText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f172a",
  },
  emptyText: {
    textAlign: "center",
    color: "#64748b",
    marginTop: 40,
    fontSize: 15,
  },
  quickListContainer: {
    padding: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 18,
    marginBottom: 16,
  },
  quickListTextArea: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
    fontSize: 16,
    color: "#0f172a",
    minHeight: 180,
    marginBottom: 16,
  },
  parseButton: {
    backgroundColor: "#059669",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  parseButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
  cartFloatingButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#059669",
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  cartFloatingText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0f172a",
  },
  closeModalText: {
    color: "#64748b",
    fontSize: 15,
    fontWeight: "600",
  },
  modalScroll: {
    marginBottom: 20,
  },
  cartItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#f1f5f9",
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
  },
  cartItemSub: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },
  modalQtyControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalQtyBtn: {
    width: 28,
    height: 28,
    backgroundColor: "#e2e8f0",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  modalQtyText: {
    fontSize: 14,
    fontWeight: "bold",
    marginHorizontal: 10,
  },
  cartTotalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 2,
    borderColor: "#e2e8f0",
  },
  cartTotalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f172a",
  },
  cartTotalAmount: {
    fontSize: 22,
    fontWeight: "800",
    color: "#059669",
  },
  paymentSelectorTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#0f172a",
    marginTop: 24,
    marginBottom: 10,
  },
  paymentSelectorWrapper: {
    flexDirection: "row",
    gap: 10,
  },
  paymentMethodCard: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  activePaymentMethodCard: {
    backgroundColor: "#d1fae5",
    borderColor: "#059669",
  },
  paymentMethodText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  activePaymentMethodText: {
    color: "#047857",
  },
  checkoutButton: {
    backgroundColor: "#059669",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  checkoutButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  orderCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderDate: {
    fontSize: 13,
    color: "#64748b",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  orderDivider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    my: 10,
    marginVertical: 12,
  },
  orderItems: {
    marginBottom: 4,
  },
  orderItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  orderItemDetails: {
    fontSize: 14,
    color: "#0f172a",
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  orderFooter: {
    marginTop: 6,
  },
  paymentMethodLabel: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
    fontStyle: "italic",
  },
  reorderButton: {
    alignSelf: "flex-end",
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 10,
  },
  reorderButtonText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#334155",
  },
});
