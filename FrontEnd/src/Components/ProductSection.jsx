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
    <div className="container mx-auto px-20 py-12">
      <h2 className="text-3xl font-bold mb-6 text-center">
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white shadow-md rounded-lg overflow-hidden"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-medium">{product.name}</h3>
              <div className="flex justify-between items-center text-sm mt-2">
                <p className="text-green-600 font-semibold">{product.price}</p>
                <p className="text-gray-500">Posted {product.posted}</p>
              </div>
              <button className="mt-3 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
                Contact Seller
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductSection;
