import React from 'react';

const BlankPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-gray-800 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-semibold mb-4">Welcome to the Blank Page</h1>
        <p className="text-lg text-gray-600">
          This is a placeholder. Add your content here.
        </p>
      </div>
    </div>
  );
};

export default BlankPage;
