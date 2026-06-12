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
import API from "../api/api";

export default function ShopkeeperDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("orders"); // orders, inventory, ledger
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(false);

  // Add Product Modal States
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductBarcode, setNewProductBarcode] = useState("");
  const [newProductQty, setNewProductQty] = useState("10");
  const [newProductCategory, setNewProductCategory] = useState("Grains");

  // Payment Modal States
  const [payModalVisible, setPayModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");

  useEffect(() => {
    fetchOrders();
    fetchProducts();
    fetchLedger();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders");
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await API.get("/products");
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLedger = async () => {
    try {
      const res = await API.get("/ledger");
      setLedger(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setLoading(true);
    try {
      await API.put(`/orders/${orderId}/status`, { status: newStatus });
      Alert.alert("Status Updated", `Order marked as ${newStatus.replace(/_/g, " ")}.`);
      fetchOrders();
      fetchLedger(); // update credit balance if cancelled
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to update order status.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!newProductName || !newProductPrice || !newProductBarcode) {
      Alert.alert("Fields Required", "Name, Price, and Barcode are required.");
      return;
    }

    setLoading(true);
    try {
      await API.post("/insertproduct", {
        ProductName: newProductName,
        ProductPrice: parseFloat(newProductPrice),
        ProductBarcode: newProductBarcode,
        ProductQuantity: parseInt(newProductQty) || 0,
        ProductCategory: newProductCategory,
      });

      Alert.alert("Success", "Product added to shop inventory.");
      setAddModalVisible(false);
      
      // Clear inputs
      setNewProductName("");
      setNewProductPrice("");
      setNewProductBarcode("");
      setNewProductQty("10");
      setNewProductCategory("Grains");

      fetchProducts();
    } catch (err) {
      console.error(err);
      Alert.alert("Failed", err.response?.data?.error || "Error adding product.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (productId, currentQty, change) => {
    const newQty = Math.max(0, currentQty + change);
    try {
      await API.put(`/updateproduct/${productId}`, {
        ProductQuantity: newQty
      });
      fetchProducts();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not update stock.");
    }
  };

  const handleRecordPayment = async () => {
    if (!selectedCustomer || !paymentAmount || parseFloat(paymentAmount) <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid cash payment amount.");
      return;
    }

    setLoading(true);
    try {
      await API.put(`/ledger/${selectedCustomer._id}/pay`, {
        amount: parseFloat(paymentAmount)
      });
      
      Alert.alert("Payment Recorded", `Payment of $${paymentAmount} has been applied to ${selectedCustomer.name}'s balance.`);
      setPayModalVisible(false);
      setPaymentAmount("");
      setSelectedCustomer(null);
      fetchLedger();
    } catch (err) {
      console.error(err);
      Alert.alert("Failed", "Error saving payment.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "pending": return { color: "#d97706", bg: "#fef3c7", label: "🕒 Pending" };
      case "packed": return { color: "#2563eb", bg: "#dbeafe", label: "📦 Packed" };
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
          <Text style={styles.welcomeText}>Store Owner Dashboard 🏪</Text>
          <Text style={styles.creditText}>Welcome back, {user.name}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Navigation tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "orders" && styles.activeTab]}
          onPress={() => { setActiveTab("orders"); fetchOrders(); }}
        >
          <Text style={[styles.tabText, activeTab === "orders" && styles.activeTabText]}> Live Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "inventory" && styles.activeTab]}
          onPress={() => { setActiveTab("inventory"); fetchProducts(); }}
        >
          <Text style={[styles.tabText, activeTab === "inventory" && styles.activeTabText]}> Stock Manager</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "ledger" && styles.activeTab]}
          onPress={() => { setActiveTab("ledger"); fetchLedger(); }}
        >
          <Text style={[styles.tabText, activeTab === "ledger" && styles.activeTabText]}> Khata Ledger</Text>
        </TouchableOpacity>
      </View>

      {/* Main Body */}
      {loading && orders.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059669" />
        </View>
      ) : (
        <View style={styles.content}>

          {/* ACTIVE ORDERS */}
          {activeTab === "orders" && (
            <FlatList
              data={orders}
              keyExtractor={item => item._id}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No customer orders placed yet.</Text>
              }
              renderItem={({ item }) => {
                const statusInfo = getStatusStyle(item.status);
                const isCompleted = item.status === "delivered" || item.status === "cancelled";
                
                return (
                  <View style={styles.orderCard}>
                    <View style={styles.orderHeader}>
                      <View>
                        <Text style={styles.customerName}>{item.customer?.name || "Customer"}</Text>
                        <Text style={styles.customerPhone}>📞 {item.customer?.phone || "N/A"}</Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                        <Text style={[styles.statusText, { color: statusInfo.color }]}>
                          {statusInfo.label}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.orderDivider} />

                    {/* Order items */}
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
                      <View>
                        <Text style={styles.orderTotalLabel}>Total: ${item.totalAmount.toFixed(2)}</Text>
                        <Text style={styles.paymentMethodLabel}>Pay via: {item.paymentMethod.toUpperCase()}</Text>
                      </View>

                      {/* Status toggle buttons */}
                      {!isCompleted && (
                        <View style={styles.actionButtonsRow}>
                          {item.status === "pending" && (
                            <TouchableOpacity
                              style={[styles.actionBtn, styles.packBtn]}
                              onPress={() => handleUpdateOrderStatus(item._id, "packed")}
                            >
                              <Text style={styles.actionBtnText}>Pack</Text>
                            </TouchableOpacity>
                          )}

                          {item.status === "packed" && (
                            <TouchableOpacity
                              style={[styles.actionBtn, styles.dispatchBtn]}
                              onPress={() => handleUpdateOrderStatus(item._id, "out_for_delivery")}
                            >
                              <Text style={styles.actionBtnText}>Dispatch</Text>
                            </TouchableOpacity>
                          )}

                          {item.status === "out_for_delivery" && (
                            <TouchableOpacity
                              style={[styles.actionBtn, styles.deliverBtn]}
                              onPress={() => handleUpdateOrderStatus(item._id, "delivered")}
                            >
                              <Text style={styles.actionBtnText}>Deliver</Text>
                            </TouchableOpacity>
                          )}

                          <TouchableOpacity
                            style={[styles.actionBtn, styles.cancelBtn]}
                            onPress={() => handleUpdateOrderStatus(item._id, "cancelled")}
                          >
                            <Text style={styles.actionBtnText}>Cancel</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                );
              }}
            />
          )}

          {/* STOCK MANAGER */}
          {activeTab === "inventory" && (
            <>
              <TouchableOpacity style={styles.addProductBtn} onPress={() => setAddModalVisible(true)}>
                <Text style={styles.addProductBtnText}>+ Add New Product</Text>
              </TouchableOpacity>

              <FlatList
                data={products}
                keyExtractor={item => item._id}
                contentContainerStyle={styles.listContainer}
                renderItem={({ item }) => (
                  <View style={styles.productCard}>
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>{item.ProductName}</Text>
                      <Text style={styles.productCategory}>Category: {item.ProductCategory}</Text>
                      <Text style={styles.productPrice}>Price: ${item.ProductPrice.toFixed(2)}</Text>
                      <Text style={styles.productBarcode}>Code: {item.ProductBarcode}</Text>
                    </View>

                    <View style={styles.stockControls}>
                      <Text style={styles.stockLabel}>Stock: {item.ProductQuantity}</Text>
                      <View style={styles.stockAdjustRow}>
                        <TouchableOpacity
                          style={styles.adjustBtn}
                          onPress={() => handleUpdateStock(item._id, item.ProductQuantity, -10)}
                        >
                          <Text style={styles.adjustBtnText}>-10</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.adjustBtn}
                          onPress={() => handleUpdateStock(item._id, item.ProductQuantity, -1)}
                        >
                          <Text style={styles.adjustBtnText}>-1</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.adjustBtn, styles.addAdjustBtn]}
                          onPress={() => handleUpdateStock(item._id, item.ProductQuantity, 1)}
                        >
                          <Text style={styles.adjustBtnText}>+1</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.adjustBtn, styles.addAdjustBtn]}
                          onPress={() => handleUpdateStock(item._id, item.ProductQuantity, 10)}
                        >
                          <Text style={styles.adjustBtnText}>+10</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}
              />
            </>
          )}

          {/* KHATA CREDIT LEDGER */}
          {activeTab === "ledger" && (
            <FlatList
              data={ledger}
              keyExtractor={item => item._id}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No customer details loaded.</Text>
              }
              renderItem={({ item }) => (
                <View style={styles.ledgerCard}>
                  <View style={styles.ledgerInfo}>
                    <Text style={styles.ledgerName}>{item.name}</Text>
                    <Text style={styles.ledgerPhone}>📞 {item.phone}</Text>
                    <Text style={styles.ledgerBalanceLabel}>
                      Owes Store:{" "}
                      <Text style={[styles.ledgerBalance, item.creditBalance > 0 && styles.owesMoney]}>
                        ${item.creditBalance.toFixed(2)}
                      </Text>
                    </Text>
                  </View>

                  {item.creditBalance > 0 && (
                    <TouchableOpacity
                      style={styles.payBtn}
                      onPress={() => {
                        setSelectedCustomer(item);
                        setPayModalVisible(true);
                      }}
                    >
                      <Text style={styles.payBtnText}>Record Cash</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            />
          )}

        </View>
      )}

      {/* Add Product Modal */}
      <Modal visible={addModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Product to Inventory</Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                <Text style={styles.closeModalText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formScroll}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Product Name</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Premium White Sugar"
                  value={newProductName}
                  onChangeText={setNewProductName}
                />
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Price ($)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. 1.80"
                    keyboardType="decimal-pad"
                    value={newProductPrice}
                    onChangeText={setNewProductPrice}
                  />
                </View>

                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Initial Stock</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. 50"
                    keyboardType="number-pad"
                    value={newProductQty}
                    onChangeText={setNewProductQty}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Category</Text>
                <View style={styles.categoryPillsRow}>
                  {["Grains", "Spices", "Dairy", "Snacks", "Household"].map(cat => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.catSelectionPill,
                        newProductCategory === cat && styles.activeCatSelectionPill
                      ]}
                      onPress={() => setNewProductCategory(cat)}
                    >
                      <Text
                        style={[
                          styles.catSelectionText,
                          newProductCategory === cat && styles.activeCatSelectionText
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Product Barcode / Item Code</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. 890127138"
                  keyboardType="number-pad"
                  value={newProductBarcode}
                  onChangeText={setNewProductBarcode}
                />
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={handleAddProduct}>
                <Text style={styles.submitBtnText}>Add Product</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Record Payment Ledger Modal */}
      <Modal visible={payModalVisible} animationType="fade" transparent>
        <View style={styles.alertOverlay}>
          <View style={styles.alertBox}>
            <Text style={styles.alertTitle}>Record Credit Payment</Text>
            <Text style={styles.alertSubtitle}>
              Record cash payment received from **{selectedCustomer?.name}**. Current debt is **${selectedCustomer?.creditBalance.toFixed(2)}**.
            </Text>

            <TextInput
              style={styles.alertInput}
              placeholder="Payment Amount ($)"
              keyboardType="decimal-pad"
              value={paymentAmount}
              onChangeText={setPaymentAmount}
            />

            <View style={styles.alertBtnRow}>
              <TouchableOpacity
                style={[styles.alertBtn, styles.alertCancelBtn]}
                onPress={() => {
                  setPayModalVisible(false);
                  setPaymentAmount("");
                }}
              >
                <Text style={styles.alertCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.alertBtn, styles.alertConfirmBtn]} onPress={handleRecordPayment}>
                <Text style={styles.alertConfirmText}>Save Payment</Text>
              </TouchableOpacity>
            </View>
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
  listContainer: {
    paddingBottom: 40,
  },
  emptyText: {
    textAlign: "center",
    color: "#64748b",
    marginTop: 40,
    fontSize: 15,
  },
  orderCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  customerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f172a",
  },
  customerPhone: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
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
    color: "#334155",
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderTotalLabel: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#059669",
  },
  paymentMethodLabel: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
    fontStyle: "italic",
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: 6,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  packBtn: {
    backgroundColor: "#2563eb",
  },
  dispatchBtn: {
    backgroundColor: "#7c3aed",
  },
  deliverBtn: {
    backgroundColor: "#059669",
  },
  cancelBtn: {
    backgroundColor: "#dc2626",
  },
  addProductBtn: {
    backgroundColor: "#059669",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 16,
  },
  addProductBtnText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 15,
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
    borderColor: "#e2e8f0",
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#0f172a",
  },
  productCategory: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  productPrice: {
    fontSize: 13,
    color: "#334155",
    marginTop: 2,
  },
  productBarcode: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 4,
  },
  stockControls: {
    alignItems: "flex-end",
  },
  stockLabel: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 6,
  },
  stockAdjustRow: {
    flexDirection: "row",
    gap: 4,
  },
  adjustBtn: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
  },
  addAdjustBtn: {
    backgroundColor: "#d1fae5",
  },
  adjustBtnText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#334155",
  },
  ledgerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ledgerInfo: {
    flex: 1,
  },
  ledgerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f172a",
  },
  ledgerPhone: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },
  ledgerBalanceLabel: {
    fontSize: 13,
    color: "#334155",
    marginTop: 6,
  },
  ledgerBalance: {
    fontWeight: "bold",
    color: "#64748b",
  },
  owesMoney: {
    color: "#dc2626",
  },
  payBtn: {
    backgroundColor: "#d1fae5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#059669",
  },
  payBtnText: {
    color: "#047857",
    fontWeight: "bold",
    fontSize: 13,
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
  },
  closeModalText: {
    color: "#ef4444",
    fontSize: 15,
    fontWeight: "600",
  },
  formScroll: {
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: "row",
    gap: 12,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    color: "#0f172a",
  },
  categoryPillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  catSelectionPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#f1f5f9",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  activeCatSelectionPill: {
    backgroundColor: "#d1fae5",
    borderColor: "#059669",
  },
  catSelectionText: {
    fontSize: 12,
    color: "#475569",
  },
  activeCatSelectionText: {
    color: "#047857",
    fontWeight: "600",
  },
  submitBtn: {
    backgroundColor: "#059669",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  submitBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "bold",
  },
  alertOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  alertBox: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 320,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 10,
  },
  alertSubtitle: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 18,
    marginBottom: 16,
  },
  alertInput: {
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#0f172a",
    marginBottom: 20,
  },
  alertBtnRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  alertBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  alertCancelBtn: {
    backgroundColor: "#f1f5f9",
  },
  alertConfirmBtn: {
    backgroundColor: "#059669",
  },
  alertCancelText: {
    color: "#475569",
    fontWeight: "600",
  },
  alertConfirmText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
});
