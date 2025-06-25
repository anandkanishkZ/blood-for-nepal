import React from 'react';
import { Droplets } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const BloodTypeCard = ({
  type,
  rhFactor,
  count,
  isAvailable = true,
  onClick,
}) => {
  const { t } = useLanguage();
  
  const getTypeText = () => {
    switch(type) {
      case 'A': return t('bloodTypeA');
      case 'B': return t('bloodTypeB');
      case 'AB': return t('bloodTypeAB');
      case 'O': return t('bloodTypeO');
      default: return type;
    }
  };
  
  const typeColor = {
    'A': 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100',
    'B': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100',
    'AB': 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100',
    'O': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100',
  }[type];
  
  return (
    <div 
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center p-4 rounded-lg shadow-sm border ${
        isAvailable 
          ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 cursor-pointer hover:shadow-md transition-shadow' 
          : 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 opacity-75'
      }`}
    >
      <div className={`rounded-full w-14 h-14 flex items-center justify-center ${typeColor}`}>
        <Droplets className="h-8 w-8" />
      </div>
      <div className="mt-3 text-center">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {getTypeText()} {rhFactor}
        </h3>
        {count !== undefined && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {count} {count === 1 ? 'unit' : 'units'}
          </p>
        )}
      </div>
      {!isAvailable && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 rounded-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-white px-2 py-1 rounded bg-gray-100 dark:bg-gray-700">
            Not Available
          </p>
        </div>
      )}
    </div>
  );
};

export default BloodTypeCard;