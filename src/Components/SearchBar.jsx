import searchIcon from '../assets/2946467-200.png';

const SearchBar = () => {
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-180 z-10 rounded-2xl shadow-xl">
      <div className="flex items-center w-full h-15">
        <input
          type="text"
          placeholder="Search"
          className="p-4 pb-5 text-xl rounded-l-2xl border-none focus:outline-none focus:ring-0 bg-white w-full h-full flex items-center justify-center"
          spellCheck="false"
        />
        <button
          onClick={() => alert("Search clicked")}
          className="p-2 bg-green-600 text-white rounded-r-2xl hover:bg-green-700 focus:outline-none h-full w-14 flex items-center justify-center"
        >
          <img
            src={searchIcon}
            alt="search icon"
            className="w-6 h-6 transform scale-200"
          />
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
