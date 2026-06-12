import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";

function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await API.post("/auth/login", { phone, password });
      localStorage.setItem("token", res.data.token);
      
      // Store user details in localStorage (to read role if needed)
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your network and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card-custom text-center">
            <h2 className="mb-2 fw-bold text-success">Store Login</h2>
            <p className="text-muted mb-4">Log in to manage items and fulfill delivery orders.</p>

            <form onSubmit={handleLogin}>
              {error && (
                <div className="alert alert-danger py-2" role="alert">
                  {error}
                </div>
              )}

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

              <div className="mb-4 text-start">
                <label className="form-label fw-bold text-secondary">Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button className="btn btn-primary w-100 py-2 fs-5" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>

              <p className="text-center mt-4 mb-0">
                Don't have an account?{" "}
                <Link to="/register" className="text-success fw-bold">
                  Register here
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
