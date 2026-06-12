import React, { useEffect, useState } from "react";
import { NavLink, useParams, useNavigate } from "react-router-dom";
import API from "../api/api";

export default function UpdateProduct() {
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productBarcode, setProductBarcode] = useState("");
  const [productQuantity, setProductQuantity] = useState("");
  const [productCategory, setProductCategory] = useState("General");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch product details
  useEffect(() => {
    const getProduct = async () => {
      try {
        const res = await API.get(`/products/${id}`);
        setProductName(res.data.ProductName);
        setProductPrice(res.data.ProductPrice);
        setProductBarcode(res.data.ProductBarcode);
        setProductQuantity(res.data.ProductQuantity?.toString() || "0");
        setProductCategory(res.data.ProductCategory || "General");
      } catch (err) {
        setError("Failed to load product details.");
        console.error(err);
      }
    };

    getProduct();
  }, [id]);

  // Handle product update
  const updateProduct = async (e) => {
    e.preventDefault();

    if (!productName || !productPrice || !productBarcode) {
      setError("*Please fill in all the required fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await API.put(`/updateproduct/${id}`, {
        ProductName: productName,
        ProductPrice: parseFloat(productPrice),
        ProductBarcode: productBarcode,
        ProductQuantity: parseInt(productQuantity) || 0,
        ProductCategory: productCategory,
      });

      alert("Product updated successfully");
      navigate("/products");
    } catch (err) {
      setError("An error occurred. Please try again later.");
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
            <h2 className="fw-bold text-success mb-3 text-center">Modify Product Details</h2>
            <p className="text-muted text-center mb-4">Edit product pricing, stock count, and catalog categories.</p>

            <form onSubmit={updateProduct}>
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
                  <label className="form-label fw-bold text-secondary">Current Stock Quantity</label>
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
                  {loading ? "Updating Item..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
