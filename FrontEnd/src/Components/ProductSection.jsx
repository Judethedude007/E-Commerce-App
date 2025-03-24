import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom"; // Import useLocation
import axios from "axios";
import SearchBar from "./SearchBar";
import CategorySection from "./CategorySection";

const ProductSection = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation(); // Detects navigation changes

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const localProductsPromise = axios
          .get("http://localhost:8081/products")
          .then((res) => res.data.products)
          .catch(() => []);

        const fakeStoreProductsPromise = fetch("https://api.escuelajs.co/api/v1/products")
          .then((res) => res.json())
          .then((data) =>
            data.map((item) => ({
              id: `fake-${item.id}`,
              title: item.title,
              price: item.price,
              category: item.category?.name || "Unknown",
              image_url: item.images[1],
            }))
          )
          .catch(() => []);

        const [localProducts, fakeStoreProducts] = await Promise.all([
          localProductsPromise,
          fakeStoreProductsPromise,
        ]);
        const allProducts = [...localProducts, ...fakeStoreProducts];

        setProducts(allProducts);
        setFilteredProducts(allProducts);
      } catch {
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      setFilteredProducts(products.filter((product) => product.category === selectedCategory));
    } else {
      setFilteredProducts(products);
    }
  }, [selectedCategory, products]);

  // Reset filter when Home button ("/") is clicked
  useEffect(() => {
    if (location.pathname === "/") {
      setSelectedCategory(null);
      setFilteredProducts(products);
    }
  }, [location, products]);

  if (loading) return <div className="text-center text-xl">Loading products...</div>;
  if (error) return <div className="text-center text-red-500 text-xl">{error}</div>;

  return (
    <>
      {/* Full-Width Category Section */}
      <div className="w-full mb-2">
    <CategorySection setSelectedCategory={setSelectedCategory} />
  </div>
    <div className="container mx-auto py-2 ">
        <h2 className="text-3xl font-bold mb-4 text-center">Available Products</h2>

        {/* Search Bar */}
        <div className="flex justify-center mb-6">
          <SearchBar products={products} setFilteredProducts={setFilteredProducts} />
        </div>

        {/* Product List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8 px-20">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                state={{ product }}
                className="bg-white shadow-md rounded-lg overflow-hidden cursor-pointer flex flex-col h-[295px]"
              >
                <img src={product.image_url} alt={product.title} className="w-full h-40 object-cover" />

                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="text-lg font-medium truncate" title={product.title}>
                    {product.title}
                  </h3>

                  <div className="flex justify-between items-center mt-1">
                    <p className="text-green-600 font-semibold">₹{product.price}</p>
                    <p className="text-gray-500 text-sm truncate" title={product.category}>
                      <span className="font-semibold text-gray-600">Category:</span> {product.category}
                    </p>
                  </div>

                  <button className="mt-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
                    Contact Seller
                  </button>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-center text-xl text-gray-500 col-span-4">No products found</p>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductSection;
