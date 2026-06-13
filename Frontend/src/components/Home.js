import "./Home.css";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero">
        <h1>📦 Manage Your Inventory, Smarter</h1>
        <p>Track • Update • Control • Grow</p>

        <div className="hero-buttons">
          <button onClick={() => navigate("/products")}>
            View Products
          </button>
          <button
            className="outline"
            onClick={() => navigate("/insertproduct")}
          >
            Add New Product
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Key Features</h2>

        <div className="feature-grid">
          <div className="card">📦 Product Management</div>
          <div className="card">🔄 Real-time Data</div>
          <div className="card">🔍 Quick Search</div>
          <div className="card">🛡 Secure Backend</div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta">
        <h3>Ready to manage your inventory?</h3>
        <button onClick={() => navigate("/products")}>
          Go to Products →
        </button>
      </section>

      {/* Footer Section */}
      <section className="home-footer">
        <p>
          © {new Date().getFullYear()} GrocBuket — Built by Md Yusuf
        </p>
      </section>
    </div>
  );
}

export default Home;
