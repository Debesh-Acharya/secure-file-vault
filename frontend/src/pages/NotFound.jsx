import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-indigo-600 mb-4">404</h1>
        <h2 className="text-3xl font-light text-white mb-6">Page Not Found</h2>
        <p className="text-gray-400 max-w-md mx-auto mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link 
            to="/" 
            className="px-6 py-3 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all flex items-center justify-center"
          >
            <Home size={18} className="mr-2" />
            Back to Home
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-all flex items-center justify-center"
          >
            <ArrowLeft size={18} className="mr-2" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;