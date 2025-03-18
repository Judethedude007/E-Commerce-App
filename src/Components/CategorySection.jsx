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
    <div className="category-section">
      <div className="category-grid">
        {categories.map((category, index) => (
          <div
            key={index}
            className="category-card"
          >
            <img
              src={category.image}
              alt={category.name}
              className="category-image"
            />
            <span className="category-name">{category.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategorySection;
