import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const ProductSection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const localProducts = axios
      .get("http://localhost:8081/products")
      .then((res) => res.data.products)
      .catch((err) => {
        console.error("Error fetching local products:", err);
        return [];
      });

    const fakeStoreProducts = fetch(
      "https://api.escuelajs.co/api/v1/products"
    )
      .then((res) => res.json())
      .then((data) =>
        data.map((item) => ({
          id: `fake-${item.id}`,
          title: item.title,
          price: item.price,
          category: item.category?.name || "Unknown",
          image_url: item.images[1],
          isFakeStore: true,
        }))
      )
      .catch((err) => {
        console.error("Error fetching fake store products:", err);
        return [];
      });

    Promise.all([localProducts, fakeStoreProducts])
      .then(([local, fakeStore]) => {
        setProducts([...local, ...fakeStore]);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error combining products:", err);
        setError("Failed to load products.");
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center text-xl">Loading products...</div>;
  if (error) return <div className="text-center text-red-500 text-xl">{error}</div>;

  return (
    <div className="container mx-auto px-20 py-12">
      <h2 className="text-3xl font-bold mb-6 text-center">Available Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8">
        {products.map((product) => (
          <Link
            key={product.id}
            to={`/product/${product.id}`}
            state={{ product }}
            className="bg-white shadow-md rounded-lg overflow-hidden cursor-pointer flex flex-col h-[295px]"
          >
            <img src={product.image_url} alt={product.title} className="w-full h-40 object-cover" />
            <div className="p-4 flex flex-col flex-grow">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium truncate" title={product.title}>
                  {product.title}
                </h3>
                <p className="text-gray-500 text-sm truncate text-right" title={product.category}>
                  <span className="font-semibold text-gray-600">Category:</span> {product.category}
                </p>
              </div>
              <p className="text-green-600 font-semibold mt-1">₹{product.price}</p>
              <button className="mt-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
                Contact Seller
              </button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProductSection;
