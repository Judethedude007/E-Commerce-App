import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ProductListing = () => {
  const [formData, setFormData] = useState({
    title: "",
    condition: "",
    location: "",
    price: "",
    category: "",
    used_time: "", // renamed
    used_years: "", // renamed
    contact_number: "",
    image: null,
    description: "",
  });

  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState(null);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) setUsername(storedUsername);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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

    // Validate required fields
    if (!formData.title || !formData.price) {
        alert("Please fill in all required fields (Title and Price)");
        return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("user_id", username);
    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.description || "");
    formDataToSend.append("condition", formData.condition || "");
    formDataToSend.append("location", formData.location || "");
    formDataToSend.append("price", formData.price);
    formDataToSend.append("category", formData.category || "General");
    formDataToSend.append("used_time", formData.used_time || "");
    formDataToSend.append("used_years", formData.used_years || "");
    formDataToSend.append("contact_number", formData.contact_number || "");
    
    if (formData.image) {
        formDataToSend.append("image", formData.image);
    }

    try {
        console.log("Sending form data:", {
            user_id: username,
            title: formData.title,
            price: formData.price,
            hasImage: !!formData.image
        });

        const res = await axios.post("http://localhost:8081/add-product", formDataToSend, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        if (res.data.message === "Product added successfully") {
            alert("Product listed successfully!");
            setFormData({
                title: "",
                condition: "",
                location: "",
                price: "",
                category: "",
                used_time: "",
                used_years: "",
                contact_number: "",
                image: null,
                description: "",
            });
            setImagePreview(null);
            navigate("/");
        }
    } catch (error) {
        console.error("Error details:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        alert(`Failed to list product: ${error.response?.data?.error || error.message}`);
    }
};

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6 mt-6">
      <h2 className="text-2xl font-bold mb-4 text-center">List Your Product</h2>

      <div className="flex flex-col gap-6">
        <label className="w-40 h-40 border-2 border-dashed flex items-center justify-center text-gray-500 cursor-pointer rounded-lg mx-auto">
          <input type="file" className="hidden" onChange={handleImageChange} />
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
          ) : (
            "Upload Image"
          )}
        </label>

        <div className="flex flex-col gap-4">
          <input type="text" name="title" placeholder="Product Name" className="border p-2 rounded-lg" onChange={handleChange} value={formData.title} />
           <input type="text" name="description" placeholder="Description" className="border p-2 rounded-lg" onChange={handleChange} value={formData.description} />
          <input type="text" name="condition" placeholder="Brand" className="border p-2 rounded-lg" onChange={handleChange} value={formData.condition} />
          <input type="text" name="location" placeholder="Location" className="border p-2 rounded-lg" onChange={handleChange} value={formData.location} />
          <input type="number" name="price" placeholder="Enter Price" className="border p-2 rounded-lg" onChange={handleChange} value={formData.price} />

          {/* Category Selection */}
          <select name="category" className="border p-2 rounded-lg" onChange={handleChange} value={formData.category}>
            <option value="">Select Category</option>
            <option value="Electronics">Electronics</option>
            <option value="Clothes">Clothes</option>
            <option value="Furniture">Furniture</option>
            <option value="Books">Books</option>
            <option value="Sports">Sports</option>
          </select>

          {/* Used Duration Input */}
          <div className="flex gap-2">
            <input
              type="number"
              name="used_time" //renamed
              placeholder="Enter Used Time"
              className="border p-2 rounded-lg flex-grow"
              onChange={handleChange}
              value={formData.used_time}
            />
            <select name="used_years"  //renamed
              className="border p-2 rounded-lg" onChange={handleChange} value={formData.used_years}>
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
              <option value="months">Months</option>
              <option value="years">Years</option>
            </select>
          </div>

          {/* Contact Number Input */}
          <input
            type="number"
            name="contact_number" //Corrected: contactNumber -> contact_number
            placeholder="Enter Contact Number"
            className="border p-2 rounded-lg"
            onChange={handleChange}
            value={formData.contact_number}
          />

          {/* Submit Button */}
          <button onClick={handleSubmit} className="mt-4 flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition w-full justify-center">
            <Plus size={20} />
            <span className="text-lg">List Product</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductListing;