import React from "react";
import googleLogo from "../assets/google-logo.png";
import { Link } from "react-router-dom";

const Signup = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-green-600">
      <div className="bg-white flex flex-col rounded-lg shadow-lg overflow-hidden max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-black mb-2 text-center">Sign Up</h2>
        <p className="text-black mb-3 text-center">Create an account to get started.</p>

        <form>
          <div className="mb-4">
            <label className="block text-gray-700">Name</label>
            <input type="text" className="w-full p-3 border rounded-lg" placeholder="Enter your name" />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input type="email" className="w-full p-3 border rounded-lg" placeholder="Enter your email" />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Password</label>
            <input type="password" className="w-full p-3 border rounded-lg" placeholder="Enter your password" />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Confirm Password</label>
            <input type="password" className="w-full p-3 border rounded-lg" placeholder="Re-enter your password" />
          </div>
          <button className="w-full bg-green-700 text-white py-3 rounded-lg">Sign Up</button>
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
          Already have an account? <Link to="/Login" className="text-green-800 underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
