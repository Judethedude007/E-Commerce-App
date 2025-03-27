import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import SearchBar from "./SearchBar";
import CategorySection from "./CategorySection";

const ProductSection = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [brandFilter, setBrandFilter] = useState("");
  const [usedTime, setUsedTime] = useState(""); // Changed from number to string for range selection
  const [locationFilter, setLocationFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
  
        const localProducts = await axios.get("http://localhost:8081/products")
          .then((res) => res.data.products.filter(product => product.sale_status !== 1)) // Exclude sold products
          .catch(() => []);
  
        const fakeStoreProducts = await fetch("https://api.escuelajs.co/api/v1/products")
          .then((res) => res.json())
          .then((data) => data.map((item) => ({
            id: `fake-${item.id}`,
            title: item.title,
            price: item.price,
            category: item.category?.name || "Unknown",
            image_url: item.images[1],
            condition: "Unknown",
            used_time: 0,
            used_years: "days",
            location: "Unknown",
            sale_status: 0, // Fake store products are always unsold
          })))
          .catch(() => []);
  
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
    let filtered = [...products];

    if (selectedCategory) {
      filtered = filtered.filter((product) => product.category === selectedCategory);
    }
    if (brandFilter) {
      filtered = filtered.filter((product) => product.condition.toLowerCase().includes(brandFilter.toLowerCase()));
    }
    if (usedTime) {
      filtered = filtered.filter((product) => {
        const totalDays =
          product.used_years === "days" ? product.used_time :
          product.used_years === "weeks" ? product.used_time * 7 :
          product.used_years === "months" ? product.used_time * 30 :
          product.used_years === "years" ? product.used_time * 365 : 0;

        if (usedTime === "<6months") return totalDays < 180;
        if (usedTime === "6months-1year") return totalDays >= 180 && totalDays <= 365;
        if (usedTime === "1year-2year") return totalDays >= 365 && totalDays <= 730;
        if (usedTime === "2year-3year") return totalDays >= 730 && totalDays <= 1095;
        if (usedTime === "3year-4year") return totalDays >= 1095 && totalDays <= 1460;
        if (usedTime === "4year-5year") return totalDays >= 1460 && totalDays <= 1825;
        if (usedTime === ">5year") return totalDays > 1825;

        return true; // Default case if no filter selected
      });
    }
    if (locationFilter) {
      filtered = filtered.filter((product) => product.location.toLowerCase().includes(locationFilter.toLowerCase()));
    }
    setFilteredProducts(filtered);
  }, [selectedCategory, brandFilter, usedTime, locationFilter, products]);

  useEffect(() => {
    if (location.pathname === "/") {
      setSelectedCategory(null);
      setBrandFilter("");
      setUsedTime("");
      setLocationFilter("");
      setFilteredProducts(products);
    }
  }, [location, products]);

  if (loading) return <div className="text-center text-xl">Loading products...</div>;
  if (error) return <div className="text-center text-red-500 text-xl">{error}</div>;

  return (
    <>
      <div className="w-full mb-2">
        <CategorySection setSelectedCategory={setSelectedCategory} />
      </div>
      <div className="container mx-auto py-2">
        <h2 className="text-3xl font-bold mb-4 text-center">Available Products</h2>

        <div className="flex justify-center mb-6 space-x-4">
          <SearchBar products={products} setFilteredProducts={setFilteredProducts} />
          <div className="flex flex-wrap items-center gap-4">
  <input
    type="text"
    placeholder="Brand"
    className="border border-gray-500 p-2 rounded-lg w-40 focus:outline-none focus:ring-2 focus:ring-black"
    value={brandFilter}
    onChange={(e) => setBrandFilter(e.target.value)}
  />

  <select
    className="border border-gray-500 p-2 rounded-lg w-48 focus:outline-none focus:ring-2 focus:ring-black"
    value={usedTime}
    onChange={(e) => setUsedTime(e.target.value)}
  >
    <option value="">Any Used Time</option>
    <option value="<6months">Less than 6 months</option>
    <option value="6months-1year">6 months - 1 year</option>
    <option value="1year-2year">1 year - 2 year</option>
    <option value="2year-3year">2 year - 3 year</option>
    <option value="3year-4year">3 year - 4 year</option>
    <option value="4year-5year">4 year - 5 year</option>
    <option value=">5year">More than 5 year</option>
  </select>

  <input
    type="text"
    placeholder="Location"
    className="border border-gray-500 p-2 rounded-lg w-40 focus:outline-none focus:ring-2 focus:ring-black"
    value={locationFilter}
    onChange={(e) => setLocationFilter(e.target.value)}
  />

  {/* Clear Filters Button */}
  {(brandFilter || usedTime || locationFilter) && (
    <button
      onClick={() => {
        setBrandFilter("");
        setUsedTime("");
        setLocationFilter("");
        setFilteredProducts(products);
      }}
      className="border border-gray-500 px-4 py-2 rounded-lg bg-gray-800 hover:bg-red-900 transition text-white"
    >
      Clear Filters
    </button>
  )}
</div>


        </div>

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
                  <h3 className="text-lg font-medium truncate" title={product.title}>{product.title}</h3>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-gray-900 font-semibold">₹{product.price}</p>
                    <p className="text-gray-500 text-sm truncate" title={product.category}>
                      <span className="font-semibold text-gray-600">Category:</span> {product.category}
                    </p>
                  </div>
                  <button className="mt-2 bg-gray-900 text-white py-2 rounded-lg hover:bg-green-700">
                    View Details
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
