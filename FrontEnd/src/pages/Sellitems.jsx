import { useState } from "react";
import { Plus } from "lucide-react";
import ProductListing from "../Components/Productlisting";

const Sellitems = () => {
  const [showListing, setShowListing] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {!showListing ? (
        <>
          <div className="text-center">
            <p className="text-3xl font-semibold">No items listed</p>
            <p className="text-gray-500">Click 'Create Listing' to list a new item.</p>
          </div>
          <button
            onClick={() => setShowListing(true)}
            className="mt-4 flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-800 transition"
          >
            <Plus size={20} />
            <span className="text-lg">Create Listing</span>
          </button>
        </>
      ) : (
        <ProductListing onCancel={() => setShowListing(false)} />
      )}
    </div>
  );
};

export default Sellitems;
