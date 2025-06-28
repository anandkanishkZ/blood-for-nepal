import React from 'react';
import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

const EmergencyButton = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isPressed, setIsPressed] = useState(false);
  
  const handleEmergencyClick = () => {
    setIsPressed(true);
    
    // Redirect to emergency page after short delay to show animation
    setTimeout(() => {
      navigate('/emergency');
    }, 300);
  };
  
  return (
    <button
      onClick={handleEmergencyClick}
      className={`relative transition-all duration-300 ease-in-out transform ${
        isPressed ? 'scale-95' : 'hover:scale-105'
      } group`}
      aria-label="Emergency blood request"
    >
      <div className="absolute inset-0 bg-red-600 rounded-full animate-ping opacity-20 group-hover:opacity-30"></div>
      <div className="relative inline-flex items-center px-6 py-3 text-white bg-red-600 border-2 border-red-700 rounded-full shadow-lg shadow-red-600/20 font-medium">
        <AlertTriangle className="w-5 h-5 mr-2" />
        {t('SOS - Urgent Need')}
      </div>
    </button>
  );
};

export default EmergencyButton;