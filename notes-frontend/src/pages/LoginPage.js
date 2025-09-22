import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";

function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:4000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        alert("Login successful 🎉");
        navigate("/dashboard"); // redirect after login
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Something went wrong. Try again.");
    }
  };

  return (
    <div className="register-page">
      <div className="left-half hidden md:flex flex-col justify-center items-center text-center p-8">
        <img
          src="/images/Rectangle 6.png"
          alt="Blot Background"
          className="blot-img"
        />
        <div className="blot-text">
          <h1 className="blot-title">Welcome Back</h1>
          <p className="blot-subtitle">
            Please enter your credentials to access your notes
          </p>
        </div>
      </div>

      <div className="right-half flex flex-col justify-start items-center p-8">
        <img src="/images/Logo.png" alt="Notes Logo" className="logo-login" />

        <div className="form-card">
          <form className="form-content" onSubmit={handleSubmit}>
            <h2>Login</h2>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <p className="already-account text-center">
              Don’t have an account?{" "}
              <Link to="/register" className="text-link">
                Sign Up
              </Link>
            </p>

            <button type="submit">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
