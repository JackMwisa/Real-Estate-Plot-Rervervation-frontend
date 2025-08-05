import React, { useState } from 'react';

const AddProperty = () => {
  const [form, setForm] = useState({
    title: '',
    location: '',
    price: '',
    description: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Property submitted:', form);
    // TODO: Send to backend/API
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Add New Property</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Property Title
          </label>
          <input
            type="text"
            name="title"
            id="title"
            value={form.title}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Location
          </label>
          <input
            type="text"
            name="location"
            id="location"
            value={form.location}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Price (USD)
          </label>
          <input
            type="number"
            name="price"
            id="price"
            value={form.price}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            name="description"
            id="description"
            value={form.description}
            onChange={handleChange}
            required
            rows="4"
            className="mt-1 block w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-gray-900 dark:text-white"
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition shadow-sm"
        >
          Submit Property
        </button>
      </form>
    </div>
  );
};

export default AddProperty;
