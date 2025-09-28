import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../assets/styles/Login.css"; // ✅ use same CSS as login

function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/signup", formData);
      alert(res.data.message);
      window.location.href = "/home"; // redirect after signup
    } catch (err) {
      alert("Signup failed! Try again.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Left side (background image + text) */}
        <div className="auth-left">
          <div className="auth-bg"></div>
        </div>

        {/* Right side (form) */}
        <div className="auth-right">
          <h2>
            Plant Your Profile, <br />
            <span>Sign Up</span>
          </h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Name"
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              required
            />
            <button type="submit">Sign Up</button>
          </form>
          <p>
            Don’t have an account? <Link to="/login">login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
