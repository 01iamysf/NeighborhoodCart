import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import API from "../api/api";

export default function Products() {
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch logged-in user profile from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isShopkeeper = user.role === "shopkeeper";

  useEffect(() => {
    getProducts();
  }, []);

  const getProducts = async () => {
    setLoading(true);
    try {
      const res = await API.get("/products");

      if (Array.isArray(res.data)) {
        setProductData(res.data);
      } else if (Array.isArray(res.data.products)) {
        setProductData(res.data.products);
      } else {
        setProductData([]);
        console.error("Unexpected API response:", res.data);
      }
    } catch (err) {
      console.error("Error fetching products", err);
      setProductData([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await API.delete(`/deleteproduct/${id}`);
        getProducts();
      } catch (err) {
        console.error("Error deleting product", err);
      }
    }
  };

  return (
    <div className="container-fluid p-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold text-success">Shop Products Catalog</h1>
          <p className="text-muted mb-0">
            {isShopkeeper 
              ? "You are logged in as Store Owner. Manage pricing and stock below." 
              : `Logged in as Customer (${user.name}). Viewing available catalog items.`}
          </p>
        </div>

        {isShopkeeper && (
          <NavLink to="/insertproduct" className="btn btn-primary fs-5">
            + Add New Product
          </NavLink>
        )}
      </div>

      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="overflow-auto mt-3" style={{ maxHeight: "38rem" }}>
          <table className="table table-striped table-hover mt-3 fs-5 shadow-sm">
            <thead>
              <tr className="tr_color">
                <th>#</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Price ($)</th>
                <th>Quantity (Stock)</th>
                <th>Item Code / Barcode</th>
                {isShopkeeper && <th className="text-center">Edit</th>}
                {isShopkeeper && <th className="text-center">Delete</th>}
              </tr>
            </thead>

            <tbody>
              {productData.length > 0 ? (
                productData.map((element, index) => {
                  const isOutOfStock = element.ProductQuantity <= 0;
                  return (
                    <tr key={element._id}>
                      <th>{index + 1}</th>
                      <td className="fw-bold text-slate-800">{element.ProductName}</td>
                      <td>
                        <span className="badge bg-light text-dark border px-2 py-1">
                          {element.ProductCategory || "General"}
                        </span>
                      </td>
                      <td className="fw-bold text-success">${element.ProductPrice.toFixed(2)}</td>
                      <td>
                        {isOutOfStock ? (
                          <span className="badge bg-danger px-2 py-1">Out of Stock</span>
                        ) : (
                          <span className="fw-bold text-dark">{element.ProductQuantity}</span>
                        )}
                      </td>
                      <td><code>{element.ProductBarcode}</code></td>
                      
                      {isShopkeeper && (
                        <td className="text-center">
                          <NavLink
                            to={`/updateproduct/${element._id}`}
                            className="btn btn-sm btn-primary py-1 px-3"
                          >
                            ✏ Edit
                          </NavLink>
                        </td>
                      )}
                      
                      {isShopkeeper && (
                        <td className="text-center">
                          <button
                            className="btn btn-sm btn-danger py-1 px-3 bg-danger border-danger"
                            onClick={() => deleteProduct(element._id)}
                          >
                            🗑 Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={isShopkeeper ? 8 : 6} className="text-center py-4 text-muted">
                    No products found in the catalog.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
