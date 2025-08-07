import React from 'react';
import { useParams } from 'react-router-dom';

const PromptDetail = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-primary-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary-50 mb-4">
            Prompt Detail Page
          </h1>
          <p className="text-primary-300">
            Prompt ID: {id}
          </p>
          <p className="text-primary-400 mt-4">
            This page will show detailed information about a specific prompt, 
            including preview, description, pricing, and purchase options.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PromptDetail;
