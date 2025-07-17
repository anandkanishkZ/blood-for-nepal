import React, { useEffect, useState, useMemo } from 'react';
import { Search, Droplets, Phone, MapPin, Heart, AlertCircle, UserCheck, Users, Send, Clock, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { authAPI, bloodRequestAPI } from '../../utils/api';
import { useAuth } from '../context/AuthContext';
import { canReceiveFromDonor, getCompatibleDonorTypes, getCompatibleRecipientTypes } from '../../utils/bloodCompatibility';

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

const formatSafeDate = (dateString) => {
  if (!dateString) return 'Date not available';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString();
  } catch (error) {
    return 'Invalid date';
  }
};

const DONORS_PER_PAGE = 12;

const FindDonorPage = () => {
  const { user } = useAuth();
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [page, setPage] = useState(1);
  const [userBloodRequests, setUserBloodRequests] = useState([]);
  const [connectingDonor, setConnectingDonor] = useState(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [selectedBloodRequest, setSelectedBloodRequest] = useState('');

  // Check if user can connect to a donor based on blood compatibility
  const canConnectToDonor = (donor) => {
    if (!user || !userBloodRequests || userBloodRequests.length === 0) {
      return false;
    }
    
    // Check if user has any pending blood requests that are compatible with donor's blood type
    const compatibleRequests = userBloodRequests.filter(request => 
      request.status === 'pending' && 
      !request.is_spam && 
      !request.is_completed &&
      canReceiveFromDonor(`${request.blood_type}${request.rh_factor}`, donor.blood_type)
    );
    
    return compatibleRequests.length > 0;
  };

  // Get compatible blood requests for a donor
  const getCompatibleBloodRequests = (donor) => {
    if (!userBloodRequests || userBloodRequests.length === 0) {
      return [];
    }
    
    return userBloodRequests.filter(request => 
      request.status === 'pending' && 
      !request.is_spam && 
      !request.is_completed &&
      canReceiveFromDonor(`${request.blood_type}${request.rh_factor}`, donor.blood_type)
    );
  };

  useEffect(() => {
    const fetchDonors = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await authAPI.getDonors();
        const donors = res?.data?.data?.donors || res?.data?.donors || res?.donors || [];
        setDonors(donors);
      } catch (err) {
        setError('Failed to load donors.');
      } finally {
        setLoading(false);
      }
    };

    const fetchUserBloodRequests = async () => {
      if (user) {
        try {
          console.log('Fetching blood requests for user:', user.id);
          const res = await bloodRequestAPI.getMyRequests();
          console.log('API Response:', res);
          console.log('Response data:', res?.data);
          console.log('Response data.data:', res?.data?.data);
          const requests = res?.bloodRequests || [];
          console.log('Parsed requests:', requests);
          console.log('Request count:', requests.length);
          // Get all blood requests (no filtering - show complete history)
          setUserBloodRequests(requests);
          console.log('userBloodRequests state will be set to:', requests);
        } catch (err) {
          console.error('Failed to load user blood requests:', err);
          console.error('Error details:', err);
        }
      } else {
        console.log('No user found, skipping blood requests fetch');
      }
    };

    fetchDonors();
    fetchUserBloodRequests();
  }, [user]);

  const uniqueLocations = useMemo(() => {
    const locations = donors
      .map(donor => donor.address)
      .filter(address => address && address.trim())
      .map(address => {
        const parts = address.split(',').map(part => part.trim());
        return parts[parts.length - 1];
      })
      .filter((province, index, arr) => arr.indexOf(province) === index);
    return locations.sort();
  }, [donors]);

  const filteredDonors = useMemo(() => {
    let filtered = donors;
    if (bloodTypeFilter) {
      filtered = filtered.filter(donor => donor.blood_type === bloodTypeFilter);
    }
    if (locationFilter) {
      filtered = filtered.filter(donor => donor.address && donor.address.toLowerCase().includes(locationFilter.toLowerCase()));
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
  }, [donors, search, bloodTypeFilter, locationFilter]);

  const totalPages = Math.ceil(filteredDonors.length / DONORS_PER_PAGE) || 1;
  const paginatedDonors = filteredDonors.slice((page - 1) * DONORS_PER_PAGE, page * DONORS_PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [search, bloodTypeFilter, locationFilter]);

  const handleConnectClick = (donor) => {
    console.log('handleConnectClick called with donor:', donor);
    console.log('Current user:', user);
    console.log('User blood requests:', userBloodRequests);
    
    if (!user) {
      setError('Please log in to connect with donors.');
      return;
    }
    
    // Check blood compatibility
    if (!canConnectToDonor(donor)) {
      const userBloodTypes = userBloodRequests
        .filter(req => req.status === 'pending' && !req.is_spam && !req.is_completed)
        .map(req => `${req.blood_type}${req.rh_factor}`)
        .join(', ');
      
      const compatibleRecipientTypes = getCompatibleRecipientTypes(donor.blood_type);
      
      if (userBloodRequests.length === 0) {
        setError('You need to create a blood request first to connect with donors.');
      } else if (userBloodTypes) {
        setError(`Blood type incompatible! This donor (${donor.blood_type}) can only donate to recipients with blood types: ${compatibleRecipientTypes.join(', ')}. Your pending requests are for: ${userBloodTypes}.`);
      } else {
        setError('You need an active (pending) blood request to connect with donors.');
      }
      return;
    }
    
    setSelectedDonor(donor);
    setShowConnectModal(true);
  };

  const handleSendConnectionRequest = async () => {
    if (!selectedBloodRequest) {
      setError('Please select a blood request to continue.');
      return;
    }
    
    setConnectingDonor(selectedDonor.id);
    try {
      await bloodRequestAPI.sendConnectionRequest(selectedDonor.id, selectedBloodRequest);
      setShowConnectModal(false);
      setSelectedDonor(null);
      setSelectedBloodRequest('');
      setError(null);
      alert('Connection request sent successfully! The donor will be notified.');
    } catch (err) {
      setError('Failed to send connection request. Please try again.');
    } finally {
      setConnectingDonor(null);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-10 px-2">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-red-700 dark:text-white mb-2 tracking-tight">Find Blood Donors</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">Search and connect with life-saving blood donors across Nepal.</p>
          </div>
          <div className="flex gap-2">
            <Link to="/register-donor" className="inline-flex items-center px-5 py-2.5 bg-red-600 text-white font-semibold rounded-lg shadow hover:bg-red-700 transition-all">
              <UserCheck className="w-5 h-5 mr-2" /> Become a Donor
            </Link>
          </div>
        </div>
        
        {/* Blood Compatibility Information */}
        {user && userBloodRequests.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-blue-800 dark:text-blue-200">Blood Compatibility Information</h3>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Based on your blood requests, you can only connect with donors who have compatible blood types. 
              The connect button will only appear for compatible donors.
            </p>
            {userBloodRequests.filter(req => req.status === 'pending').length > 0 && (
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                Your pending requests: <strong>{userBloodRequests.filter(req => req.status === 'pending').map(r => `${r.blood_type}${r.rh_factor} (${r.quantity} units)`).join(', ')}</strong>
              </p>
            )}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="relative col-span-2">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, blood type, or location..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 shadow-sm"
            />
          </div>
          <select
            value={bloodTypeFilter}
            onChange={e => setBloodTypeFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 shadow-sm"
          >
            <option value="">All Blood Types</option>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select
            value={locationFilter}
            onChange={e => setLocationFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 shadow-sm"
          >
            <option value="">All Locations</option>
            {uniqueLocations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {paginatedDonors.length === 0 ? (
                <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-8">
                  No donors found matching your criteria.
                </div>
              ) : (
                paginatedDonors.map((donor) => {
                  const avatarUrl = donor.avatar 
                    ? getFullAvatarUrl(donor.avatar) 
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(donor.full_name || 'Donor')}&background=F87171&color=fff`;
                  return (
                    <div key={donor.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-200 dark:border-gray-700 p-6 flex flex-col items-center hover:shadow-lg transition-all group relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-2 bg-red-600 group-hover:bg-red-700 transition-all"></div>
                      <img
                        src={avatarUrl}
                        alt={donor.full_name || 'Donor'}
                        className="w-20 h-20 rounded-full object-cover border-4 border-red-200 dark:border-red-700 shadow mb-3"
                      />
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{donor.full_name}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Droplets className="w-4 h-4 text-red-600" />
                        <span className="font-semibold text-red-700 dark:text-red-300">{donor.blood_type}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="text-gray-600 dark:text-gray-300 text-sm truncate max-w-[140px]" title={donor.address}>{donor.address}</span>
                      </div>
                      {donor.emergency_contact && (
                        <div className="flex items-center gap-2 mt-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold border border-orange-300">
                          <AlertCircle className="w-3 h-3 mr-1" /> Emergency Available
                        </div>
                      )}
                      
                      {/* Connect Button */}
                      <div className="mt-4 w-full">
                        {!user ? (
                          <Link to="/login" className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                            <Send className="w-4 h-4 mr-2" />
                            Login to Connect
                          </Link>
                        ) : canConnectToDonor(donor) ? (
                          <button
                            onClick={() => handleConnectClick(donor)}
                            disabled={connectingDonor === donor.id}
                            className="w-full inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {connectingDonor === donor.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            ) : (
                              <Send className="w-4 h-4 mr-2" />
                            )}
                            {connectingDonor === donor.id ? 'Connecting...' : 'Connect'}
                          </button>
                        ) : (
                          <div className="w-full">
                            <button
                              disabled
                              className="w-full inline-flex items-center justify-center px-4 py-2 bg-gray-400 text-white font-semibold rounded-lg cursor-not-allowed opacity-60"
                            >
                              <Info className="w-4 h-4 mr-2" />
                              Blood Type Incompatible
                            </button>
                            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                              {userBloodRequests.length === 0 
                                ? 'No pending blood requests' 
                                : `Your requests: ${userBloodRequests.filter(r => r.status === 'pending').map(r => `${r.blood_type}${r.rh_factor}`).join(', ')}`
                              }
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Showing {((page - 1) * DONORS_PER_PAGE) + 1} to {Math.min(page * DONORS_PER_PAGE, filteredDonors.length)} of {filteredDonors.length} donors
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Connect Modal */}
      {showConnectModal && selectedDonor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Connect with {selectedDonor.full_name}
            </h3>
            
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">
                Your Blood Request History
              </h4>
              
              {/* Debug info */}
              <div className="mb-2 text-xs text-gray-500">
                Debug: Found {userBloodRequests.length} blood requests for user {user?.id || 'not logged in'}
              </div>
              
              {userBloodRequests.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    You haven't submitted any blood requests yet.
                  </p>
                  <Link 
                    to="/request" 
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    onClick={() => setShowConnectModal(false)}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Create Blood Request
                  </Link>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                    {userBloodRequests.map(request => (
                      <div key={request.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <Droplets className="w-4 h-4 text-red-600" />
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {request.blood_type}{request.rh_factor} - {request.quantity} units
                            </span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            request.status === 'pending' 
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : request.status === 'completed' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {request.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {request.additional_info || `${request.purpose} - ${request.patient_name} (${request.urgency})`}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span>📅 Created: {formatSafeDate(request.created_at)}</span>
                          <span>⏰ Required: {formatSafeDate(request.required_date)}</span>
                          <span>🏥 {request.hospital_name}</span>
                          <span>📍 {request.municipality}, {request.district}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Select a compatible blood request to connect with this donor:
                    </p>
                    
                    {/* Blood Compatibility Info */}
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                          Blood Compatibility Info
                        </span>
                      </div>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Donor <strong>{selectedDonor.full_name}</strong> (Blood Type: <strong>{selectedDonor.blood_type}</strong>) can donate to recipients with blood types: <strong>{getCompatibleRecipientTypes(selectedDonor.blood_type).join(', ')}</strong>
                      </p>
                    </div>
                    
                    <select
                      value={selectedBloodRequest}
                      onChange={(e) => setSelectedBloodRequest(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Select a compatible blood request...</option>
                      {getCompatibleBloodRequests(selectedDonor).map(request => (
                        <option key={request.id} value={request.id}>
                          {request.blood_type}{request.rh_factor} - {request.quantity} units - Required: {formatSafeDate(request.required_date)}
                        </option>
                      ))}
                    </select>
                    
                    {getCompatibleBloodRequests(selectedDonor).length === 0 && (
                      <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                        <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                          <strong>No compatible blood requests found!</strong>
                        </p>
                        <p className="text-sm text-red-700 dark:text-red-300">
                          This donor (<strong>{selectedDonor.blood_type}</strong>) can only help with blood requests for: <strong>{getCompatibleRecipientTypes(selectedDonor.blood_type).join(', ')}</strong>
                        </p>
                        {userBloodRequests.filter(req => req.status === 'pending').length > 0 && (
                          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                            Your pending requests are for: <strong>{userBloodRequests.filter(req => req.status === 'pending').map(r => `${r.blood_type}${r.rh_factor}`).join(', ')}</strong>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowConnectModal(false);
                  setSelectedDonor(null);
                  setSelectedBloodRequest('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              {userBloodRequests.length > 0 && getCompatibleBloodRequests(selectedDonor).length > 0 && (
                <button
                  onClick={handleSendConnectionRequest}
                  disabled={!selectedBloodRequest || connectingDonor}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {connectingDonor ? 'Sending...' : 'Send Request'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FindDonorPage;
