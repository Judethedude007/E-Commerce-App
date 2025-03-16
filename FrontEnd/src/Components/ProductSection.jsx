import sampleImage from "../assets/sample.jpg";

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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
      {products.map((product) => (
        <div key={product.id} className="p-6 bg-white rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-110 hover:shadow-2xl hover:-translate-y-2 hover:bg-gray-100">
          <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded-t-lg" />
          <h3 className="text-lg font-medium transition-colors duration-300 hover:text-green-700">
            {product.name}
          </h3>
          <div className="flex justify-between items-center text-sm mt-2">
            <p className="text-green-600 font-semibold transition-transform duration-300 hover:scale-105">
              {product.price}
            </p>
            <p className="text-gray-500 transition-opacity duration-300 hover:opacity-75">
              Posted {product.posted}
            </p>
          </div>
          <button className="mt-3 w-full bg-green-600 text-white py-2 rounded-lg transition-all duration-300 ease-in-out hover:bg-blue-800 hover:scale-110 hover:shadow-2xl hover:cursor-pointer">
            Contact Seller
          </button>
        </div>
      ))}
    </div>
  );
};

export default ProductSection;
