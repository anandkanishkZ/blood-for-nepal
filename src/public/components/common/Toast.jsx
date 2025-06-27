import React, { useState, useEffect } from 'react';

const Toast = ({ 
  message, 
  type = 'info', 
  isVisible, 
  onClose, 
  duration = 4000,
  position = 'top-right' 
}) => {
  const [progress, setProgress] = useState(100);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible && duration > 0) {
      setIsAnimating(true);
      setProgress(100);
      
      // Start the progress animation immediately with smoother updates
      const startTime = Date.now();
      let animationFrame;
      
      const updateProgress = () => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, ((duration - elapsed) / duration) * 100);
        setProgress(remaining);
        
        if (remaining > 0) {
          animationFrame = requestAnimationFrame(updateProgress);
        }
      };
      
      animationFrame = requestAnimationFrame(updateProgress);

      const timer = setTimeout(() => {
        setIsAnimating(false);
        onClose();
      }, duration);

      return () => {
        clearTimeout(timer);
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
      };
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getProgressBarColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'info':
      default:
        return 'bg-blue-500';
    }
  };

  const getToastStyles = () => {
    const baseStyles = "relative w-full max-w-sm bg-white rounded-lg shadow-lg border border-gray-100 transform transition-all duration-300 ease-out";
    const animationClass = isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95';
    return `${baseStyles} ${animationClass}`;
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <div className="w-8 h-8 mr-3 flex-shrink-0 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="w-8 h-8 mr-3 flex-shrink-0 bg-red-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="w-8 h-8 mr-3 flex-shrink-0 bg-yellow-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'info':
      default:
        return (
          <div className="w-8 h-8 mr-3 flex-shrink-0 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className={getToastStyles()}>
      <div className="p-4">
        <div className="flex items-start">
          {getIcon()}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 leading-relaxed">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100 flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Professional countdown progress bar */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-lg overflow-hidden">
          <div 
            className={`h-full ${getProgressBarColor()} transition-all duration-75 ease-linear rounded-b-lg`}
            style={{ 
              width: `${progress}%`,
              transition: 'width 0.075s linear'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Toast;
