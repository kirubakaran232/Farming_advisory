import React from "react";
import { Link } from "react-router-dom";
import "../assets/styles/Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="logo">
          <span role="img" aria-label="leaf">
            🍃
          </span>{" "}
          Farm
        </div>

        {/* Links */}
        <ul className="nav-links">
          <li>
            <Link to="/home">Home</Link>
          </li>
          <li>
            <Link to="/weather">Weather</Link>
          </li>
          <li>
            <Link to="/pest">Pest</Link>
          </li>
          <li>
            <Link to="/price">Price</Link>
          </li>
          <li>
            <Link to="/chatbot">Chat</Link>
          </li>
          <li>
            <Link to="/soil">Soil</Link>
          </li>
        </ul>

        {/* Button */}
        <Link to="/contact" className="contact-btn">
          Contact us
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
