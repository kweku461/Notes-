import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";

function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  // ✅ Manage messages
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false); // ✅ Prevent multiple clicks
  

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    try {
      setLoading(true); // disable button

      const response = await fetch("https://notes-e7ee.onrender.com/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();
      console.log("Register response:", data);

      if (!response.ok) {
        setErrorMessage(data.message || "Registration failed");
        setLoading(false);
        return;
      }

      // ✅ Save token & user
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // ✅ Success
      setSuccessMessage("Sign up successful! Redirecting to dashboard...");
      setErrorMessage("");

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);

    } catch (err) {
      console.error("Fetch error:", err);
      setErrorMessage("Network error: " + (err.message || err));
    } finally {
      setLoading(false); // re-enable button
    }
  };

  return (
    <div className="register-page">
      <div className="left-half hidden md:flex flex-col justify-center items-center text-center p-8">
        <img src="/images/Rectangle 6.png" alt="Blot Background" className="blot-img"/>
        <div className="blot-text">
          <h1 className="blot-title">Create Your Account</h1>
          <p className="blot-subtitle">
            Turn your ideas into notes, <br /> and your notes to achievements
          </p>
        </div>
      </div>

      <div className="right-half flex flex-col justify-center items-center p-8">
        <img src="/images/Logo.png" alt="Notes Logo" className="logo" />
        <div className="form-card">
          <form className="form-content" onSubmit={handleSubmit}>
            <h2>Sign Up</h2>
            <input
              name="name"
              type="text"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
            />
            <input
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />
            <input
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />
            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />

            {/* ✅ Feedback */}
            {errorMessage && <p className="error-text">{errorMessage}</p>}
            {successMessage && <p className="success-text">{successMessage}</p>}

            <p className="already-account text-center">
              Already have an account?{" "}
              <Link to="/" className="text-link">Log in</Link>
            </p>

            <button type="submit" disabled={loading}>
              {loading ? "Signing Up..." : "Sign Up"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
