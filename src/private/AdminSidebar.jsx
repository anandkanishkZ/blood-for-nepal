import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Users, LayoutDashboard, LogOut, ExternalLink, Moon, Sun, Settings, Heart } from 'lucide-react';
import logoTransparent from '../assets/logo-transparent.png';
import { useAuth } from '../public/context/AuthContext';

// Icons for top bar
import { Home } from 'lucide-react';

const navLinks = [
  {
    to: '/admin',
    label: 'Dashboard',
    icon: <LayoutDashboard className="w-5 h-5 mr-2" />,
  },
  {
    to: '/admin/users',
    label: 'All Users',
    icon: <Users className="w-5 h-5 mr-2" />,
  },
  {
    to: '/admin/donors',
    label: 'Donor List',
    icon: <Heart className="w-5 h-5 mr-2" />,
  },
  {
    to: '/admin/settings',
    label: 'Settings',
    icon: <Settings className="w-5 h-5 mr-2" />,
  },
];

const AdminSidebar = ({ isDarkMode, toggleDarkMode }) => {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Top right bar for Visit Site and Dark Mode toggle */}
      <div className="fixed top-0 right-0 z-50 flex items-center gap-2 px-4 py-3 h-16 bg-transparent md:bg-transparent">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center px-4 py-2 rounded-lg text-sm font-semibold shadow border border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-800 transition focus:outline-none focus:ring-2 focus:ring-red-400"
          aria-label="Visit Home Page"
          style={{ boxShadow: '0 2px 8px 0 rgba(220,38,38,0.08)' }}
        >
          <ExternalLink className="w-5 h-5 mr-1" />
          <span className="hidden sm:inline">Visit Site</span>
        </a>
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-700 dark:text-gray-200" />}
        </button>
      </div>

      {/* Hamburger button for mobile (hidden under top bar) */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-full bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-700 focus:outline-none"
        onClick={() => setOpen(true)}
        aria-label="Open admin sidebar"
      >
        <Menu className="w-6 h-6 text-red-600 dark:text-red-400" />
      </button>

      {/* Overlay for mobile when sidebar is open */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity duration-300"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-50 transform transition-transform duration-300 md:static md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        aria-label="Admin sidebar"
      >
        {/* Close button for mobile */}
        <div className="flex items-center justify-between md:justify-center px-4 py-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center">
            <img src={logoTransparent} alt="Logo" className="h-10 w-10 mr-2" />
            <span className="text-2xl font-bold text-red-600 dark:text-red-400 hidden md:inline">Admin Panel</span>
          </div>
          <button
            className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setOpen(false)}
            aria-label="Close admin sidebar"
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
        <nav className="flex flex-col gap-1 mt-8 px-4">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center px-4 py-3 rounded-lg font-medium text-base transition-colors mb-1
                ${pathname === link.to
                  ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 shadow'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'}
              `}
              onClick={() => setOpen(false)}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex-1" />
        {/* Logout button at the bottom */}
        <div className="px-4 pb-8">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-base bg-red-600 hover:bg-red-700 text-white transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar; 