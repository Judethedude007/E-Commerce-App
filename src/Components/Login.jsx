import React from "react";
import googleLogo from "../assets/google-logo.png";
import { Link } from "react-router-dom";

const Login = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-green-600">
      <div className="bg-white flex flex-col rounded-lg shadow-lg overflow-hidden max-w-md w-full p-10">
        <h2 className="text-2xl font-bold text-black mb-2 text-center">Log In</h2>
        <p className="text-black mb-6 text-center">Welcome back! Please enter your details.</p>

        <form>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input type="email" className="w-full p-3 border rounded-lg" placeholder="Enter your email" />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Password</label>
            <input type="password" className="w-full p-3 border rounded-lg" placeholder="Enter your password" />
          </div>
          <div className="flex justify-between text-sm mb-6">
            <a href="#" className="text-green-600">Forgot password?</a>
          </div>
          <button className="w-full bg-green-700 text-white py-3 rounded-lg">Log in</button>
        </form>

        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <p className="text-sm mx-2 text-gray-500">or</p>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <button className="w-full flex items-center justify-center py-2.5 rounded-lg bg-white border-2 border-green-600 text-black box-border hover:bg-green-100 duration-100 ease-in-out">
          <img src={googleLogo} alt="Google" className="w-5 mr-2" /> Sign in with Google
        </button>

        <p className="text-sm text-center text-gray-500 mt-4">
            Don't have an account?
            <Link to="/signup" className="text-green-800 underline">Sign up</Link>
         </p>
      </div>
    </div>
  );
};

export default Login;