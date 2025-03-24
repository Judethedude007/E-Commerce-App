import searchIcon from '../assets/2946467-200.png';
import { useState } from "react";

const SearchBar = ({ products }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);

  const handleSearch = (event) => {
    const term = event.target.value;
    setSearchTerm(term);
    setFilteredProducts(
      (products || []).filter((p) =>
        p.name?.toLowerCase().includes(term.toLowerCase())
      )
    );
  };
  

  return (
    <div className="flex items-center w-full max-w-md z-10 rounded-2xl shadow-xl transition-all duration-300 p-2">
      <div className="flex items-center w-full h-10 sm:h-14 bg-black rounded-2xl">
        <input
          type="text"
          placeholder="Search"
          className="p-2 text-sm sm:text-xl text-white bg-black rounded-l-2xl border-none focus:outline-none w-full h-full"
          spellCheck="false"
          value={searchTerm}
          onChange={handleSearch}
        />
        <button
          className="p-2 bg-green-600 text-white rounded-r-2xl hover:bg-green-700 hover:scale-110 hover:cursor-pointer transition-all duration-300 focus:outline-none h-full w-10 sm:w-16 flex items-center justify-center"
        >
          <img src={searchIcon} alt="Search" className="w-4 sm:w-6 h-4 sm:h-6" />
        </button>
      </div>
      {searchTerm && (
        <ul className="absolute top-full mt-2 w-full bg-white shadow-lg rounded-lg p-2">
          {filteredProducts.map((p) => (
            <li key={p.id} className="p-2 hover:bg-gray-100 cursor-pointer">
              {p.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;

