import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import axios from "axios";
import "./Productlisting.css";

const ProductListing = () => {
  const [formData, setFormData] = useState({
    title: "",
    condition: "",
    location: "",
    pricingType: "fixed",
    price: "",
    category: "general",
    image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [username, setUsername] = useState("");

  // Get the username from localStorage (set this during login)
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) setUsername(storedUsername);
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image upload & preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!username) {
      alert("Error: User is not logged in!");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("user_id", username); 
    formDataToSend.append("title", formData.title);
    formDataToSend.append("condition", formData.condition);
    formDataToSend.append("location", formData.location);
    formDataToSend.append("price", formData.price);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("image", formData.image);

    try {
      const res = await axios.post("http://localhost:8081/add-product", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.message === "Product added successfully") {
        alert("Product listed successfully!");
        setFormData({
          title: "",
          condition: "",
          location: "",
          pricingType: "fixed",
          price: "",
          category: "general",
          image: null,
        });
        setImagePreview(null);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to list product.");
    }
  };

  return (
    <div className="product-listing-container">
      <h2 className="product-listing-title">List Your Product</h2>

      <div className="product-listing-content">
        {/* Image Upload */}
        <label className="image-upload">
          <input type="file" className="hidden" onChange={handleImageChange} />
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="image-preview" />
          ) : (
            "Upload Image"
          )}
        </label>

        <div className="product-listing-form">
          <input type="text" name="title" placeholder="Product Name" className="form-input" onChange={handleChange} value={formData.title} />
          <input type="text" name="condition" placeholder="Condition (New/Used)" className="form-input" onChange={handleChange} value={formData.condition} />
          <input type="text" name="location" placeholder="Location" className="form-input" onChange={handleChange} value={formData.location} />

          {/* Pricing Type Selection */}
          <div className="pricing-type">
            <label className="pricing-option">
              <input type="radio" name="pricingType" value="fixed" checked={formData.pricingType === "fixed"} onChange={handleChange} />
              Fixed Price
            </label>

            <label className="pricing-option">
              <input type="radio" name="pricingType" value="bidding" checked={formData.pricingType === "bidding"} onChange={handleChange} />
              Bidding
            </label>
          </div>

          {/* Price Input */}
          <input
            type="number"
            name="price"
            placeholder={formData.pricingType === "fixed" ? "Enter Fixed Price" : "Enter Base Price"}
            className="form-input"
            onChange={handleChange}
            value={formData.price}
          />

          {/* Submit Button */}
          <button onClick={handleSubmit} className="submit-button">
            <Plus size={20} />
            <span className="submit-button-text">List Product</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductListing;
