import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Droplets, Moon, Sun, User, LogIn, UserPlus, LogOut, UserCircle, Shield, CornerUpLeft, Users, Home, UserCheck, Heart, BookOpen, Info, Settings } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../../../utils/toast';
import LanguageSelector from '../common/LanguageSelector';
import logo from '../../../assets/logo-transparent.png';

// Helper function to get full avatar URL (same as profile page)
const getFullAvatarUrl = (avatarPath, bustCache = false) => {
  if (!avatarPath) return null;
  if (avatarPath.startsWith('http')) return avatarPath;
  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';
  if (bustCache) {
    const timestamp = new Date().getTime();
    return `${baseUrl}${avatarPath}?t=${timestamp}`;
  }
  return `${baseUrl}${avatarPath}`;
};

const Navbar = ({ isDarkMode, toggleDarkMode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const { t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Utility function to restore body scrolling
  const restoreBodyScrolling = () => {
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
  };

  // Utility function to close menu and restore scrolling
  const closeMenuAndRestoreScroll = () => {
    setIsMenuOpen(false);
    restoreBodyScrolling();
  };

  // Helper function to check if a path is active
  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const toggleMenu = () => {
    const newMenuState = !isMenuOpen;
    setIsMenuOpen(newMenuState);
    
    // Prevent/allow body scrolling when mobile menu is opened/closed
    if (newMenuState) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      restoreBodyScrolling();
    }
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
      showToast.error('Failed to logout. Please try again.');
    }
  };

  const handleReturnToAdmin = () => {
    const adminToken = localStorage.getItem('admin_impersonation_token');
    if (adminToken) {
      localStorage.setItem('token', adminToken);
      localStorage.removeItem('admin_impersonation_token');
      showToast.success('Returned to admin session.');
      window.location.href = '/admin';
    } else {
      showToast.error('No admin session found.');
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

  // Cleanup body scroll lock when component unmounts or menu closes
  useEffect(() => {
    return () => {
      // Restore body scrolling when component unmounts
      restoreBodyScrolling();
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
    // Restore body scrolling when route changes
    restoreBodyScrolling();
  }, [location.pathname]);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
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
          <div className="hidden md:flex items-center space-x-1">
            {[
              { path: '/', label: t('navHome') },
              { path: '/register-donor', label: t('navRegisterDonor') },
              { path: '/request', label: t('navRequestBlood') },
              { path: '/find-donor', label: t('navFindDonor') },
              { path: '/education', label: t('navEducation') },
              { path: '/about', label: t('footerAbout') }
            ].map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActivePath(path)
                    ? 'text-red-600 dark:text-red-400 bg-red-50/80 dark:bg-red-900/20'
                    : 'text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                {label}
                {isActivePath(path) && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-0.5 bg-red-600 dark:bg-red-400 rounded-full"></div>
                )}
              </Link>
            ))}
            <LanguageSelector />
            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={toggleUserMenu}
                className="ml-2 p-2 rounded-full text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors duration-200 relative"
                aria-label="User menu"
              >
                {isAuthenticated ? (
                  <div className="flex items-center">
                    {user?.avatar ? (
                      <img
                        src={getFullAvatarUrl(user.avatar)}
                        alt={user?.full_name || 'User Avatar'}
                        className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className={`w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-sm font-semibold ${user?.avatar ? 'hidden' : ''}`}
                    >
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
                          {user?.avatar ? (
                            <img
                              src={getFullAvatarUrl(user.avatar)}
                              alt={user?.full_name || 'User Avatar'}
                              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-lg"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className={`w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-lg font-semibold shadow-lg ${user?.avatar ? 'hidden' : ''}`}
                          >
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
                          className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-inset"
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
                        {isAuthenticated && user?.role === 'admin' && (
                          <Link
                            to="/admin"
                            className="flex items-center px-4 py-3 text-sm text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900 transition-all duration-300 font-semibold"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Shield className="h-4 w-4 mr-3 text-red-500" />
                            Admin Panel
                          </Link>
                        )}
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
                      </div>
                      <Link
                        to="/login"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <LogIn className="h-4 w-4 mr-3 text-green-500" />
                        Login
                      </Link>
                      <Link
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

      
      <>
        {/* Mobile Navigation Overlay with Enhanced Animations */}
        {isMenuOpen && (
          <div className={`fixed inset-0 z-[9999] md:hidden transition-all duration-500 ease-out ${
            isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}>
        {/* Enhanced Backdrop with Glassmorphism */}
        <div 
          className={`fixed inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70 backdrop-blur-md transition-all duration-500 ease-out ${
            isMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={closeMenuAndRestoreScroll}
        ></div>
        
        {/* Enhanced Sliding Menu with Glassmorphism & Advanced Animations */}
        <div className={`fixed top-0 left-0 h-screen w-80 max-w-[85vw] 
          bg-gradient-to-b from-red-600/95 via-red-700/95 to-red-800/95 
          backdrop-blur-xl shadow-2xl border-r border-red-500/30
          transform transition-all duration-500 ease-out flex flex-col
          ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:via-transparent before:to-black/20 before:pointer-events-none
          after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/5 after:to-transparent after:pointer-events-none
        `}>
            {/* Enhanced Header with Glassmorphism */}
            <div className="relative bg-gradient-to-r from-red-500/90 to-red-600/90 backdrop-blur-lg border-b border-red-500/30 flex-shrink-0 shadow-lg">
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-xl border border-white/40 
                    hover:bg-white/30 transition-all duration-300 hover:scale-105">
                    <img 
                      src={logo} 
                      alt="Blood For Nepal Logo" 
                      className="h-8 w-8 object-contain"
                    />
                  </div>
                  <div>
                    <span className="text-lg font-bold text-white block leading-tight drop-shadow-sm">
                      Blood For Nepal
                    </span>
                    <span className="text-xs text-white/90 font-medium drop-shadow-sm">
                      Saving Lives Together
                    </span>
                  </div>
                </div>
                <button
                  onClick={closeMenuAndRestoreScroll}
                  className="p-3 rounded-2xl text-white bg-white/10 hover:bg-white/20 backdrop-blur-md 
                    border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-110 
                    shadow-lg hover:shadow-xl active:scale-95"
                >
                  <X className="h-6 w-6 drop-shadow-sm" />
                </button>
              </div>
              {/* Enhanced Decorative Elements */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
              <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-gradient-to-r from-red-400/50 via-white/20 to-red-400/50 blur-sm"></div>
            </div>

            {/* Enhanced Navigation Links with Stagger Animations */}
            <div className="flex-1 py-6 px-4 space-y-3 overflow-y-auto">
              {[
                { path: '/', label: t('navHome'), icon: Home },
                { path: '/register-donor', label: t('navRegisterDonor'), icon: UserCheck },
                { path: '/request', label: t('navRequestBlood'), icon: Heart },
                { path: '/find-donor', label: t('navFindDonor'), icon: Users },
                { path: '/education', label: t('navEducation'), icon: BookOpen },
                { path: '/about', label: t('footerAbout'), icon: Info }
              ].map(({ path, label, icon: Icon }, index) => (
                <Link
                  key={path}
                  to={path}
                  onClick={closeMenuAndRestoreScroll}
                  className={`group relative flex items-center px-4 py-4 mx-2 rounded-2xl text-base font-medium 
                    transform transition-all duration-500 hover:scale-[1.02] backdrop-blur-md
                    ${isMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'} ${
                    isActivePath(path)
                      ? 'text-red-900 bg-white/95 shadow-xl border border-white/60 shadow-red-200/20'
                      : 'text-white hover:text-red-100 hover:bg-white/20 border border-white/10 hover:border-white/30 hover:shadow-lg'
                  }`}
                  style={{ 
                    transitionDelay: `${index * 50}ms`,
                    animationDelay: `${index * 100}ms` 
                  }}
                >
                  {/* Enhanced Active indicator with glow */}
                  {isActivePath(path) && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1.5 h-10 
                      bg-gradient-to-b from-red-500 to-red-700 rounded-full shadow-lg 
                      shadow-red-500/50 animate-pulse"></div>
                  )}
                  
                  <div className={`p-3 rounded-xl mr-4 transition-all duration-300 backdrop-blur-sm ${
                    isActivePath(path)
                      ? 'bg-red-100/90 text-red-700 shadow-md'
                      : 'bg-white/15 text-white group-hover:bg-white/25 group-hover:scale-110 border border-white/20'
                  }`}>
                    <Icon className="w-5 h-5 drop-shadow-sm" />
                  </div>
                  
                  <span className="flex-1 font-semibold tracking-wide drop-shadow-sm">{label}</span>
                  
                  {/* Hover arrow */}
                  <div className={`transform transition-all duration-200 ${
                    isActivePath(path) ? 'translate-x-0 opacity-100' : 'translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                  }`}>
                    <div className="w-2 h-2 bg-current rounded-full"></div>
                  </div>
                </Link>
              ))}
              
              {/* Enhanced Language Selector with Glassmorphism */}
              <div className="mt-6 pt-4 mx-2">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-4 shadow-lg">
                  <div className="mb-3">
                    <p className="text-xs font-bold text-white/90 uppercase tracking-wider drop-shadow-sm">
                      Language / भाषा
                    </p>
                  </div>
                  <div className="transform transition-all duration-300 hover:scale-105">
                    <LanguageSelector />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Enhanced User Section with Glassmorphism */}
            <div className="border-t border-white/20 bg-gradient-to-b from-red-700/90 to-red-800/90 
              backdrop-blur-md flex-shrink-0 shadow-inner">
              {isAuthenticated ? (
                /* Enhanced Authenticated Mobile Menu with Glassmorphism */
                <div className="p-4 space-y-3">
                  {/* Enhanced User Info Card */}
                  <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-white/50 
                    hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        {user?.avatar ? (
                          <img
                            src={getFullAvatarUrl(user.avatar)}
                            alt={user?.full_name || 'User Avatar'}
                            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className={`w-10 h-10 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm ${user?.avatar ? 'hidden' : ''}`}
                        >
                          {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {user?.full_name || 'User'}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {user?.email || 'user@example.com'}
                        </p>
                        {user?.blood_type && (
                          <div className="flex items-center mt-1">
                            <Droplets className="h-3 w-3 text-red-500 mr-1" />
                            <span className="text-xs font-semibold text-red-600">
                              {user.blood_type}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced Quick Actions with Glassmorphism */}
                  <div className="space-y-3">
                    <Link
                      to="/profile"
                      onClick={closeMenuAndRestoreScroll}
                      className="flex items-center px-4 py-3 text-sm font-medium text-white hover:text-red-100 
                        bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 hover:border-white/40
                        rounded-2xl transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl
                        transform hover:-translate-y-0.5"
                    >
                      <div className="p-2 bg-blue-200/20 backdrop-blur-sm rounded-xl mr-3 border border-blue-300/30">
                        <UserCircle className="h-4 w-4 text-blue-300 drop-shadow-sm" />
                      </div>
                      <span className="drop-shadow-sm">View Profile</span>
                    </Link>
                    <Link
                      to="/dashboard"
                      onClick={closeMenuAndRestoreScroll}
                      className="flex items-center px-4 py-3 text-sm font-medium text-white hover:text-red-100 
                        bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 hover:border-white/40
                        rounded-2xl transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl
                        transform hover:-translate-y-0.5"
                    >
                      <div className="p-2 bg-red-200/20 backdrop-blur-sm rounded-xl mr-3 border border-red-300/30">
                        <Droplets className="h-4 w-4 text-red-300 drop-shadow-sm" />
                      </div>
                      <span className="drop-shadow-sm">My Donations</span>
                    </Link>
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={closeMenuAndRestoreScroll}
                        className="flex items-center px-4 py-3 text-sm font-medium text-white hover:text-orange-100 
                          bg-white/15 hover:bg-orange-500/20 backdrop-blur-md border border-white/20 hover:border-orange-300/40
                          rounded-2xl transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl
                          transform hover:-translate-y-0.5"
                      >
                        <div className="p-2 bg-orange-200/20 backdrop-blur-sm rounded-xl mr-3 border border-orange-300/30">
                          <Shield className="h-4 w-4 text-orange-300 drop-shadow-sm" />
                        </div>
                        <span className="drop-shadow-sm">Admin Panel</span>
                      </Link>
                    )}
                    
                    {/* Enhanced Logout Button with Glassmorphism */}
                    <button
                      onClick={() => {
                        handleLogout();
                        closeMenuAndRestoreScroll();
                      }}
                      className="flex items-center justify-center w-full px-4 py-3.5 mt-4 text-sm font-semibold 
                        text-red-700 bg-white/95 hover:bg-white backdrop-blur-lg border border-white/50
                        rounded-2xl transition-all duration-300 hover:scale-[1.02] shadow-xl hover:shadow-2xl
                        transform hover:-translate-y-0.5 active:scale-95"
                    >
                      <LogOut className="h-4 w-4 mr-3 drop-shadow-sm" />
                      <span className="drop-shadow-sm">Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Enhanced Guest Mobile Menu with Glassmorphism */
                <div className="p-4 space-y-4">
                  <div className="text-center mb-4 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                    <p className="text-sm text-white font-semibold mb-2 drop-shadow-sm">
                      Join Blood For Nepal
                    </p>
                    <p className="text-xs text-white/80 drop-shadow-sm">
                      Save lives in your community
                    </p>
                  </div>
                  <Link
                    to="/login"
                    onClick={closeMenuAndRestoreScroll}
                    className="flex items-center justify-center px-4 py-3.5 text-sm font-semibold 
                      text-red-700 bg-white/95 hover:bg-white backdrop-blur-lg border border-white/50
                      rounded-2xl transition-all duration-300 hover:scale-[1.02] shadow-xl hover:shadow-2xl
                      transform hover:-translate-y-0.5"
                  >
                    <LogIn className="h-5 w-5 mr-3 drop-shadow-sm" />
                    <span className="drop-shadow-sm">Sign In</span>
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMenuAndRestoreScroll}
                    className="flex items-center justify-center px-4 py-3.5 text-sm font-semibold 
                      text-white bg-white/15 hover:bg-white/25 backdrop-blur-md 
                      border-2 border-white/30 hover:border-white/50 rounded-2xl 
                      transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl
                      transform hover:-translate-y-0.5"
                  >
                    <UserPlus className="h-5 w-5 mr-3 drop-shadow-sm" />
                    <span className="drop-shadow-sm">Create Account</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
        )}

        {/* Return to Admin Button */}
        {typeof window !== 'undefined' && localStorage.getItem('admin_impersonation_token') && (
          <button
            onClick={handleReturnToAdmin}
            className="fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold rounded-full shadow-lg border-2 border-yellow-600 transition-all animate-bounce"
            title="Return to Admin Session"
            style={{ boxShadow: '0 2px 16px 0 rgba(0,0,0,0.10)' }}
          >
            <CornerUpLeft className="w-5 h-5" />
            Return to Admin
          </button>
        )}
      </>
    </nav>
  );
};

export default Navbar;