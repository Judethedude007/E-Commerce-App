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
          localStorage.setItem("username", response.data.user.username);
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
    <div className="flex items-center justify-center min-h-screen bg-green-600 p-4">
      <div className="bg-white flex flex-col rounded-lg shadow-lg overflow-hidden max-w-md w-full p-6 sm:p-10">
        <h2 className="text-2xl font-bold text-black mb-2 text-center">Log In</h2>
        <p className="text-black mb-6 text-center">Welcome back! Please enter your details.</p>

        <form onSubmit={handleSubmit}> 
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input 
              type="email" 
              className="w-full p-3 border rounded-lg" 
              placeholder="Enter your email" 
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Password</label>
            <input 
              type="password" 
              className="w-full p-3 border rounded-lg" 
              placeholder="Enter your password" 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          <div className="flex justify-between text-sm mb-6 mt-3">
            <a href="#" className="text-green-600 hover:text-red-600 transition-colors duration-300">Forgot password?</a>
          </div>
          <button
            type="submit"
            className="w-full bg-green-700 text-white py-3 rounded-lg transition-all duration-300 ease-in-out transform hover:bg-red-800 hover:scale-105 hover:shadow-lg active:scale-95 cursor-pointer"
          >
            Log in
          </button>
        </form>

        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <p className="text-sm mx-2 text-gray-500">or</p>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <button className="w-full flex items-center justify-center py-2.5 rounded-lg bg-white border-2 border-green-600 text-black hover:bg-green-100 duration-100">
          <img src={googleLogo} alt="Google" className="w-5 mr-2" /> Sign in with Google
        </button>

        <p className="text-sm text-center text-gray-500 mt-4">
          Don't have an account?
          <a
            id="signup-link"
            href="/signup"
            onClick={handleSignupClick}
            className="text-green-800 underline hover:text-red-600 transition-colors duration-300 green-drop-effect"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
