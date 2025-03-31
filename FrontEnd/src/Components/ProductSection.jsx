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
  
        const localProductsResponse = await axios.get("http://localhost:8081/products");
        console.log("Local products response:", localProductsResponse.data);
        
        const localProducts = localProductsResponse.data.products || [];
        console.log("Local products:", localProducts);
  
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
            sale_status: 0,
            seller_name: "Fake Store",
            seller_rating: 0,
            total_ratings: 0
          })))
          .catch((error) => {
            console.error("Error fetching fake store products:", error);
            return [];
          });
  
        const allProducts = [...localProducts, ...fakeStoreProducts];
        console.log("All products:", allProducts);
        setProducts(allProducts);
        setFilteredProducts(allProducts);
      } catch (error) {
        console.error("Error in fetchProducts:", error);
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

  if (loading) {
    return (
        <div className="min-h-screen flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
    );
}
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
                className="bg-white shadow-md rounded-lg overflow-hidden cursor-pointer flex flex-col h-[380px] hover:shadow-lg transition-shadow"
              >
                <div className="relative w-full h-[160px]">
                  <img 
                    src={product.image_url} 
                    alt={product.title} 
                    className="w-full h-full object-cover"
                  />
                  {product.sale_status === 1 && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded">
                      Sold
                    </span>
                  )}
                </div>

                <div className="flex flex-col h-[220px] p-4">
                  <div className="flex-1 min-h-0">
                    {/* Title and Price Row */}
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-medium truncate flex-1 mr-3" title={product.title}>
                        {product.title}
                      </h3>
                      <p className="text-xl font-bold text-green-600 whitespace-nowrap">₹{product.price}</p>
                    </div>

                    {/* Location and Category Row */}
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium w-[70px]">Used for:</span>
                      <span className="truncate">{product.used_time || "0"} {product.used_years || "N/A"}</span>
                      </div>
                      <p className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {product.category}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium w-[70px]">Location:</span>
                      <span className="truncate max-w-[150px]">{product.location || "N/A"}</span>
                      </div>

                      {String(product.id).startsWith('fake-') ? null : (
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center text-gray-600">
                            <span className="font-medium w-[70px]">Seller:</span>
                            <span className="truncate max-w-[100px]">{product.seller_name}</span>
                          </div>
                          <div className="flex items-center bg-yellow-50 px-2 py-1 rounded text-xs">
                            <span className="text-yellow-500 mr-1">⭐</span>
                            <span>{product.seller_rating.toFixed(1)}</span>
                            <span className="text-gray-500 ml-1">({product.total_ratings})</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3">
                    <button className="w-full bg-gray-900 text-white py-2.5 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                      View Details
                    </button>
                  </div>
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
