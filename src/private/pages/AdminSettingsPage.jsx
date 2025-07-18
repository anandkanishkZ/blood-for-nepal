import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Settings, Smartphone, Database, Shield, Bell, Globe } from 'lucide-react';
import AdminSidebar from '../AdminSidebar';
import SmsProviderManagement from '../components/SmsProviderManagement';

const AdminSettingsPage = ({ isDarkMode, toggleDarkMode }) => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('sms');

  // Handle URL query parameters to set active tab
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tab = urlParams.get('tab');
    if (tab && ['sms', 'database', 'security', 'notifications', 'general'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

  const tabs = [
    {
      id: 'sms',
      label: 'SMS Providers',
      icon: <Smartphone className="w-5 h-5" />,
      description: 'Manage SMS service providers and delivery settings'
    },
    {
      id: 'database',
      label: 'Database',
      icon: <Database className="w-5 h-5" />,
      description: 'Database configuration and backup settings'
    },
    {
      id: 'security',
      label: 'Security',
      icon: <Shield className="w-5 h-5" />,
      description: 'Authentication and security policies'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell className="w-5 h-5" />,
      description: 'Email and notification preferences'
    },
    {
      id: 'general',
      label: 'General',
      icon: <Globe className="w-5 h-5" />,
      description: 'General system settings and preferences'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'sms':
        return <SmsProviderManagement />;
      case 'database':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Database Settings
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Database configuration options will be available here.
            </p>
          </div>
        );
      case 'security':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Security Settings
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Security and authentication settings will be available here.
            </p>
          </div>
        );
      case 'notifications':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Notification Settings
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Email and notification preferences will be available here.
            </p>
          </div>
        );
      case 'general':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              General Settings
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              General system configuration options will be available here.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <AdminSidebar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage system configuration and preferences
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Settings Navigation */}
          <div className="lg:w-1/4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Settings
              </h2>
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center ${
                      activeTab === tab.id
                        ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="mr-3">{tab.icon}</span>
                    <div>
                      <div className="font-medium">{tab.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {tab.description}
                      </div>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:w-3/4">
            {renderTabContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminSettingsPage;
