import furnitureImg from "../assets/sample.jpg";
import clothingImg from "../assets/sample.jpg";
import electronicsImg from "../assets/sample.jpg";
import booksImg from "../assets/sample.jpg";;
import sportsImg from "../assets/sample.jpg";
import './CategorySection.css'
import SearchBar from "./SearchBar";

const categories = [
  { name: "Furniture", image: furnitureImg },
  { name: "Clothing", image: clothingImg },
  { name: "Electronics", image: electronicsImg },
  { name: "Books", image: booksImg },
  { name: "Sports", image: sportsImg },
];

const CategorySection = () => {
  return (
    <div className="relative py-6 bg-gray-900 h-58">
      <SearchBar />
    <div className="max-w-screen-lg mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 relative">
      {categories.map((category, index) => (
        <div key={index} className="flex flex-col items-center p-2 w-40">
          <img src={category.image} alt={category.name} className="w-24 h-24 object-cover mb-3" />
          <span className="text-lg font-medium text-white">{category.name}</span>
        </div>
      ))}
    </div>
  </div>
  );
};

export default CategorySection;
