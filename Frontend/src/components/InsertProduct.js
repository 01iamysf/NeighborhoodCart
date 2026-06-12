import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import API from "../api/api";

export default function InsertProduct() {
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productBarcode, setProductBarcode] = useState("");
  const [productQuantity, setProductQuantity] = useState("10");
  const [productCategory, setProductCategory] = useState("Grains");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const addProduct = async (e) => {
    e.preventDefault();

    if (!productName || !productPrice || !productBarcode) {
      setError("*Please fill in all the required fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await API.post("/insertproduct", {
        ProductName: productName,
        ProductPrice: parseFloat(productPrice),
        ProductBarcode: productBarcode,
        ProductQuantity: parseInt(productQuantity) || 0,
        ProductCategory: productCategory,
      });

      alert("Product inserted successfully");
      navigate("/products");
    } catch (err) {
      if (err.response?.status === 422) {
        setError("Product is already added with this barcode/code.");
      } else {
        setError("An error occurred. Please try again later.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-7">
          <div className="card-custom">
            <h2 className="fw-bold text-success mb-3 text-center">Add Product to Shop</h2>
            <p className="text-muted text-center mb-4">Enter product details, pricing, stock, and barcode code below.</p>

            <form onSubmit={addProduct}>
              {error && (
                <div className="alert alert-danger text-center py-2" role="alert">
                  {error}
                </div>
              )}

              <div className="mb-3">
                <label className="form-label fw-bold text-secondary">Product Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Premium White Sugar (1kg)"
                  required
                />
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold text-secondary">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    placeholder="e.g. 1.80"
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold text-secondary">Initial Stock Quantity</label>
                  <input
                    type="number"
                    className="form-control"
                    value={productQuantity}
                    onChange={(e) => setProductQuantity(e.target.value)}
                    placeholder="e.g. 50"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold text-secondary">Category</label>
                <select
                  className="form-control"
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value)}
                >
                  <option value="Grains">Grains & Flour</option>
                  <option value="Spices">Spices & Salt</option>
                  <option value="Dairy">Dairy & Eggs</option>
                  <option value="Snacks">Snacks & Beverages</option>
                  <option value="Household">Household & Soap</option>
                  <option value="General">General Grocery</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold text-secondary">Product Barcode / Item Code</label>
                <input
                  type="text"
                  className="form-control"
                  value={productBarcode}
                  onChange={(e) => setProductBarcode(e.target.value)}
                  placeholder="e.g. 890123456"
                  required
                />
              </div>

              <div className="d-flex justify-content-between gap-3 mt-4">
                <NavLink to="/products" className="btn btn-outline-light border text-secondary flex-grow-1 text-center py-2">
                  Cancel
                </NavLink>
                <button
                  type="submit"
                  className="btn btn-primary flex-grow-1 py-2"
                  disabled={loading}
                >
                  {loading ? "Adding Item..." : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
