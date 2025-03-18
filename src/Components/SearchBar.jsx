import searchIcon from '../assets/2946467-200.png';
import { useState } from "react";
import "./SearchBar.css";

const SearchBar = ({ products }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);

  const handleSearch = (event) => {
    const term = event.target.value;
    setSearchTerm(term);
    setFilteredProducts(
      products.filter((p) =>
        p.name.toLowerCase().includes(term.toLowerCase())
      )
    );
  };

  return (
    <div className="search-bar-container">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search"
          className="search-input"
          spellCheck="false"
          value={searchTerm}
          onChange={handleSearch}
        />
        <button
          className="search-button"
        >
          <img src={searchIcon} alt="Search" className="search-icon" />
        </button>
      </div>
      {searchTerm && (
        <ul className="search-results">
          {filteredProducts.map((p) => (
            <li key={p.id} className="search-result-item">
              {p.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
