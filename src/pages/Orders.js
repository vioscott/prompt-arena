import React from 'react';

const Orders = () => {
  return (
    <div className="min-h-screen bg-primary-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary-50 mb-4">
            Your Orders
          </h1>
          <p className="text-primary-400 mt-4">
            This page will show the user's order history, including purchased prompts,
            download links, and order status.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Orders;
