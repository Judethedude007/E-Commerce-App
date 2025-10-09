import furnitureImg from "../assets/beautiful-lcd-cabinet-and-sofa-set-furniture-for-living-area-ipc503.jpeg";
import clothingImg from "../assets/istockphoto-916092484-612x612.jpg";
import electronicsImg from "../assets/modern-stationary-collection-arrangement_23-2149309643.jpg";
import booksImg from "../assets/rptgtpxd-1396254731.jpg";
import sportsImg from "../assets/istockphoto-1136317339-612x612.jpg";
import "./CategorySection.css";

const categories = [
  { name: "Furniture", image: furnitureImg },
  { name: "Clothes", image: clothingImg },
  { name: "Electronics", image: electronicsImg },
  { name: "Books", image: booksImg },
  { name: "Sports", image: sportsImg },
];

const CategorySection = ({ setSelectedCategory }) => {
  return (
    <div className="relative py-6.5 bg-gray-900 h-58 mt-16.5">
      <div className="max-w-screen-lg mx-auto grid grid-cols-5 gap-2 sm:gap-6 p-2 sm:p-4">
        {categories.map((category, index) => (
          <div
            key={index}
            onClick={() => setSelectedCategory(category.name)}
            className="flex flex-col items-center p-1 sm:p-2 w-16 h-full justify-center sm:w-40 transform transition-all duration-300 ease-in-out hover:w-full hover:h-full hover:bg-gray-800 hover:rounded-lg flex-grow cursor-pointer"
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
