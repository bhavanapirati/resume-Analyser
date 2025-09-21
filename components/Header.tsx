
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md w-full sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-3">
            <svg
              className="h-10 w-10 text-brand-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <h1 className="text-2xl font-bold text-base-content">
              InnoMatch <span className="text-brand-secondary font-medium">Resume Engine</span>
            </h1>
          </div>
          <div className="text-sm text-base-content/70 font-medium">
            Powered by Gemini
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
