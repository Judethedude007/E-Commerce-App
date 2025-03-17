import { useEffect, useState } from "react";
import axios from "axios";

const ProductSection = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8081/products")
      .then((res) => setProducts(res.data.products))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  return (
    <div className="container mx-auto px-20 py-12">
      <h2 className="text-3xl font-bold mb-6 text-center">Available Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white shadow-md rounded-lg overflow-hidden"
          >
            <img
              src={product.image_url} // Cloudinary URL is already stored in DB
              alt={product.title}
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-medium">{product.title}</h3>
              <div className="flex justify-between items-center text-sm mt-2">
                <p className="text-green-600 font-semibold">₹{product.price}</p>
                <p className="text-gray-500">Category: {product.category}</p>
              </div>
              <button className="mt-3 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
                Contact Seller
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductSection;
