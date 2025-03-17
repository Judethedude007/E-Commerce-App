import { useEffect, useState } from "react";
import axios from "axios";

const ProductSection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);  // Add this line
  const [error, setError] = useState(null);  

  useEffect(() => {
    // Set loading state
    setLoading(true);
    setError(null);

    // Fetch products from your local API
    const localProducts = axios.get("http://localhost:8081/products")
      .then(res => res.data.products)
      .catch(err => {
        console.error("Error fetching local products:", err);
        return [];
      });

    // Fetch products from Fake Store API
    const fakeStoreProducts = fetch("https://fakestoreapi.com/products")
      .then(res => res.json())
      .then(data => {
        // Transform Fake Store API data to match your product format
        return data.map(item => ({
          id: `fake-${item.id}`, // Add prefix to avoid ID conflicts
          title: item.title,
          price: item.price,
          category: item.category,
          image_url: item.image,
          isFakeStore: true // Flag to identify source
        }));
      })
      .catch(err => {
        console.error("Error fetching fake store products:", err);
        return [];
      });

    // Wait for both requests to complete and combine results
    Promise.all([localProducts, fakeStoreProducts])
      .then(([local, fakeStore]) => {
        const combined = [...local, ...fakeStore];
        setProducts(combined);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error combining products:", err);
        setError("Failed to load products. Please try again later.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-20 py-12 text-center">
        <p className="text-xl">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-20 py-12 text-center">
        <p className="text-xl text-red-500">{error}</p>
      </div>
    );
  }



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
              src={product.image_url} 
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
