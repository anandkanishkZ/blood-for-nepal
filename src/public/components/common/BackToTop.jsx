import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-3 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 group"
          aria-label="Back to top"
        >
          <ChevronUp className="h-6 w-6 transition-transform duration-300 group-hover:-translate-y-1" />
          
          {/* Glassmorphism backdrop */}
          <div className="absolute inset-0 bg-red-600/80 backdrop-blur-sm rounded-full -z-10"></div>
          
          {/* Subtle pulse effect */}
          <div className="absolute inset-0 bg-red-500/30 rounded-full animate-ping opacity-75"></div>
        </button>
      )}
    </>
  );
};

export default BackToTop;
