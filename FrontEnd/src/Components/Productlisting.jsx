import { useState } from "react";
import { Plus } from "lucide-react";

const ProductListing = () => {
  const [pricingType, setPricingType] = useState("fixed");

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6 mt-6">
      <h2 className="text-2xl font-bold mb-4">List Your Product</h2>

      <div className="flex gap-6">
        <div className="w-32 h-32 border-2 border-dashed flex items-center justify-center text-gray-500 cursor-pointer">
          Upload Image
        </div>

        <div className="flex flex-col gap-3 flex-grow">
          <input type="text" placeholder="Product Name" className="border p-2 rounded" />
          <input type="text" placeholder="Condition (New/Used)" className="border p-2 rounded" />
          <input type="text" placeholder="Location" className="border p-2 rounded" />

          <div className="flex gap-4 mt-3">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="pricing"
                value="fixed"
                checked={pricingType === "fixed"}
                onChange={() => setPricingType("fixed")}
              />
              Fixed Price
            </label>

            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="pricing"
                value="bidding"
                checked={pricingType === "bidding"}
                onChange={() => setPricingType("bidding")}
              />
              Bidding
            </label>
          </div>

          {pricingType === "fixed" ? (
            <input type="number" placeholder="Enter Fixed Price" className="border p-2 rounded" />
          ) : (
            <input type="number" placeholder="Enter Base Price" className="border p-2 rounded" />
          )}

          <button className="mt-4 flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition">
            <Plus size={20} />
            <span className="text-lg">List Product</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductListing;
