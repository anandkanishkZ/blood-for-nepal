import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Globe } from 'lucide-react';

const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'np' : 'en');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-shadow text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700"
    >
      <Globe className="h-4 w-4" />
      <span>{language === 'en' ? 'नेपाली' : 'English'}</span>
    </button>
  );
};

export default LanguageSelector;