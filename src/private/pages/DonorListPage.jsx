import React, { useEffect, useState, useMemo } from 'react';
import { authAPI } from '../../utils/api';
import AdminSidebar from '../AdminSidebar';
import { Search, Droplets, Phone, MapPin, Calendar, Heart, UserCheck, Eye, AlertCircle } from 'lucide-react';
import { showToast } from '../../utils/toast';

// Utility function to construct full avatar URL
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

const DONORS_PER_PAGE = 10;

const DonorListPage = ({ isDarkMode, toggleDarkMode }) => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [emergencyFilter, setEmergencyFilter] = useState('');
  const [page, setPage] = useState(1);
  const [donorDetailsModal, setDonorDetailsModal] = useState({ open: false, donor: null });

  useEffect(() => {
    const fetchDonors = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await authAPI.getAllUsers();
        const users = res?.data?.data?.users || res?.data?.users || res?.users || [];
        
        // Filter only active donors who have completed donor registration
        const activeDonors = users.filter(user => {
          const isDonorRegistered = user.is_donor === true;
          const isActiveUser = user.is_active !== false;
          const hasExtendedInfo = user.phone && user.blood_type; // Basic check for completed donor info
          
          return isDonorRegistered && isActiveUser && hasExtendedInfo;
        });
        
        setDonors(activeDonors);
      } catch (err) {
        setError(err?.data?.message || err?.message || 'Failed to load donors.');
      } finally {
        setLoading(false);
      }
    };
    fetchDonors();
  }, []);

  // Extract unique locations for filter
  const uniqueLocations = useMemo(() => {
    const locations = donors
      .map(donor => donor.address)
      .filter(address => address && address.trim())
      .map(address => {
        // Extract province from address (assuming format: "street, municipality, district, province")
        const parts = address.split(',').map(part => part.trim());
        return parts[parts.length - 1]; // Get last part as province
      })
      .filter((province, index, arr) => arr.indexOf(province) === index); // Remove duplicates
    return locations.sort();
  }, [donors]);

  // Filtered and searched donors
  const filteredDonors = useMemo(() => {
    let filtered = donors;
    
    if (bloodTypeFilter) {
      filtered = filtered.filter(donor => donor.blood_type === bloodTypeFilter);
    }
    
    if (locationFilter) {
      filtered = filtered.filter(donor => 
        donor.address && donor.address.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    if (emergencyFilter) {
      if (emergencyFilter === 'emergency-available') {
        filtered = filtered.filter(donor => donor.emergency_contact && donor.emergency_contact.trim() !== '');
      } else if (emergencyFilter === 'emergency-unavailable') {
        filtered = filtered.filter(donor => !donor.emergency_contact || donor.emergency_contact.trim() === '');
      }
    }
    
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      filtered = filtered.filter(donor =>
        donor.full_name?.toLowerCase().includes(s) ||
        donor.email?.toLowerCase().includes(s) ||
        donor.phone?.toLowerCase().includes(s) ||
        donor.blood_type?.toLowerCase().includes(s) ||
        donor.address?.toLowerCase().includes(s)
      );
    }
    
    return filtered;
  }, [donors, search, bloodTypeFilter, locationFilter, emergencyFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredDonors.length / DONORS_PER_PAGE) || 1;
  const paginatedDonors = filteredDonors.slice((page - 1) * DONORS_PER_PAGE, page * DONORS_PER_PAGE);

  // Reset to page 1 if filters/search change
  useEffect(() => {
    setPage(1);
  }, [search, bloodTypeFilter, locationFilter, emergencyFilter]);

  // Calculate donor statistics
  const donorStats = useMemo(() => {
    const totalDonors = donors.length;
    const emergencyAvailable = donors.filter(donor => donor.emergency_contact && donor.emergency_contact.trim() !== '').length;
    const bloodTypeCount = {};
    const recentDonors = donors.filter(donor => {
      const createdDate = new Date(donor.createdAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return createdDate > thirtyDaysAgo;
    }).length;

    donors.forEach(donor => {
      if (donor.blood_type) {
        bloodTypeCount[donor.blood_type] = (bloodTypeCount[donor.blood_type] || 0) + 1;
      }
    });

    return { totalDonors, emergencyAvailable, bloodTypeCount, recentDonors };
  }, [donors]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return '-';
    }
  };

  const getEligibilityStatus = (donor) => {
    if (!donor.last_donation_date) return { status: 'eligible', text: 'Eligible', color: 'green' };
    
    const lastDonation = new Date(donor.last_donation_date);
    const today = new Date();
    const daysSinceLastDonation = Math.floor((today - lastDonation) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastDonation >= 56) { // 8 weeks
      return { status: 'eligible', text: 'Eligible', color: 'green' };
    } else {
      const daysRemaining = 56 - daysSinceLastDonation;
      return { 
        status: 'waiting', 
        text: `${daysRemaining} days`, 
        color: 'yellow' 
      };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <AdminSidebar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Active Donors</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage and view all registered blood donors</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{donorStats.totalDonors}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Donors</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{donorStats.emergencyAvailable}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Emergency Available</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{donorStats.recentDonors}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">New This Month</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Droplets className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {Object.keys(donorStats.bloodTypeCount).length}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Blood Types</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, phone, blood type, or location..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
          <select
            value={bloodTypeFilter}
            onChange={e => setBloodTypeFilter(e.target.value)}
            className="w-full lg:w-48 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="">All Blood Types</option>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select
            value={locationFilter}
            onChange={e => setLocationFilter(e.target.value)}
            className="w-full lg:w-48 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="">All Locations</option>
            {uniqueLocations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
          <select
            value={emergencyFilter}
            onChange={e => setEmergencyFilter(e.target.value)}
            className="w-full lg:w-48 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="">All Donors</option>
            <option value="emergency-available">Emergency Available</option>
            <option value="emergency-unavailable">Not Emergency Available</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-600 dark:text-red-400 text-center py-8">{error}</div>
        ) : (
          <>
            <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Avatar</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Donor Info</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Blood Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Emergency</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last Donation</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Eligibility</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedDonors.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-gray-500 dark:text-gray-400">
                        {search || bloodTypeFilter || locationFilter ? 'No donors found matching your criteria.' : 'No active donors found.'}
                      </td>
                    </tr>
                  ) : (
                    paginatedDonors.map((donor) => {
                      const avatarUrl = donor.avatar 
                        ? getFullAvatarUrl(donor.avatar) 
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(donor.full_name || 'Donor')}&background=F87171&color=fff`;
                      const eligibility = getEligibilityStatus(donor);
                      
                      return (
                        <tr key={donor.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                          donor.emergency_contact && donor.emergency_contact.trim() !== '' 
                            ? 'ring-2 ring-orange-200 dark:ring-orange-800 bg-orange-50 dark:bg-orange-900/10' 
                            : ''
                        }`}>
                          <td className="px-6 py-4 whitespace-nowrap relative">
                            <div className="relative">
                              <img
                                src={avatarUrl}
                                alt={donor.full_name || 'Donor'}
                                className="w-12 h-12 rounded-full object-cover border-2 border-red-200 dark:border-red-700 shadow-sm"
                              />
                              {donor.emergency_contact && donor.emergency_contact.trim() !== '' && (
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                  <AlertCircle className="h-4 w-4 text-white" />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                {donor.full_name || 'Unknown'}
                                {donor.emergency_contact && donor.emergency_contact.trim() !== '' && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 dark:from-orange-900/50 dark:to-red-900/50 dark:text-orange-200 border border-orange-300 dark:border-orange-700 shadow-sm">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    Emergency Ready
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {donor.email}
                              </div>
                              <div className="text-xs text-gray-400 dark:text-gray-500">
                                Joined: {formatDate(donor.createdAt)}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              {donor.blood_type || '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {donor.phone || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {donor.emergency_contact && donor.emergency_contact.trim() !== '' ? (
                              <div className="flex flex-col gap-1">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  EMERGENCY AVAILABLE
                                </span>
                                {donor.emergency_contact !== donor.phone && (
                                  <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                                    📞 {donor.emergency_contact}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                                Not Available
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate" title={donor.address}>
                              {donor.address || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {formatDate(donor.last_donation_date)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              eligibility.color === 'green' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : eligibility.color === 'yellow'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {eligibility.text}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => setDonorDetailsModal({ open: true, donor })}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Showing {((page - 1) * DONORS_PER_PAGE) + 1} to {Math.min(page * DONORS_PER_PAGE, filteredDonors.length)} of {filteredDonors.length} donors
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Donor Details Modal */}
        {donorDetailsModal.open && donorDetailsModal.donor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                onClick={() => setDonorDetailsModal({ open: false, donor: null })}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="text-center mb-6">
                <div className="w-24 h-24 mx-auto mb-4">
                  <img
                    src={donorDetailsModal.donor.avatar 
                      ? getFullAvatarUrl(donorDetailsModal.donor.avatar) 
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(donorDetailsModal.donor.full_name || 'Donor')}&background=F87171&color=fff`}
                    alt={donorDetailsModal.donor.full_name}
                    className="w-full h-full rounded-full object-cover border-4 border-red-200 dark:border-red-700 shadow-lg"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {donorDetailsModal.donor.full_name}
                  {donorDetailsModal.donor.emergency_contact && donorDetailsModal.donor.emergency_contact.trim() !== '' && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 dark:from-orange-900/50 dark:to-red-900/50 dark:text-orange-200 border border-orange-300 dark:border-orange-700">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Emergency Ready
                    </span>
                  )}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{donorDetailsModal.donor.email}</p>
              </div>

              {/* Detailed Information */}
              <div className="space-y-6">
                {/* Emergency Status Section */}
                {donorDetailsModal.donor.emergency_contact && donorDetailsModal.donor.emergency_contact.trim() !== '' && (
                  <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg border-2 border-orange-200 dark:border-orange-700">
                    <div className="flex items-center mb-2">
                      <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2" />
                      <h4 className="font-bold text-orange-800 dark:text-orange-200">EMERGENCY DONOR AVAILABLE</h4>
                    </div>
                    <p className="text-sm text-orange-700 dark:text-orange-300 mb-2">
                      This donor is available for emergency blood donation requests.
                    </p>
                    <div className="bg-white dark:bg-gray-800 rounded p-3 border border-orange-200 dark:border-orange-600">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Emergency Contact:</span>
                        <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                          📞 {donorDetailsModal.donor.emergency_contact}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-6 text-sm">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Personal Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                        <span className="text-gray-900 dark:text-white">{donorDetailsModal.donor.phone || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Gender:</span>
                        <span className="text-gray-900 dark:text-white capitalize">{donorDetailsModal.donor.gender || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Date of Birth:</span>
                        <span className="text-gray-900 dark:text-white">{formatDate(donorDetailsModal.donor.date_of_birth)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Member Since:</span>
                        <span className="text-gray-900 dark:text-white">{formatDate(donorDetailsModal.donor.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Medical Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Blood Type:</span>
                        <span className="text-gray-900 dark:text-white font-medium">{donorDetailsModal.donor.blood_type || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Last Donation:</span>
                        <span className="text-gray-900 dark:text-white">{formatDate(donorDetailsModal.donor.last_donation_date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Emergency Contact:</span>
                        <span className={`text-gray-900 dark:text-white ${
                          donorDetailsModal.donor.emergency_contact && donorDetailsModal.donor.emergency_contact.trim() !== ''
                            ? 'font-semibold text-orange-700 dark:text-orange-300'
                            : ''
                        }`}>
                          {donorDetailsModal.donor.emergency_contact || 'Not provided'}
                          {donorDetailsModal.donor.emergency_contact && donorDetailsModal.donor.emergency_contact.trim() !== '' && (
                            <span className="ml-1 text-orange-600 dark:text-orange-400">🚨</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {donorDetailsModal.donor.address && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Address</h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">{donorDetailsModal.donor.address}</p>
                  </div>
                )}

                {donorDetailsModal.donor.medical_conditions && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Medical Conditions</h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">{donorDetailsModal.donor.medical_conditions}</p>
                  </div>
                )}

                {/* Eligibility Status */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Donation Eligibility</h4>
                  <div className="flex items-center">
                    {(() => {
                      const eligibility = getEligibilityStatus(donorDetailsModal.donor);
                      return (
                        <>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mr-3 ${
                            eligibility.color === 'green' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : eligibility.color === 'yellow'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {eligibility.text}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {eligibility.status === 'eligible' ? 'Ready to donate' : 'Waiting period remaining'}
                          </span>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DonorListPage;
