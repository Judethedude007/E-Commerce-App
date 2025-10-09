import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-100 py-8 mt-5">
      <div className="mx-auto px-6 grid grid-cols-1 md:grid-cols-[3fr_2.5fr_2fr_1.5fr] gap-6 text-gray-700">
        <div>
          <h3 className="text-lg font-semibold">SecondLife</h3>
          <p className="text-sm mt-2">Your trusted marketplace for pre-loved items.</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Quick Links</h3>
          <ul className="mt-2 space-y-2">
            <li><Link to="/about" className="hover:underline">About Us</Link></li>
            <li><a href="#" className="hover:underline">Contact</a></li>
            <li><a href="#" className="hover:underline">Terms of Service</a></li>
            <li><a href="#" className="hover:underline">Privacy Policy</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Categories</h3>
          <ul className="mt-2 space-y-2">
            <li><a href="#" className="hover:underline">Furniture</a></li>
            <li><a href="#" className="hover:underline">Electronics</a></li>
            <li><a href="#" className="hover:underline">Clothing</a></li>
            <li><a href="#" className="hover:underline">Books</a></li>
          </ul>
        </div>
        <div className="md:col-span-1 max-w-[160px]">
          <h3 className="text-lg font-semibold">Follow Us</h3>
          <div className="mt-2 flex space-x-4">
            <a href="#" className="text-gray-600 hover:text-gray-800">📘</a>
            <a href="#" className="text-gray-600 hover:text-gray-800">🐦</a>
            <a href="#" className="text-gray-600 hover:text-gray-800">📷</a>
          </div>
        </div>
      </div>
      <div className="text-center text-sm text-gray-500 mt-6 border-t pt-4">
        © All rights reserved for Jude.
      </div>
    </footer>
  );
};

export default Footer;
