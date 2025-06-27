import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Droplets, Moon, Sun, User, LogIn, UserPlus, LogOut, UserCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../../../utils/toast';
import LanguageSelector from '../common/LanguageSelector';
import logo from '../../../assets/logo-transparent.png';

const Navbar = ({ isDarkMode, toggleDarkMode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const { t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsUserMenuOpen(false);
      showToast.logout.success();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      showToast.error('Failed to logout. Please try again.');
    }
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-white/30 dark:bg-gray-900/30 shadow-lg backdrop-blur-xl backdrop-saturate-200 border-b border-white/20 dark:border-gray-800/30 transition-all duration-300">
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
            </Link>            <LanguageSelector />            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={toggleUserMenu}
                className="ml-2 p-2 rounded-full text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors duration-200 relative"
                aria-label="User menu"
              >
                {isAuthenticated ? (
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  </div>
                ) : (
                  <User className="h-5 w-5" />
                )}
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 z-50 overflow-hidden border border-gray-200 dark:border-gray-700">
                  {isAuthenticated ? (
                    /* Authenticated User Menu */
                    <div>
                      {/* User Info Header */}
                      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-lg font-semibold shadow-lg">
                            {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {user?.full_name || 'User'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {user?.email || 'user@example.com'}
                            </p>
                            {user?.blood_type && (
                              <div className="flex items-center mt-1">
                                <Droplets className="h-3 w-3 text-red-500 mr-1" />
                                <span className="text-xs font-medium text-red-600 dark:text-red-400">
                                  {user.blood_type}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Menu Items */}
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <UserCircle className="h-4 w-4 mr-3 text-gray-500" />
                          View Profile
                        </Link>
                        <Link
                          to="/dashboard"
                          className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Droplets className="h-4 w-4 mr-3 text-gray-500" />
                          My Donations
                        </Link>
                        <div className="border-t border-gray-100/50 dark:border-gray-700/50 my-1"></div>
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all duration-300"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          Logout
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Guest User Menu */
                    <div className="py-1">
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Sign in to access your account
                        </p>
                      </div>                        <Link
                          to="/login"
                          className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                        <LogIn className="h-4 w-4 mr-3 text-green-500" />
                        Login
                      </Link>                        <Link
                          to="/register"
                          className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                        <UserPlus className="h-4 w-4 mr-3 text-blue-500" />
                        Register
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

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
        <div className="md:hidden bg-white dark:bg-gray-900 px-2 pt-2 pb-3 space-y-1 shadow-2xl border-t border-gray-200 dark:border-gray-700">
          {['/', '/register', '/request', '/find', '/education'].map((path, idx) => (
            <Link
              key={path}
              to={path}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-red-500 dark:hover:bg-gray-800"
            >
              {t(['navHome', 'navRegister', 'navRequest', 'navFind', 'navEducation'][idx])}
            </Link>
          ))}          <Link
            to="/emergency"
            className="block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            {t('navEmergency')}
          </Link>
          
          {/* Mobile User Menu */}
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            {isAuthenticated ? (
              /* Authenticated Mobile Menu */
              <div>
                {/* User Info */}
                <div className="px-3 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg mx-3 mb-2 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-lg">
                      {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {user?.full_name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user?.email || 'user@example.com'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <Link
                  to="/profile"
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-gray-800 transition-all duration-300"
                >
                  <UserCircle className="h-5 w-5 mr-3" />
                  Profile
                </Link>
                <Link
                  to="/dashboard"
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-gray-800 transition-all duration-300"
                >
                  <Droplets className="h-5 w-5 mr-3" />
                  My Donations
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 transition-all duration-300"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Logout
                </button>
              </div>
            ) : (
              /* Guest Mobile Menu */
              <div>
                <Link
                  to="/login"
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-gray-800 transition-all duration-300"
                >
                  <LogIn className="h-5 w-5 mr-3" />
                  Login
                </Link>
                <Link
                  to="/register"
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-gray-800 transition-all duration-300"
                >
                  <UserPlus className="h-5 w-5 mr-3" />
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
