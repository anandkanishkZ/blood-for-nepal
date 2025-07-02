import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Globe, ChevronDown } from 'lucide-react';

const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'np', name: 'Nepali', nativeName: 'नेपाली' },
    { code: 'mai', name: 'Maithili', nativeName: 'मैथिली' }
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  const handleLanguageChange = (langCode) => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-shadow text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700"
      >
        <Globe className="h-4 w-4" />
        <span>{currentLanguage?.nativeName}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 min-w-[150px]">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                language === lang.code 
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' 
                  : 'text-gray-800 dark:text-white'
              }`}
            >
              <div className="flex flex-col">
                <span className="font-medium">{lang.nativeName}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{lang.name}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;