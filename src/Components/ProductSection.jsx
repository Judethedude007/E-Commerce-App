import sampleImage from "../assets/sample.jpg";
import "./ProductSection.css";

const products = [
  {
    id: 1,
    name: "Vintage Leather Sofa",
    price: "$299",
    posted: "2 days ago",
    image: sampleImage,
  },
  {
    id: 2,
    name: "MacBook Pro 2023",
    price: "$899",
    posted: "1 day ago",
    image: sampleImage,
  },
  {
    id: 3,
    name: "Vintage Denim Jacket",
    price: "$45",
    posted: "3 days ago",
    image: sampleImage,
  },
  {
    id: 4,
    name: "Vintage Record Player",
    price: "$150",
    posted: "5 days ago",
    image: sampleImage,
  },
  {
    id: 5,
    name: "Vintage Record Player",
    price: "$150",
    posted: "5 days ago",
    image: sampleImage,
  },
];

const ProductSection = () => {
  return (
    <div className="product-section">
      {products.map((product) => (
        <div key={product.id} className="product-card">
          <img src={product.image} alt={product.name} className="product-image" />
          <h3 className="product-name">
            {product.name}
          </h3>
          <div className="product-details">
            <p className="product-price">
              {product.price}
            </p>
            <p className="product-posted">
              Posted {product.posted}
            </p>
          </div>
          <button className="contact-seller-button">
            Contact Seller
          </button>
        </div>
      ))}
    </div>
  );
};

export default ProductSection;
