import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Droplets, Users, Calendar, Heart, Search, AlertCircle, BookOpen, Activity } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { bloodRequestAPI } from '../../utils/api';
import EmergencyButton from '../components/common/EmergencyButton';
import StatsCard from '../components/common/StatsCard';
import BloodTypeCard from '../components/common/BloodTypeCard';

const HomePage = () => {
  const { t } = useLanguage();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [stats, setStats] = useState({
    donors: 1568,
    requests: 427,
    donations: 312,
    livesSaved: 298,
    changes: {
      donors: 12,
      requests: 8,
      donations: 5,
      lives: 15
    }
  });
  const [bloodInventory, setBloodInventory] = useState([
    { type: 'A', rhFactor: '+', count: 125, isAvailable: true },
    { type: 'A', rhFactor: '-', count: 14, isAvailable: true },
    { type: 'B', rhFactor: '+', count: 87, isAvailable: true },
    { type: 'B', rhFactor: '-', count: 9, isAvailable: false },
    { type: 'AB', rhFactor: '+', count: 36, isAvailable: true },
    { type: 'AB', rhFactor: '-', count: 3, isAvailable: false },
    { type: 'O', rhFactor: '+', count: 156, isAvailable: true },
    { type: 'O', rhFactor: '-', count: 21, isAvailable: true },
  ]);
  const [loading, setLoading] = useState(true);

  // Fetch public statistics on component mount
  useEffect(() => {
    const fetchPublicStats = async () => {
      try {
        setLoading(true);
        console.log('🚀 Fetching public stats from frontend...');
        const response = await bloodRequestAPI.getPublicStats();
        console.log('📡 Public stats response:', response);
        
        if (response.success) {
          const { data, meta } = response;
          console.log('📊 Stats data received:', data);
          
          // Update statistics with real database values
          setStats({
            donors: data.donors || 0,
            requests: data.requests || 0,
            donations: data.donations || 0,
            livesSaved: data.livesSaved || 0,
            changes: {
              donors: data.changes?.donors || 0,
              requests: data.changes?.requests || 0,
              donations: data.changes?.donations || 0,
              lives: data.changes?.lives || 0
            }
          });

          // Update blood inventory with real database values
          if (data.bloodInventory && Array.isArray(data.bloodInventory)) {
            console.log('🩸 Blood inventory received:', data.bloodInventory);
            setBloodInventory(data.bloodInventory);
          } else {
            console.warn('⚠️ No blood inventory data received, using defaults');
          }
          
          // Handle demo data indicator
          if (meta && !meta.isRealData) {
            console.log('ℹ️ Using demo data:', meta.message);
            // Data is loaded successfully, even if it's demo data
          }
        } else {
          console.error('❌ API returned error:', response.message);
        }
      } catch (error) {
        console.error('❌ Error fetching public statistics:', error);
        // Keep default values if API fails, but log the error
      } finally {
        setLoading(false);
      }
    };

    fetchPublicStats();
  }, []);
  
  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-red-700 dark:bg-red-900">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-red-700 dark:bg-red-900 opacity-90"></div>
          <div className="absolute -bottom-4 left-0 right-0 h-20 bg-gradient-to-t from-red-800 to-transparent"></div>
        </div>
        <div className="relative w-full py-24 px-4 sm:py-32 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {t('heroTitle')}
          </h1>
          <p className="mt-6 text-xl text-red-100 max-w-3xl mx-auto">
            {t('heroSubtitle')}
          </p>
          <p className="mt-3 text-lg text-red-200 max-w-3xl mx-auto">
            {t('heroDescription')}
          </p>
          <div className="mt-10 flex justify-center space-x-4">
            <Link
              to="/register"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              {t('ctaRegister')}
            </Link>
            <Link
              to="/request"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-800 hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              {t('ctaRequest')}
            </Link>
          </div>
          <div className="mt-8 flex justify-center">
            <EmergencyButton />
          </div>
        </div>
      </div>
      
      {/* Statistics Section */}
      <div className="w-full px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard 
            title="statDonors" 
            value={stats.donors} 
            icon={<Users className="h-6 w-6" />} 
            change={Math.abs(stats.changes.donors)} 
            isPositiveChange={stats.changes.donors >= 0} 
            loading={loading}
          />
          <StatsCard 
            title="statRequests" 
            value={stats.requests} 
            icon={<Droplets className="h-6 w-6" />} 
            change={Math.abs(stats.changes.requests)} 
            isPositiveChange={stats.changes.requests >= 0} 
            loading={loading}
          />
          <StatsCard 
            title="statDonations" 
            value={stats.donations} 
            icon={<Calendar className="h-6 w-6" />} 
            change={Math.abs(stats.changes.donations)} 
            isPositiveChange={stats.changes.donations >= 0} 
            loading={loading}
          />
          <StatsCard 
            title="statLivesSaved" 
            value={stats.livesSaved} 
            icon={<Heart className="h-6 w-6" />} 
            change={Math.abs(stats.changes.lives)} 
            isPositiveChange={stats.changes.lives >= 0} 
            loading={loading}
          />
        </div>
      </div>
      
      {/* Blood Inventory Section */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12 bg-white dark:bg-gray-900">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Blood Inventory Status</h2>
        
        <div className="mb-6">
          {/* <SearchLocationInput onLocationSelected={setSelectedLocation} /> */}
          {selectedLocation && (
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Showing results for: {selectedLocation.province}, {selectedLocation.district}, {selectedLocation.municipality}
              {selectedLocation.ward ? `, Ward ${selectedLocation.ward}` : ''}
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8">
          {bloodInventory.map((bloodType) => (
            <BloodTypeCard
              key={`${bloodType.type}${bloodType.rhFactor}`}
              type={bloodType.type}
              rhFactor={bloodType.rhFactor}
              count={bloodType.count}
              isAvailable={bloodType.isAvailable}
              loading={loading}
            />
          ))}
        </div>
      </div>
      
      {/* Features Section */}
      <div className="bg-white dark:bg-gray-800 py-12">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">Our Features</h2>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Find Blood Donors</h3>
              <p className="text-gray-600 dark:text-gray-400">Search for blood donors near you based on location and blood type. Get connected instantly.</p>
            </div>
            
            <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Emergency Requests</h3>
              <p className="text-gray-600 dark:text-gray-400">Create emergency blood requests for urgent situations. Notify nearby donors immediately.</p>
            </div>
            
            <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Blood Donation Education</h3>
              <p className="text-gray-600 dark:text-gray-400">Learn about the blood donation process, eligibility criteria, and health benefits of donating blood.</p>
            </div>
            
            <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Real-time Tracking</h3>
              <p className="text-gray-600 dark:text-gray-400">Monitor blood inventory levels across hospitals and blood banks in real-time. Stay updated with availability.</p>
            </div>
            
            <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Donor Community</h3>
              <p className="text-gray-600 dark:text-gray-400">Join a community of regular blood donors. Connect with others and share experiences.</p>
            </div>
            
            <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Recognition & Rewards</h3>
              <p className="text-gray-600 dark:text-gray-400">Get recognized for your blood donations. Earn badges and rewards for being a regular donor.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-red-700 dark:bg-red-900">
        <div className="w-full py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to save lives?</span>
            <span className="block text-red-200">Register as a donor today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
              >
                Register Now
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link
                to="/education"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-800 hover:bg-red-900"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;