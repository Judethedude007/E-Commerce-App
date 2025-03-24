import React, { useState }  from "react";
import googleLogo from "../assets/google-logo.png";
import { Link, useNavigate } from "react-router-dom";

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
      console.log("Signup Response:", data); // Debugging

      if (data.error) {
        setError(data.error);
      } else {
        setSuccess("Signup successful! Redirecting...");
        localStorage.setItem("username", formData.name); 
        navigate("/"); 
      }
    } catch (err) {
      console.error("Signup Error:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-green-600">
      <div className="bg-white flex flex-col rounded-lg shadow-lg overflow-hidden max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-black mb-2 text-center">Sign Up</h2>
        <p className="text-black mb-3 text-center">Create an account to get started.</p>

        {error && <p className="text-red-500 text-center">{error}</p>}
        {success && <p className="text-green-500 text-center">{success}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
              placeholder="Enter your name"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
              placeholder="Enter your password"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
              placeholder="Re-enter your password"
              required
            />
          </div>
          <button type="submit" className="w-full bg-green-700 text-white py-3 rounded-lg">
            Sign Up
          </button>
        </form>

        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <p className="text-sm mx-2 text-gray-500">or</p>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <button  className="w-full flex items-center justify-center py-2.5 rounded-lg bg-white border-2 border-green-600 text-black box-border hover:bg-green-100 duration-100 ease-in-out">
          <img src={googleLogo} alt="Google" className="w-5 mr-2" /> Sign in with Google
        </button>

        <p className="text-sm text-center text-gray-500 mt-4">
          Already have an account? <Link to="/login" className="text-green-800 underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
