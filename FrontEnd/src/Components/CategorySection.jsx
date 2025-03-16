import furnitureImg from "../assets/sample.jpg";
import clothingImg from "../assets/sample.jpg";
import electronicsImg from "../assets/sample.jpg";
import booksImg from "../assets/sample.jpg";
import sportsImg from "../assets/sample.jpg";
import './CategorySection.css';

const categories = [
  { name: "Furniture", image: furnitureImg },
  { name: "Clothing", image: clothingImg },
  { name: "Electronics", image: electronicsImg },
  { name: "Books", image: booksImg },
  { name: "Sports", image: sportsImg },
];

const CategorySection = () => {
  return (
    <div className="relative py-6.5 bg-gray-900 h-58 mt-16.5">
      <div className="max-w-screen-lg mx-auto grid grid-cols-5 gap-2 sm:gap-6 relative p-2 sm:p-4">
        {categories.map((category, index) => (
          <div
            key={index}
            className="flex flex-col items-center p-1 sm:p-2 w-16 sm:w-40 transform transition-all duration-300 ease-in-out hover:w-full hover:h-full hover:bg-gray-800 hover:rounded-lg flex-grow justify-center cursor-pointer"
          >
            <img
              src={category.image}
              alt={category.name}
              className="w-12 h-12 sm:w-24 sm:h-24 object-cover mb-2 sm:mb-3 transition-all duration-300 ease-in-out hover:w-full hover:h-full"
            />
            <span className="text-xs sm:text-lg font-medium text-white">{category.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategorySection;
