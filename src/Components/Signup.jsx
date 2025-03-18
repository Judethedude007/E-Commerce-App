import React, { useState } from "react";
import googleLogo from "../assets/google-logo.png";
import { Link, useNavigate } from "react-router-dom";
import "./Signup.css";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("http://localhost:8081/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setSuccess("Signup successful");
        setTimeout(() => navigate("/"), 2000);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  const handleSigninClick = (e) => {
    e.preventDefault();
    const link = document.getElementById("signin-link");
    link.classList.add("active");
    setTimeout(() => {
      navigate("/Signin");
    }, 500);
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2 className="signup-title">Sign Up</h2>
        <p className="signup-subtitle">Create an account to get started.</p>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your name"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your password"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="form-input"
              placeholder="Re-enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className="signup-button"
          >
            Sign Up
          </button>
        </form>

        <div className="divider">
          <div className="divider-line"></div>
          <p className="divider-text">or</p>
          <div className="divider-line"></div>
        </div>

        <button className="google-signin-button">
          <img src={googleLogo} alt="Google" className="google-logo" /> Sign in with Google
        </button>

        <p className="signin-text">
          Already have an account? <a
            id="signin-link"
            href="/Signin"
            onClick={handleSigninClick}
            className="signin-link green-drop-effect"
          >
            Log in
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
