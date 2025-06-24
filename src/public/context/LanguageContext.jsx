import React from 'react';
import { createContext, useState, useContext, ReactNode } from 'react';
import englishTranslations from '../data/translations/en';
import nepaliTranslations from '../data/translations/np';

const LanguageContext = createContext(undefined);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  
  const translations = language === 'en' ? englishTranslations : nepaliTranslations;
  
  const t = (key) => {
    return translations[key] || key;
  };
  
  return (
    <LanguageContext.Provider value={{ language, translations, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};