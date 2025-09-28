import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../assets/styles/Login.css"; // ✅ Import CSS

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/login", {
        email,
        password,
      });

      alert(res.data.message);
      navigate("/home");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed!");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Left side (image + text) */}
        <div className="auth-left"></div>

        {/* Right side (form) */}
        <div className="auth-right">
          <h2>
            Greetings, Harvester! <br />
            <span>Access Your Field</span>
          </h2>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Enter a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">LOGIN</button>
          </form>
          <p>
            Don’t have an account? <Link to="/">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
