import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";

function Register() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await API.post("/auth/register", {
        name,
        phone,
        email: email || undefined,
        password,
        role,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 80px)', padding: '2rem 1rem' }}>
      <div className="w-100" style={{ maxWidth: '450px' }}>
        <div className="card-custom text-center shadow-sm w-100" style={{ marginTop: 0 }}>
            <h2 className="mb-2 fw-bold text-success">Create Account</h2>
            <p className="text-muted mb-4">Register as a customer or local shop owner.</p>

            <form onSubmit={handleRegister}>
              {error && (
                <div className="alert alert-danger py-2" role="alert">
                  {error}
                </div>
              )}

              {/* Role Toggle Selector */}
              <div className="btn-group w-100 mb-4" role="group">
                <button
                  type="button"
                  className={`btn ${role === "customer" ? "btn-primary" : "btn-light border text-secondary"}`}
                  onClick={() => setRole("customer")}
                >
                  🛍️ Customer
                </button>
                <button
                  type="button"
                  className={`btn ${role === "shopkeeper" ? "btn-primary" : "btn-light border text-secondary"}`}
                  onClick={() => setRole("shopkeeper")}
                >
                  🏪 Shop Owner
                </button>
              </div>

              <div className="mb-3 text-start">
                <label className="form-label fw-bold text-secondary">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. John Doe"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="mb-3 text-start">
                <label className="form-label fw-bold text-secondary">Phone Number</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. 1234567890"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="mb-3 text-start">
                <label className="form-label fw-bold text-secondary">Email Address (Optional)</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="e.g. john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="mb-4 text-start">
                <label className="form-label fw-bold text-secondary">Password (Min 6 chars)</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Create password"
                  required
                  minLength="6"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button className="btn btn-primary w-100 py-2 fs-5" disabled={loading}>
                {loading ? "Registering..." : "Register"}
              </button>

              <p className="text-center mt-4 mb-0">
                Already have an account?{" "}
                <Link to="/login" className="text-success fw-bold">
                  Login here
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>

  );
}

export default Register;
