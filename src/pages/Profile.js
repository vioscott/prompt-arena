import React from 'react';
import { useParams } from 'react-router-dom';

const Profile = () => {
  const { userId } = useParams();

  return (
    <div className="min-h-screen bg-primary-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary-50 mb-4">
            User Profile Page
          </h1>
          <p className="text-primary-300">
            User ID: {userId}
          </p>
          <p className="text-primary-400 mt-4">
            This page will show user profile information, their prompts, 
            ratings, and other public information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
