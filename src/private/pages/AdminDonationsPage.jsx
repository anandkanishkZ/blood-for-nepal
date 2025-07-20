import React, { useState, useEffect } from 'react';
import { bloodRequestAPI } from '../../utils/api';
import { toast } from 'react-toastify';
import AdminSidebar from '../AdminSidebar';
import { 
  Heart, 
  Droplets, 
  TrendingUp, 
  Calendar, 
  Filter,
  Download,
  Eye,
  MapPin,
  Phone,
  User,
  RefreshCw,
  BarChart3,
  PieChart,
  Award,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  Users
} from 'lucide-react';

const AdminDonationsPage = ({ isDarkMode, toggleDarkMode }) => {
  const [donationsData, setDonationsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    startDate: '',
    endDate: '',
    donor: '',
    requester: '',
    bloodType: ''
  });
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Certificate generation states
  const [generatingCertificate, setGeneratingCertificate] = useState(null);
  const [bulkGenerating, setBulkGenerating] = useState(false);

  // Blood types for filtering
  const bloodTypes = ['A', 'B', 'AB', 'O'];
  const rhFactors = ['+', '-'];

  useEffect(() => {
    fetchDonationsData();
  }, [filters.page, filters.limit]);

  const fetchDonationsData = async () => {
    try {
      setLoading(true);
      // Use the successful donations API which includes statistics
      const response = await bloodRequestAPI.getSuccessfulDonations(filters);
      if (response.success) {
        setDonationsData(response.data);
      } else {
        // Fallback: try to get dashboard stats separately
        console.warn('Primary donations API failed, trying dashboard stats...');
        const dashboardResponse = await bloodRequestAPI.getDashboardStats();
        if (dashboardResponse.success) {
          setDonationsData({
            donations: [],
            pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
            statistics: {
              totalDonations: dashboardResponse.data.totalDonations,
              thisMonthDonations: dashboardResponse.data.thisMonthDonations,
              activeDonorsCount: dashboardResponse.data.activeDonorsCount,
              uniqueBloodTypesCount: dashboardResponse.data.uniqueBloodTypesCount,
              topDonors: dashboardResponse.data.topDonors,
              bloodTypeStats: []
            }
          });
        } else {
          toast.error('Failed to fetch donations data');
        }
      }
    } catch (error) {
      console.error('Error fetching donations:', error);
      // Try dashboard stats as fallback
      try {
        console.log('Attempting fallback to dashboard stats...');
        const dashboardResponse = await bloodRequestAPI.getDashboardStats();
        if (dashboardResponse.success) {
          setDonationsData({
            donations: [],
            pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
            statistics: {
              totalDonations: dashboardResponse.data.totalDonations,
              thisMonthDonations: dashboardResponse.data.thisMonthDonations,
              activeDonorsCount: dashboardResponse.data.activeDonorsCount,
              uniqueBloodTypesCount: dashboardResponse.data.uniqueBloodTypesCount,
              topDonors: dashboardResponse.data.topDonors,
              bloodTypeStats: []
            }
          });
          toast.success('Dashboard statistics loaded successfully');
        } else {
          toast.error('Failed to fetch donations data and dashboard stats');
        }
      } catch (fallbackError) {
        console.error('Fallback dashboard stats also failed:', fallbackError);
        toast.error('Failed to fetch donations data - please check server connection');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const applyFilters = () => {
    setRefreshing(true);
    fetchDonationsData().finally(() => setRefreshing(false));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      startDate: '',
      endDate: '',
      donor: '',
      requester: '',
      bloodType: ''
    });
    setTimeout(() => {
      fetchDonationsData();
    }, 100);
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatBloodType = (bloodType, rhFactor) => {
    return `${bloodType || ''}${rhFactor || ''}`;
  };

  const exportToCSV = () => {
    if (!donationsData?.donations?.length) {
      toast.error('No data to export');
      return;
    }

    const headers = [
      'Date', 'Donor Name', 'Donor Blood Type', 'Patient Name', 'Patient Blood Type',
      'Quantity', 'Hospital', 'Province', 'District', 'Contact Phone', 'Purpose'
    ];

    const csvData = donationsData.donations.map(donation => [
      formatDate(donation.donation_completed_at),
      donation.donor?.full_name || 'N/A',
      donation.donor?.blood_type || 'N/A',
      donation.bloodRequest?.patient_name || 'N/A',
      formatBloodType(donation.bloodRequest?.blood_type, donation.bloodRequest?.rh_factor),
      donation.bloodRequest?.quantity || 'N/A',
      donation.bloodRequest?.hospital_name || 'N/A',
      donation.bloodRequest?.province || 'N/A',
      donation.bloodRequest?.district || 'N/A',
      donation.bloodRequest?.contact_phone || 'N/A',
      donation.bloodRequest?.purpose || 'N/A'
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `successful-donations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Certificate generation functions
  const generateSingleCertificate = async (donation) => {
    try {
      setGeneratingCertificate(donation.id);
      const response = await bloodRequestAPI.generateCertificate(donation.id);
      
      if (response.success) {
        toast.success(`Certificate generated for ${donation.donor?.full_name || 'donor'}!`);
        
        // Open certificate in new tab
        const certificateUrl = bloodRequestAPI.getCertificateUrl(response.certificate.url);
        if (certificateUrl) {
          window.open(certificateUrl, '_blank');
        }
      } else {
        toast.error(response.message || 'Failed to generate certificate');
      }
    } catch (error) {
      console.error('Error generating certificate:', error);
      toast.error('Failed to generate certificate. Please try again.');
    } finally {
      setGeneratingCertificate(null);
    }
  };

  const bulkGenerateCertificates = async () => {
    try {
      setBulkGenerating(true);
      
      // Use current filters for bulk generation
      const filterParams = {};
      if (filters.startDate) filterParams.startDate = filters.startDate;
      if (filters.endDate) filterParams.endDate = filters.endDate;
      
      const response = await bloodRequestAPI.bulkGenerateCertificates(filterParams);
      
      if (response.success) {
        const { summary, generatedCertificates } = response;
        toast.success(
          `Bulk generation completed! Generated ${summary.generated} certificates out of ${summary.total} donations.`
        );
        
        // Show detailed results
        if (summary.failed > 0) {
          toast.warning(`${summary.failed} certificates failed to generate. Check console for details.`);
        }
        
        console.log('Generated certificates:', generatedCertificates);
      } else {
        toast.error(response.message || 'Failed to bulk generate certificates');
      }
    } catch (error) {
      console.error('Error bulk generating certificates:', error);
      toast.error('Failed to bulk generate certificates. Please try again.');
    } finally {
      setBulkGenerating(false);
    }
  };

  if (loading && !donationsData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-red-600" />
          <span className="text-lg">Loading donations data...</span>
        </div>
      </div>
    );
  }

  const stats = donationsData?.statistics || {};
  const donations = donationsData?.donations || [];
  const pagination = donationsData?.pagination || {};

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <AdminSidebar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Heart className="w-8 h-8 text-red-600" />
                Successful Donations
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Track and manage completed blood donations
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <button
                onClick={bulkGenerateCertificates}
                disabled={bulkGenerating || donations.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bulkGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Generate All Certificates
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setRefreshing(true);
                  fetchDonationsData().finally(() => setRefreshing(false));
                }}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Donations</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalDonations || 0}</p>
              </div>
              <Heart className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Month</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.thisMonthDonations || 0}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Donors</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeDonorsCount || 0}</p>
              </div>
              <User className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Blood Types</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.uniqueBloodTypesCount || 0}</p>
              </div>
              <Droplets className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Blood Type</label>
                <select
                  value={filters.bloodType}
                  onChange={(e) => handleFilterChange('bloodType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Types</option>
                  {bloodTypes.map(type => 
                    rhFactors.map(rh => (
                      <option key={`${type}${rh}`} value={type}>{`${type}${rh}`}</option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Donor Name</label>
                <input
                  type="text"
                  placeholder="Search donor..."
                  value={filters.donor}
                  onChange={(e) => handleFilterChange('donor', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Requester</label>
                <input
                  type="text"
                  placeholder="Search requester..."
                  value={filters.requester}
                  onChange={(e) => handleFilterChange('requester', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex items-end gap-2">
                <button
                  onClick={applyFilters}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  disabled={refreshing}
                >
                  {refreshing ? (
                    <RefreshCw className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    'Apply'
                  )}
                </button>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Top Donors */}
        {stats.topDonors?.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-6 h-6 text-yellow-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Donors</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.topDonors.slice(0, 6).map((donorStat, index) => (
                <div key={donorStat.donor?.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{donorStat.donor?.full_name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Blood Type: {donorStat.donor?.blood_type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">{donorStat.donation_count}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">donations</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Donations List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Donations</h3>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Showing {donations.length} of {pagination.total || 0} donations
              </span>
            </div>
          </div>

          {donations.length === 0 ? (
            <div className="p-8 text-center">
              <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No successful donations found.</p>
              {Object.values(filters).some(v => v && v !== 1 && v !== 10) && (
                <button
                  onClick={clearFilters}
                  className="mt-2 text-red-600 hover:text-red-700 font-medium"
                >
                  Clear filters to see all donations
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Donation Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Donor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Blood Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Hospital
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {donations.map((donation) => (
                      <tr key={donation.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {formatDate(donation.donation_completed_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="ml-0">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {donation.donor?.full_name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {donation.donor?.blood_type}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {donation.bloodRequest?.patient_name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Age: {donation.bloodRequest?.patient_age}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                            {formatBloodType(donation.bloodRequest?.blood_type, donation.bloodRequest?.rh_factor)} - {donation.bloodRequest?.quantity} units
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {donation.bloodRequest?.hospital_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {donation.bloodRequest?.district}, {donation.bloodRequest?.province}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedDonation(donation)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </button>
                            <button
                              onClick={() => generateSingleCertificate(donation)}
                              disabled={generatingCertificate === donation.id}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {generatingCertificate === donation.id ? (
                                <>
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <Award className="w-4 h-4" />
                                  Certificate
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      Showing page {pagination.page} of {pagination.totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                        className="flex items-center gap-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </button>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Page {pagination.page} of {pagination.totalPages}
                      </span>
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages}
                        className="flex items-center gap-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Donation Details Modal */}
      {selectedDonation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Donation Details</h3>
              <button
                onClick={() => setSelectedDonation(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Donation Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800 dark:text-green-300">Donation Status</span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-400">Successfully Completed</p>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                    {formatDate(selectedDonation.donation_completed_at)}
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-800 dark:text-blue-300">Blood Type</span>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    {formatBloodType(selectedDonation.bloodRequest?.blood_type, selectedDonation.bloodRequest?.rh_factor)}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
                    {selectedDonation.bloodRequest?.quantity} units
                  </p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-purple-800 dark:text-purple-300">Location</span>
                  </div>
                  <p className="text-sm text-purple-700 dark:text-purple-400">
                    {selectedDonation.bloodRequest?.district}
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-500 mt-1">
                    {selectedDonation.bloodRequest?.province}
                  </p>
                </div>
              </div>

              {/* Donor Information */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Donor Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Full Name</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedDonation.donor?.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Blood Type</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedDonation.donor?.blood_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedDonation.donor?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedDonation.donor?.phone}</p>
                  </div>
                </div>
              </div>

              {/* Patient Information */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Patient Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Patient Name</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedDonation.bloodRequest?.patient_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Age & Gender</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedDonation.bloodRequest?.patient_age} years, {selectedDonation.bloodRequest?.patient_gender}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Purpose</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedDonation.bloodRequest?.purpose}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Urgency</p>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">{selectedDonation.bloodRequest?.urgency}</p>
                  </div>
                </div>
              </div>

              {/* Hospital Information */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Hospital Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Hospital Name</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedDonation.bloodRequest?.hospital_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Address</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedDonation.bloodRequest?.hospital_address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Contact Name</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedDonation.bloodRequest?.contact_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Contact Phone</p>
                    <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {selectedDonation.bloodRequest?.contact_phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Donation Notes */}
              {(selectedDonation.donation_notes || selectedDonation.requester_confirmation_notes) && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Notes</h4>
                  {selectedDonation.donation_notes && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Donor's Notes:</p>
                      <p className="text-gray-900 dark:text-white">{selectedDonation.donation_notes}</p>
                    </div>
                  )}
                  {selectedDonation.requester_confirmation_notes && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Requester's Notes:</p>
                      <p className="text-gray-900 dark:text-white">{selectedDonation.requester_confirmation_notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDonationsPage;
