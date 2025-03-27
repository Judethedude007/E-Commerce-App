import { useState, useEffect } from "react";
import { ArrowLeft, Save } from "lucide-react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const EditProduct = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    condition: "",
    location: "",
    price: "",
    category: "",
    used_time: "",
    used_years: "",
    contact_number: "",
    sale_status: 0, // Default to Unsold
    image: null,
  });

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) setUsername(storedUsername);
  }, []);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const response = await axios.get(`http://localhost:8081/product/${productId}`);
        const product = response.data;
        setFormData({
          title: product.title || "",
          description: product.description || "",
          condition: product.condition || "",
          location: product.location || "",
          price: product.price || "",
          category: product.category || "",
          used_time: product.used_time || "",
          used_years: product.used_years || "",
          contact_number: product.contact_number || "",
          sale_status: product.sale_status || 0, // Ensure it’s a number (0 = Unsold, 1 = Sold)
          image: null,
        });
        if (product.image_url) setImagePreview(product.image_url);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching product:", error);
        alert("Failed to load product data");
        navigate("/sell");
      }
    };
    if (productId) fetchProductData();
  }, [productId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = () => {
    setFormData((prev) => ({ ...prev, sale_status: prev.sale_status === 0 ? 1 : 0 }));
  };

  const handleSubmit = async () => {
    if (!username) {
      alert("Error: User is not logged in!");
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append("user_id", username);
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null) formDataToSend.append(key, formData[key]);
    });

    try {
      const res = await axios.put(`http://localhost:8081/update-item/${productId}`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.message === "Product updated successfully") {
        alert("Product updated successfully!");
        navigate("/Sellitems");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to update product.");
    }
  };

  if (loading) {
    return <div className="max-w-2xl mx-auto p-6 mt-6 text-center">Loading product information...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6 mt-6">
      <div className="flex items-center mb-4">
        <button onClick={() => navigate("/Sellitems")} className="mr-3 p-2 rounded-full hover:bg-gray-100">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold">Edit Your Product</h2>
      </div>
      <label className="w-40 h-40 border-2 border-dashed flex items-center justify-center text-gray-500 cursor-pointer rounded-lg mx-auto">
        <input type="file" className="hidden" onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            setFormData((prev) => ({ ...prev, image: file }));
            setImagePreview(URL.createObjectURL(file));
          }
        }} />
        {imagePreview ? <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" /> : "Upload Image"}
      </label>
      <div className="flex flex-col gap-4 mt-4">
        <input type="text" name="title" placeholder="Product Name" className="border p-2 rounded-lg" onChange={handleChange} value={formData.title} />
        <input type="text" name="description" placeholder="Description" className="border p-2 rounded-lg" onChange={handleChange} value={formData.description} />
        <input type="text" name="condition" placeholder="Condition" className="border p-2 rounded-lg" onChange={handleChange} value={formData.condition} />
        <input type="text" name="location" placeholder="Location" className="border p-2 rounded-lg" onChange={handleChange} value={formData.location} />
        <input type="number" name="price" placeholder="Enter Price" className="border p-2 rounded-lg" onChange={handleChange} value={formData.price} />
        <select name="category" className="border p-2 rounded-lg" onChange={handleChange} value={formData.category}>
          <option value="">Select Category</option>
          <option value="Electronics">Electronics</option>
          <option value="Clothes">Clothes</option>
          <option value="Furniture">Furniture</option>
          <option value="Books">Books</option>
          <option value="Sports">Sports</option>
        </select>
        <div className="flex gap-2">
          <input type="number" name="used_time" placeholder="Enter Used Time" className="border p-2 rounded-lg flex-grow" onChange={handleChange} value={formData.used_time} />
          <select name="used_years" className="border p-2 rounded-lg" onChange={handleChange} value={formData.used_years}>
            <option value="days">Days</option>
            <option value="weeks">Weeks</option>
            <option value="months">Months</option>
            <option value="years">Years</option>
          </select>
        </div>
        <input type="number" name="contact_number" placeholder="Enter Contact Number" className="border p-2 rounded-lg" onChange={handleChange} value={formData.contact_number} />

        {/* Sale Status Checkbox */}
        <div className="flex items-center gap-2">
          <input type="checkbox" id="sale_status" checked={formData.sale_status === 1} onChange={handleCheckboxChange} />
          <label htmlFor="sale_status" className="text-lg">Mark as Sold</label>
        </div>

        <button onClick={handleSubmit} className="mt-4 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition w-full justify-center">
          <Save size={20} />
          <span className="text-lg">Save Changes</span>
        </button>
      </div>
    </div>
  );
};

export default EditProduct;
