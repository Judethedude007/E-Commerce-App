import searchIcon from "../assets/2946467-200.png";
import { useState, useEffect } from "react";

const SearchBar = ({ products = [], setFilteredProducts = () => {} }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredList, setFilteredList] = useState([]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts(products);
      setFilteredList([]);
    } else {
      const filtered = products.filter((p) =>
        p.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
      setFilteredList(filtered);
    }
  }, [searchTerm, products, setFilteredProducts]);

  const handleSelectProduct = (product) => {
    setSearchTerm(product.title); // Keep search input visible
    setFilteredList([]); // Hide dropdown
    document.activeElement.blur(); // Remove focus from input
  };

  return (
    <div className="relative w-full max-w-md z-10 transition-all duration-300 p-2">
      <div className="flex items-center w-full h-10 sm:h-14 bg-black rounded-2xl">
        <input
          type="text"
          placeholder="Search"
          className="p-2 text-sm sm:text-xl text-white bg-black rounded-l-2xl border-none focus:outline-none w-full h-full"
          spellCheck="false"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="p-2 bg-green-600 text-white rounded-r-2xl hover:bg-green-700 hover:scale-110 transition-all duration-300 focus:outline-none h-full w-10 sm:w-16 flex items-center justify-center">
          <img src={searchIcon} alt="Search" className="w-6 sm:w-8 h-6 sm:h-8" />
        </button>
      </div>

      {searchTerm && filteredList.length > 0 && (
        <ul className="absolute top-full left-0 mt-2 w-full bg-white shadow-lg rounded-lg p-2">
          {filteredList.map((p) => (
            <li
              key={p.id}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelectProduct(p)}
            >
              {p.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
