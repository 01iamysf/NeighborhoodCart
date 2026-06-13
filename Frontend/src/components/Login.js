import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";
import "./Login.css";

function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

  const handleGoogleLogin = (e) => {
    e.preventDefault();
    alert("Google sign-in is not implemented in this demo.");
  };

  const togglePasswordVisibility = (e) => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-page-container">
      {/* Left Column - Sidebar Info & Branding */}
      <div className="login-sidebar">
        {/* Logo */}
        <div className="brand-logo-container">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 9H7C5.34315 9 4 10.3431 4 12V19C4 20.6569 5.34315 22 7 22H17C18.6569 22 20 20.6569 20 19V12C20 10.3431 18.6569 9 17 9Z" fill="#00875a" />
            <path d="M15 9V6C15 4.34315 13.6569 3 12 3C10.3431 3 9 4.34315 9 6V9" stroke="#00875a" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M9 13C9.8 14.5 14.2 14.5 15 13" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <span className="brand-logo-text">Groc<span>Buket</span></span>
        </div>

        {/* Headline & Illustration */}
        <div className="sidebar-main-content">
          <h1 className="sidebar-headline">
            Manage your store.
            <span className="highlight-green">Serve your neighborhood.</span>
          </h1>
          <p className="sidebar-subhead">
            GrocBuket helps local stores manage orders, products and deliveries with ease.
          </p>

          {/* Storefront Illustration */}
          <div className="storefront-illustration-wrapper">
            <svg viewBox="0 0 280 200" width="100%" height="auto" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Skyline Background */}
              <rect x="30" y="80" width="25" height="70" fill="#E2EEE8" rx="2" />
              <rect x="65" y="60" width="30" height="90" fill="#E2EEE8" rx="2" />
              <rect x="100" y="90" width="20" height="60" fill="#E2EEE8" rx="2" />
              <rect x="180" y="75" width="25" height="75" fill="#E2EEE8" rx="2" />
              <rect x="215" y="50" width="35" height="100" fill="#E2EEE8" rx="2" />
              
              <circle cx="50" cy="130" r="15" fill="#E8F4EE" />
              <circle cx="230" cy="130" r="18" fill="#E8F4EE" />

              {/* Main Ground Line */}
              <line x1="10" y1="150" x2="270" y2="150" stroke="#00875a" strokeWidth="4" strokeLinecap="round" />

              {/* Shop Building Body */}
              <rect x="55" y="100" width="170" height="50" fill="#ffffff" stroke="#00875a" strokeWidth="3" />
              
              {/* Shop Window */}
              <rect x="70" y="112" width="60" height="30" fill="#E8F4EE" stroke="#00875a" strokeWidth="2.5" rx="3" />
              <line x1="100" y1="112" x2="100" y2="142" stroke="#00875a" strokeWidth="1.5" />
              
              {/* Shop Door */}
              <rect x="160" y="112" width="35" height="38" fill="#00875a" rx="2" />
              <rect x="167" y="117" width="21" height="15" fill="#E8F4EE" rx="1" />
              <circle cx="165" cy="132" r="2" fill="#ffffff" />
              
              {/* Awning (Roof) */}
              <polygon points="50,102 230,102 220,80 60,80" fill="#00875a" />
              <path d="M60,80 L70,80 L65,102 L53,102 Z" fill="#ffffff" />
              <path d="M85,80 L95,80 L93,102 L81,102 Z" fill="#ffffff" />
              <path d="M110,80 L120,80 L121,102 L109,102 Z" fill="#ffffff" />
              <path d="M135,80 L145,80 L149,102 L137,102 Z" fill="#ffffff" />
              <path d="M160,80 L170,80 L177,102 L165,102 Z" fill="#ffffff" />
              <path d="M185,80 L195,80 L205,102 L193,102 Z" fill="#ffffff" />
              <path d="M210,80 L220,80 L220,102 L215,102 Z" fill="#ffffff" />

              <path d="M 50,102 Q 55,107 60,102 Q 65,107 70,102 Q 75,107 80,102 Q 85,107 90,102 Q 95,107 100,102 Q 105,107 110,102 Q 115,107 120,102 Q 125,107 130,102 Q 135,107 140,102 Q 145,107 150,102 Q 155,107 160,102 Q 165,107 170,102 Q 175,107 180,102 Q 185,107 190,102 Q 195,107 200,102 Q 205,107 210,102 Q 215,107 220,102 Q 225,107 230,102" fill="none" stroke="#00875a" strokeWidth="2.5" />
              
              {/* Signboard */}
              <rect x="90" y="66" width="100" height="20" fill="#00875a" rx="4" stroke="#ffffff" strokeWidth="2" />
              <text x="140" y="80" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="'Times New Roman', Times, serif" textAnchor="middle">YOUR STORE</text>
              
              {/* Plants */}
              <rect x="35" y="140" width="12" height="10" fill="#334155" rx="1" />
              <path d="M41,140 C38,130 32,125 32,120 C32,118 35,118 38,124 C40,128 41,135 41,140 Z" fill="#00875a" />
              <path d="M41,140 C41,130 46,123 48,118 C50,116 52,118 49,124 C46,129 42,135 41,140 Z" fill="#00875a" />
              <path d="M41,140 C41,128 41,120 41,115 C41,112 43,112 43,115 C43,120 42,128 41,140 Z" fill="#00875a" />

              <rect x="233" y="140" width="12" height="10" fill="#334155" rx="1" />
              <path d="M239,140 C236,130 230,125 230,120 C230,118 233,118 236,124 C238,128 239,135 239,140 Z" fill="#00875a" />
              <path d="M239,140 C239,130 244,123 246,118 C248,116 250,118 247,124 C244,129 240,135 239,140 Z" fill="#00875a" />
              <path d="M239,140 C239,128 239,120 239,115 C239,112 241,112 241,115 C241,120 240,128 239,140 Z" fill="#00875a" />
            </svg>
          </div>
        </div>

        {/* Features Checklist */}
        <div className="features-list">
          <div className="feature-item">
            <div className="feature-icon-circle">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 11l2 2 4-4" />
              </svg>
            </div>
            <div className="feature-text-content">
              <h4>Secure & Reliable</h4>
              <p>Your data is safe with us.</p>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon-circle">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 22 2 17 2 7 12 2 22 7 22 17 12 22" />
                <polyline points="2 7 12 12 22 7" />
                <line x1="12" y1="12" x2="12" y2="22" />
              </svg>
            </div>
            <div className="feature-text-content">
              <h4>Easy Store Management</h4>
              <p>Add products, manage orders and more.</p>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon-circle">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            </div>
            <div className="feature-text-content">
              <h4>Grow Your Business</h4>
              <p>Reach more customers in your area.</p>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon-circle">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
              </svg>
            </div>
            <div className="feature-text-content">
              <h4>24/7 Support</h4>
              <p>We're here to help you anytime.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Login Form Card */}
      <div className="login-main-section">
        <div className="login-card-wrapper">
          <div className="login-card">
            {/* Lock Icon Circle */}
            <div className="card-lock-badge">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>

            <h2 className="login-card-title">Welcome Back!</h2>
            <p className="login-card-subtitle">Login to your store account</p>

            <form onSubmit={handleLogin} className="login-form-custom">
              {error && (
                <div className="login-alert-danger" role="alert">
                  {error}
                </div>
              )}

              {/* Phone Input */}
              <div className="form-group-custom">
                <label htmlFor="phone">Phone Number</label>
                <div className="input-icon-wrapper">
                  <svg className="input-icon-prefix" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="input-field-custom"
                    placeholder="Enter your mobile number"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autocomplete="username"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="form-group-custom">
                <label htmlFor="current-password">Password</label>
                <div className="input-icon-wrapper">
                  <svg className="input-icon-prefix" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="current-password"
                    name="password"
                    className="input-field-custom"
                    placeholder="Enter your password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autocomplete="current-password"
                  />
                  <button
                    type="button"
                    className="input-icon-suffix-toggle"
                    onClick={togglePasswordVisibility}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="form-options-row">
                <label className="checkbox-label-custom">
                  <input type="checkbox" className="checkbox-input-custom" />
                  Remember me
                </label>
                <a
                  href="#forgot"
                  className="forgot-password-link"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Password recovery is not implemented in this demo.");
                  }}
                >
                  Forgot password?
                </a>
              </div>

              {/* Login Button */}
              <button type="submit" className="btn-login-custom" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>

              <div className="divider-container">
                <div className="divider-line"></div>
                <span>OR</span>
                <div className="divider-line"></div>
              </div>

              {/* Google Login Button */}
              <button
                type="button"
                className="btn-google-custom"
                onClick={handleGoogleLogin}
              >
                <svg className="google-icon-svg" viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
                <span>Login with Google</span>
              </button>

              {/* Register Prompt */}
              <p className="register-prompt-text">
                Don't have an account?{" "}
                <Link to="/register" className="register-link-custom">
                  Register here
                </Link>
              </p>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="login-footer-text">
          &copy; {new Date().getFullYear()} GrocBuket. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default Login;
