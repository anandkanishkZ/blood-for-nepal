import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import StatsCard from '../../public/components/common/StatsCard';
import logoTransparent from '../../assets/logo-transparent.png';
import AdminSidebar from '../AdminSidebar';
import { authAPI } from '../../utils/api';

const AdminDashboardPage = ({ isDarkMode, toggleDarkMode }) => {
  const [stats, setStats] = useState({
    totalUsers: '—',
    activeDonors: '—',
    pendingRequests: '—',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await authAPI.getAdminStats();
        const data = res?.data || res;
        setStats({
          totalUsers: data.totalUsers ?? '—',
          activeDonors: data.activeDonors ?? '—',
          pendingRequests: data.pendingRequests ?? '—',
        });
      } catch (err) {
        setError('Failed to load stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'bg-blue-500' },
    { label: 'Active Donors', value: stats.activeDonors, icon: '🩸', color: 'bg-red-500' },
    { label: 'Pending Requests', value: stats.pendingRequests, icon: '⏳', color: 'bg-yellow-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <AdminSidebar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      <main className="flex-1 max-w-5xl mx-auto w-full px-8 py-10">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Admin Dashboard</h1>
        {error && <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          {statCards.map((stat) => (
            <StatsCard
              key={stat.label}
              title={stat.label}
              value={loading ? '—' : stat.value}
              icon={<span className={`text-2xl ${stat.color}`}>{stat.icon}</span>}
            />
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/admin/users" className="flex-1 bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 flex items-center justify-between hover:bg-blue-50 dark:hover:bg-blue-900 transition group border border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Users</h2>
              <p className="text-gray-600 dark:text-gray-400">View and manage all registered users</p>
            </div>
            <span className="text-3xl text-blue-500 group-hover:scale-110 transition-transform">👥</span>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardPage; 