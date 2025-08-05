import React from 'react';

const Listings = () => {
  return (
    <div className="p-6 min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      <h1 className="text-3xl font-bold mb-4">Browse Property Listings</h1>
      <p className="text-lg mb-2">
        Find the latest properties listed by trusted agencies and individual sellers.
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Use filters to narrow down results by price, location, and type.
      </p>
    </div>
  );
};

export default Listings;
