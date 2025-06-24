import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Droplets, Moon, Sun } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSelector from '../common/LanguageSelector';
import logo from '../../../assets/logo-transparent.png';

const Navbar = ({ isDarkMode, toggleDarkMode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useLanguage();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/60 dark:bg-gray-900/60 shadow-md backdrop-blur-md backdrop-saturate-150 border-b border-white/30 dark:border-gray-800/60 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src={logo} 
                alt="Blood For Nepal Logo" 
                className="h-12 w-12 object-contain"
              />
             <span className="ml-2 text-xl font-bold" style={{ color: '#820016' }}>
  Blood For Nepal
</span>

            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {['/', '/register', '/request', '/find', '/education'].map((path, idx) => (
              <Link
                key={path}
                to={path}
                className="text-gray-700 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-500 px-3 py-2 rounded-md text-sm font-medium"
              >
                {t(['navHome', 'navRegister', 'navRequest', 'navFind', 'navEducation'][idx])}
              </Link>
            ))}
            <Link
              to="/emergency"
              className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 px-3 py-2 rounded-md text-sm font-medium"
            >
              {t('navEmergency')}
            </Link>

            <LanguageSelector />

            <button
              onClick={toggleDarkMode}
              className="ml-2 p-2 rounded-full text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              aria-expanded={isMenuOpen}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 px-2 pt-2 pb-3 space-y-1 shadow-lg">
          {['/', '/register', '/request', '/find', '/education'].map((path, idx) => (
            <Link
              key={path}
              to={path}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-red-500 dark:hover:bg-gray-800"
            >
              {t(['navHome', 'navRegister', 'navRequest', 'navFind', 'navEducation'][idx])}
            </Link>
          ))}
          <Link
            to="/emergency"
            className="block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            {t('navEmergency')}
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
