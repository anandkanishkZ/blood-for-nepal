import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatsCard = ({
  title,
  value,
  icon,
  change,
  isPositiveChange = true,
}) => {
  const { t } = useLanguage();
  
  return (
    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0 text-red-600 dark:text-red-500">
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                {t(title) || title}
              </dt>
              <dd>
                <div className="text-lg font-medium text-gray-900 dark:text-white">
                  {value.toLocaleString()}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      {change !== undefined && (
        <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
          <div className="text-sm">
            <span
              className={`font-medium flex items-center gap-1 ${
                isPositiveChange
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {isPositiveChange ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {Math.abs(change)}%
            </span>{' '}
            <span className="text-gray-500 dark:text-gray-400">from last month</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsCard;