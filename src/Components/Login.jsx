import React, { useState } from "react";
import googleLogo from "../assets/google-logo.png";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    
    axios.post('http://localhost:8081/login', { email, password })
      .then(response => {
        console.log(response.data);
        if (response.data.message) {
          alert("Login Successful");
          localStorage.setItem("username", JSON.stringify(response.data.username)); // Store user data
          navigate("/");
        } else {
          alert("Invalid Credentials");
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        alert("Login Failed. Try Again.");
      });
  }

  const handleSignupClick = (e) => {
    e.preventDefault();
    const link = document.getElementById("signup-link");
    link.classList.add("active");
    setTimeout(() => {
      navigate("/signup");
    }, 500);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Log In</h2>
        <p className="login-subtitle">Welcome back! Please enter your details.</p>

        <form onSubmit={handleSubmit}> 
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="Enter your email" 
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="Enter your password" 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          <div className="form-footer">
            <a href="#" className="forgot-password">Forgot password?</a>
          </div>
          <button
            type="submit"
            className="login-button"
          >
            Log in
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

        <p className="signup-text">
          Don't have an account?
          <a
            id="signup-link"
            href="/signup"
            onClick={handleSignupClick}
            className="signup-link green-drop-effect"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
