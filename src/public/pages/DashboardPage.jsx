import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Users, Calendar, Award, Bell, Settings, Clock, User, Phone, MapPin, Droplets, AlertCircle, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { bloodRequestAPI } from '../../utils/api';
import DonorResponseModal from '../components/DonorResponseModal';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [connectionRequests, setConnectionRequests] = useState([]);
  const [myBloodRequests, setMyBloodRequests] = useState([]);
  const [mySentConnections, setMySentConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state for donor responses
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Fetch connection requests for donors and user's own blood requests
  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch connection requests if user is a donor
        if (user.is_donor) {
          const connectionResponse = await bloodRequestAPI.getConnectionRequests();
          console.log('Connection requests response:', connectionResponse);
          setConnectionRequests(connectionResponse.connectionRequests || []);
        }

        // Fetch user's own blood requests
        const myRequestsResponse = await bloodRequestAPI.getMyRequests();
        console.log('My blood requests response:', myRequestsResponse);
        setMyBloodRequests(myRequestsResponse.bloodRequests || []);

        // Fetch connection requests sent by the user
        const mySentConnectionsResponse = await bloodRequestAPI.getMySentConnectionRequests();
        console.log('My sent connections response:', mySentConnectionsResponse);
        setMySentConnections(mySentConnectionsResponse.connectionRequests || []);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Helper function to get sent connections for a specific blood request
  const getSentConnectionsForRequest = (bloodRequestId) => {
    return mySentConnections.filter(conn => conn.blood_request_id === bloodRequestId);
  };

  const handleConnectionResponse = async (connectionId, response, message = '') => {
    try {
      await bloodRequestAPI.respondToConnection(connectionId, response, message);
      // Refresh connection requests
      const updatedResponse = await bloodRequestAPI.getConnectionRequests();
      setConnectionRequests(updatedResponse.connectionRequests || []);
    } catch (err) {
      console.error('Error responding to connection:', err);
    }
  };

  const handleRevertConnection = async (connectionId) => {
    try {
      await bloodRequestAPI.revertConnectionRequest(connectionId);
      // Refresh connection requests
      const updatedResponse = await bloodRequestAPI.getConnectionRequests();
      setConnectionRequests(updatedResponse.connectionRequests || []);
    } catch (err) {
      console.error('Error reverting connection:', err);
    }
  };

  // Modal handlers
  const openResponseModal = (action, request) => {
    setModalAction(action);
    setSelectedRequest(request);
    setModalOpen(true);
  };

  const closeResponseModal = () => {
    setModalOpen(false);
    setModalAction('');
    setSelectedRequest(null);
  };

  const handleModalConfirm = async (action, message) => {
    if (selectedRequest) {
      await handleConnectionResponse(selectedRequest.id, action, message);
      closeResponseModal();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString();
    } catch (error) {
      return 'Invalid date';
    }
  };

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
                <p className="text-2xl font-bold text-red-600">{user?.blood_type || 'Not set'}</p>
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
                <Bell className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Requests</h3>
                <p className="text-2xl font-bold text-yellow-600">
                  {user?.is_donor ? connectionRequests.filter(req => req.status === 'pending').length : 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions and Connection Requests */}
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

          {/* Connection Requests Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Bell className="w-5 h-5 mr-2 text-red-600" />
              Blood Donation Requests
              {connectionRequests.filter(req => req.status === 'pending').length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {connectionRequests.filter(req => req.status === 'pending').length}
                </span>
              )}
            </h2>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
              </div>
            ) : error ? (
              <div className="text-red-600 text-center py-8">{error}</div>
            ) : !user?.is_donor ? (
              <div className="text-center py-8">
                <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Register as a donor to receive blood donation requests</p>
                <Link 
                  to="/register-donor" 
                  className="mt-3 inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Become a Donor
                </Link>
              </div>
            ) : connectionRequests.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No blood donation requests yet</p>
                <p className="text-sm text-gray-400 mt-1">You'll see requests from people who need your blood type</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {connectionRequests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:border-red-300 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{request.requester?.full_name || 'Unknown User'}</h3>
                          <p className="text-sm text-gray-500">{request.requester?.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          request.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : request.status === 'accepted' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                    </div>
                    
                    {/* Blood Request Details */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-3">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Droplets className="w-5 h-5 text-red-600" />
                          <span className="font-bold text-lg text-red-600">
                            {request.bloodRequest?.blood_type || 'Unknown'}{request.bloodRequest?.rh_factor || ''} - {request.bloodRequest?.quantity || 'Unknown'} units
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(request.created_at)}
                        </span>
                      </div>

                      {/* Patient Information */}
                      {request.bloodRequest?.patient_name && (
                        <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <h4 className="font-semibold text-blue-800 mb-2">Patient Information</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-700">
                            <div><strong>Name:</strong> {request.bloodRequest.patient_name}</div>
                            {request.bloodRequest.patient_age && (
                              <div><strong>Age:</strong> {request.bloodRequest.patient_age} years</div>
                            )}
                            {request.bloodRequest.patient_gender && (
                              <div><strong>Gender:</strong> {request.bloodRequest.patient_gender}</div>
                            )}
                            {request.bloodRequest.purpose && (
                              <div className="md:col-span-2"><strong>Purpose:</strong> {request.bloodRequest.purpose}</div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Hospital & Location Information */}
                      <div className="mb-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <h4 className="font-semibold text-green-800 mb-2">Hospital & Location</h4>
                        <div className="space-y-2 text-sm text-green-700">
                          <div className="flex items-start space-x-2">
                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="font-medium">{request.bloodRequest?.hospital_name || 'Unknown Hospital'}</div>
                              {request.bloodRequest?.hospital_address && (
                                <div className="text-green-600">{request.bloodRequest.hospital_address}</div>
                              )}
                              {(request.bloodRequest?.district || request.bloodRequest?.province) && (
                                <div className="text-green-600">
                                  {[request.bloodRequest.municipality, request.bloodRequest.district, request.bloodRequest.province].filter(Boolean).join(', ')}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Contact Information */}
                      {(request.bloodRequest?.contact_name || request.bloodRequest?.contact_phone) && (
                        <div className="mb-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                          <h4 className="font-semibold text-orange-800 mb-2">Contact Information</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-orange-700">
                            {request.bloodRequest.contact_name && (
                              <div><strong>Contact Person:</strong> {request.bloodRequest.contact_name}</div>
                            )}
                            {request.bloodRequest.contact_phone && (
                              <div className="flex items-center space-x-1">
                                <Phone className="w-3 h-3" />
                                <span><strong>Phone:</strong> {request.bloodRequest.contact_phone}</span>
                              </div>
                            )}
                            {request.bloodRequest.relationship && (
                              <div><strong>Relationship:</strong> {request.bloodRequest.relationship}</div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Request Details */}
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span><strong>Urgency:</strong> <span className="capitalize">{request.bloodRequest?.urgency || 'Unknown'}</span></span>
                        </div>
                        {request.bloodRequest?.required_date && (
                          <div><strong>Required By:</strong> {request.bloodRequest.required_date}</div>
                        )}
                      </div>

                      {request.bloodRequest?.additional_info && (
                        <div className="mt-2 p-2 bg-gray-100 rounded text-sm text-gray-700">
                          <strong>Additional Info:</strong> {request.bloodRequest.additional_info}
                        </div>
                      )}
                      
                      {request.message && (
                        <div className="mt-2 p-2 bg-blue-100 rounded text-sm text-blue-800">
                          <strong>Your Message:</strong> {request.message}
                        </div>
                      )}
                    </div>
                    
                    {/* Requester Contact Information */}
                    <div className="bg-purple-50 rounded-lg p-3 mb-3 border border-purple-200">
                      <h4 className="font-semibold text-purple-800 mb-2">Requester Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-purple-700">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span><strong>Name:</strong> {request.requester?.full_name || 'Not provided'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4" />
                          <span><strong>Phone:</strong> {request.requester?.phone || 'Not provided'}</span>
                        </div>
                        {request.requester?.email && (
                          <div className="md:col-span-2">
                            <strong>Email:</strong> {request.requester.email}
                          </div>
                        )}
                        {request.requester?.address && (
                          <div className="md:col-span-2 flex items-start space-x-2">
                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span><strong>Address:</strong> {request.requester.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 mb-3">
                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => openResponseModal('accepted', request)}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                          >
                            Accept & Help
                          </button>
                          <button
                            onClick={() => openResponseModal('rejected', request)}
                            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                          >
                            Decline
                          </button>
                        </>
                      )}
                      
                      {/* Revert Button for Accepted/Rejected Requests */}
                      {request.status !== 'pending' && (
                        <button
                          onClick={() => handleRevertConnection(request.id)}
                          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium flex items-center justify-center gap-2"
                          title="Change your response back to pending"
                        >
                          <Clock className="w-4 h-4" />
                          Revert to Pending
                        </button>
                      )}
                      
                      {/* View Details Button - Always visible */}
                      <button
                        onClick={() => navigate(`/blood-request/${request.blood_request_id || request.bloodRequest?.id}`)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                        title="View Full Request Details"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                    </div>
                    
                    {/* Response Message */}
                    {request.status !== 'pending' && request.response_message && (
                      <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Your response:</strong> {request.response_message}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* My Blood Requests Section */}
        <div className="mt-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Droplets className="w-5 h-5 mr-2 text-blue-600" />
              My Blood Requests
              {myBloodRequests.filter(req => req.status === 'pending').length > 0 && (
                <span className="ml-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {myBloodRequests.filter(req => req.status === 'pending').length} active
                </span>
              )}
            </h2>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : myBloodRequests.length === 0 ? (
              <div className="text-center py-8">
                <Droplets className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No blood requests submitted yet</p>
                <p className="text-sm text-gray-400 mt-1">Submit a blood request to find donors</p>
                <Link 
                  to="/request" 
                  className="mt-3 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Request Blood
                </Link>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {myBloodRequests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Droplets className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{request.patient_name}</h3>
                          <p className="text-sm text-gray-500">Blood Request #{request.id}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          request.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : request.status === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {request.status || 'pending'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Blood Request Details */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-3">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Droplets className="w-5 h-5 text-red-600" />
                          <span className="font-bold text-lg text-red-600">
                            {request.blood_type || 'Unknown'}{request.rh_factor || ''} - {request.quantity || 'Unknown'} units
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(request.created_at)}
                        </span>
                      </div>

                      {/* Hospital Information */}
                      <div className="mb-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <h4 className="font-semibold text-green-800 mb-2">Hospital & Location</h4>
                        <div className="space-y-2 text-sm text-green-700">
                          <div className="flex items-start space-x-2">
                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="font-medium">{request.hospital_name || 'Unknown Hospital'}</div>
                              {request.hospital_address && (
                                <div className="text-green-600">{request.hospital_address}</div>
                              )}
                              {(request.district || request.province) && (
                                <div className="text-green-600">
                                  {[request.municipality, request.district, request.province].filter(Boolean).join(', ')}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Contact Information */}
                      {(request.contact_name || request.contact_phone) && (
                        <div className="mb-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                          <h4 className="font-semibold text-orange-800 mb-2">Contact Information</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-orange-700">
                            {request.contact_name && (
                              <div><strong>Contact Person:</strong> {request.contact_name}</div>
                            )}
                            {request.contact_phone && (
                              <div className="flex items-center space-x-1">
                                <Phone className="w-3 h-3" />
                                <span><strong>Phone:</strong> {request.contact_phone}</span>
                              </div>
                            )}
                            {request.relationship && (
                              <div><strong>Relationship:</strong> {request.relationship}</div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Request Details */}
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span><strong>Urgency:</strong> <span className="capitalize">{request.urgency || 'Unknown'}</span></span>
                        </div>
                        {request.required_date && (
                          <div><strong>Required By:</strong> {request.required_date}</div>
                        )}
                      </div>

                      {request.additional_info && (
                        <div className="mt-2 p-2 bg-gray-100 rounded text-sm text-gray-700">
                          <strong>Additional Info:</strong> {request.additional_info}
                        </div>
                      )}
                    </div>
                    
                    {/* Sent Connection Requests */}
                    {(() => {
                      const sentConnections = getSentConnectionsForRequest(request.id);
                      return sentConnections.length > 0 && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                            <Users className="w-4 h-4 mr-2" />
                            Connection Requests Sent ({sentConnections.length})
                          </h4>
                          <div className="space-y-3">
                            {sentConnections.map((connection) => (
                              <div key={connection.id} className="bg-white rounded-lg border border-blue-200 p-3">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                      <User className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div>
                                      <div className="font-medium text-gray-900">
                                        {connection.donor?.full_name || 'Unknown Donor'}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        Blood Type: {connection.donor?.blood_type || 'Unknown'}
                                      </div>
                                      {/* Only show contact details if donor accepted */}
                                      {connection.status === 'accepted' && connection.donor?.phone && (
                                        <div className="text-sm text-green-600 flex items-center font-medium">
                                          <Phone className="w-3 h-3 mr-1" />
                                          {connection.donor.phone}
                                        </div>
                                      )}
                                      {connection.status === 'pending' && (
                                        <div className="text-xs text-gray-500 italic">
                                          Contact details will be shown when donor accepts
                                        </div>
                                      )}
                                      <div className="text-xs text-gray-400 mt-1">
                                        Sent: {formatDate(connection.created_at)}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                      connection.status === 'pending' 
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : connection.status === 'accepted' 
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                      {connection.status === 'pending' && '⏳ Pending'}
                                      {connection.status === 'accepted' && '✅ Accepted'}
                                      {connection.status === 'rejected' && '❌ Rejected'}
                                    </span>
                                  </div>
                                </div>
                                
                                {/* Donor Message Display */}
                                {connection.response_message && (
                                  <div className={`mt-3 p-3 rounded-lg border-l-4 ${
                                    connection.status === 'accepted' 
                                      ? 'bg-green-50 border-green-400' 
                                      : 'bg-red-50 border-red-400'
                                  }`}>
                                    <div className="flex items-start space-x-2">
                                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                        connection.status === 'accepted' 
                                          ? 'bg-green-100 text-green-600' 
                                          : 'bg-red-100 text-red-600'
                                      }`}>
                                        💬
                                      </div>
                                      <div className="flex-1">
                                        <div className={`text-xs font-medium mb-1 ${
                                          connection.status === 'accepted' 
                                            ? 'text-green-800' 
                                            : 'text-red-800'
                                        }`}>
                                          Message from {connection.donor?.full_name || 'Donor'}:
                                        </div>
                                        <div className={`text-sm ${
                                          connection.status === 'accepted' 
                                            ? 'text-green-700' 
                                            : 'text-red-700'
                                        }`}>
                                          "{connection.response_message}"
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          {sentConnections.some(conn => conn.status === 'pending') && (
                            <div className="mt-3 text-sm text-blue-600 bg-blue-100 p-2 rounded">
                              💡 Tip: You have pending requests. Donors will be notified and can respond directly.
                            </div>
                          )}
                        </div>
                      );
                    })()}
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => navigate(`/blood-request/${request.id}`)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                        title="View Full Request Details"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                      
                      <Link
                        to="/find-donor"
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                        title="Find Donors for this Request"
                      >
                        <Users className="w-4 h-4" />
                        Find Donors
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
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

      {/* Donor Response Modal */}
      <DonorResponseModal
        isOpen={modalOpen}
        onClose={closeResponseModal}
        onConfirm={handleModalConfirm}
        action={modalAction}
        request={selectedRequest}
      />
    </div>
  );
};

export default DashboardPage;
