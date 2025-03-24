import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


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
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState(null);
  const [username, setUsername] = useState("");

  
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
  
        
        navigate("/");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to list product.");
    }
  };
  

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6 mt-6">
      <h2 className="text-2xl font-bold mb-4">List Your Product</h2>


      <div className="flex gap-6">
        <label className="w-32 h-32 border-2 border-dashed flex items-center justify-center text-gray-500 cursor-pointer">
          <input type="file" className="hidden" onChange={handleImageChange} />
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded" />
          ) : (
            "Upload Image"
          )}
        </label>


        <div className="flex flex-col gap-3 flex-grow">
          <input type="text" name="title" placeholder="Product Name" className="border p-2 rounded" onChange={handleChange} value={formData.title} />
          <input type="text" name="condition" placeholder="Condition (New/Used)" className="border p-2 rounded" onChange={handleChange} value={formData.condition} />
          <input type="text" name="location" placeholder="Location" className="border p-2 rounded" onChange={handleChange} value={formData.location} />

          
          <div className="flex gap-4 mt-3">
            <label className="flex items-center gap-1">
              <input type="radio" name="pricingType" value="fixed" checked={formData.pricingType === "fixed"} onChange={handleChange} />
              Fixed Price
            </label>

            <label className="flex items-center gap-1">
              <input type="radio" name="pricingType" value="bidding" checked={formData.pricingType === "bidding"} onChange={handleChange} />
              Bidding
            </label>
          </div>

        
          <input
            type="number"
            name="price"
            placeholder={formData.pricingType === "fixed" ? "Enter Fixed Price" : "Enter Base Price"}
            className="border p-2 rounded"
            onChange={handleChange}
            value={formData.price}
          />

          
          <button onClick={handleSubmit} className="mt-4 flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition">
            <Plus size={20} />
            <span className="text-lg">List Product</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductListing;
