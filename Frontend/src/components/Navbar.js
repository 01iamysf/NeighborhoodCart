import React from 'react';
import { useLocation } from 'react-router-dom';

export default function Navbar(props) {
  const location = useLocation();
  const isLoggedIn = localStorage.getItem("token");

  // Hide navbar on login and register pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg bg-danger">
        <div className="container-fluid">

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">

              <li className="nav-item">
                <a className="nav-link active text-white fs-4" href="/">
                  {props.title}
                </a>
              </li>

              <li className="nav-item">
                <a className="nav-link active text-white fs-4" href="/products">
                  Products
                </a>
              </li>

              <li className="nav-item">
                <a className="nav-link active text-white fs-4" href="/about">
                  About
                </a>
              </li>

            </ul>

            <form className="d-flex" role="search">
              <input
                className="form-control me-2"
                type="search"
                placeholder="Search"
                aria-label="Search"
              />
              <button className="btn btn-primary fs-5" type="submit">
                Search
              </button>
            </form>

            {/* Logout button (only when logged in) */}
            {isLoggedIn && (
              <button
                className="btn btn-outline-light ms-3"
                onClick={handleLogout}
              >
                Logout
              </button>
            )}

          </div>
        </div>
      </nav>
    </div>
  );
}
