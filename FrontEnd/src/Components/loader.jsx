const Loader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="flex flex-col items-center rounded-2xl bg-white/70 px-8 py-6 shadow-2xl backdrop-blur-lg">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
        <p className="mt-4 font-medium text-gray-700">Loading products...</p>
      </div>
    </div>
  );
};

export default Loader;
