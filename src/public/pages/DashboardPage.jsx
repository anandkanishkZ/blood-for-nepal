import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Users, Calendar, Award, Bell, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-8 text-white mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Heart className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {user?.full_name}!</h1>
              <p className="text-red-100 mt-2">Thank you for being part of the Blood For Nepal community</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Blood Type</h3>
                <p className="text-2xl font-bold text-red-600">{user?.blood_type}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Donations</h3>
                <p className="text-2xl font-bold text-blue-600">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Next Eligible</h3>
                <p className="text-sm font-medium text-green-600">Available Now</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Level</h3>
                <p className="text-2xl font-bold text-yellow-600">Beginner</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="space-y-4">
              <Link 
                to="/find" 
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors group"
              >
                <Users className="w-8 h-8 text-gray-400 group-hover:text-red-500" />
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900">Find Donors</h3>
                  <p className="text-sm text-gray-500">Search for blood donors in your area</p>
                </div>
              </Link>

              <Link 
                to="/request" 
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors group"
              >
                <Bell className="w-8 h-8 text-gray-400 group-hover:text-red-500" />
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900">Request Blood</h3>
                  <p className="text-sm text-gray-500">Post a blood request for emergency</p>
                </div>
              </Link>

              <Link 
                to="/profile" 
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors group"
              >
                <Settings className="w-8 h-8 text-gray-400 group-hover:text-red-500" />
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900">Update Profile</h3>
                  <p className="text-sm text-gray-500">Keep your information up to date</p>
                </div>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
            <div className="space-y-4">
              <div className="text-center py-8">
                <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No recent activity</p>
                <p className="text-sm text-gray-400 mt-1">Start by updating your profile or finding donors</p>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Status */}
        <div className="mt-8">
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-green-900">Account Verified</h3>
                <p className="text-sm text-green-700 mt-1">
                  Your account has been successfully verified. You now have access to all Blood For Nepal features.
                  {user?.is_email_verified && ' ✓ Email verified'}
                  {user?.is_phone_verified && ' ✓ Phone verified'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
