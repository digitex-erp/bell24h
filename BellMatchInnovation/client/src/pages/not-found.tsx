import React from 'react';
import { Link } from 'wouter';

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-5xl font-bold mb-4">404</h1>
      <h2 className="text-2xl font-medium mb-4">Page Not Found</h2>
      <p className="text-neutral-600 mb-8 max-w-md">
        The page you're looking for doesn't exist or has been moved. Please check the URL or navigate back to the home page.
      </p>
      <Link to="/">
        <a className="btn btn-primary px-6 py-3">
          Back to Home
        </a>
      </Link>
    </div>
  );
};

export default NotFound;