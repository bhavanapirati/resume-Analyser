
import React from 'react';

const Welcome: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
      <svg className="w-24 h-24 text-brand-secondary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
      <h2 className="text-2xl font-bold text-base-content mb-2">Welcome to the Resume Relevance Engine</h2>
      <p className="max-w-md text-base-content/70">
        Get instant, AI-powered feedback on how well a resume matches a job description. Simply paste the details in the fields to the left and click 'Check Relevance' to begin.
      </p>
    </div>
  );
};

export default Welcome;
