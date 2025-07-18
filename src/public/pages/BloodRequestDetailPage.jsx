import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Loader2, 
  AlertTriangle, 
  ArrowLeft, 
  Eye, 
  Heart,
  User,
  Phone,
  MapPin,
  Clock,
  Droplets,
  Building,
  Calendar,
  FileText,
  Info
} from 'lucide-react';
import { bloodRequestAPI } from '../../utils/api';
import { useAuth } from '../context/AuthContext';

const fieldLabels = {
  patient_name: 'Patient Name',
  patient_age: 'Patient Age',
  patient_gender: 'Patient Gender',
  contact_name: 'Contact Name',
  contact_phone: 'Contact Phone',
  relationship: 'Relationship',
  blood_type: 'Blood Type',
  rh_factor: 'Rh Factor',
  quantity: 'Quantity (Units)',
  urgency: 'Urgency Level',
  required_date: 'Required Date',
  purpose: 'Purpose',
  hospital_name: 'Hospital Name',
  hospital_address: 'Hospital Address',
  province: 'Province',
  district: 'District',
  municipality: 'Municipality',
  ward: 'Ward',
  additional_info: 'Additional Information',
  status: 'Request Status',
  created_at: 'Request Created',
  updated_at: 'Last Updated'
};

const BloodRequestDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prescriptionImg, setPrescriptionImg] = useState(null);
  const [prescriptionLoading, setPrescriptionLoading] = useState(false);
  const [prescriptionError, setPrescriptionError] = useState(null);

  useEffect(() => {
    const fetchRequest = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await bloodRequestAPI.getById(id);
        const bloodRequest = res.request || res.data?.request || res;
        
        // Check if user has permission to view this request
        // Users can view their own requests or if they're involved in the connection
        if (!user || (bloodRequest.user_id !== user.id && user.role !== 'admin')) {
          setError('You do not have permission to view this blood request.');
          return;
        }
        
        setRequest(bloodRequest);
      } catch (err) {
        console.error('Failed to fetch blood request:', err);
        setError(err.message || 'Failed to fetch blood request');
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [id, user]);

  // Load prescription image if available
  useEffect(() => {
    if (request && request.prescription_url) {
      setPrescriptionLoading(true);
      setPrescriptionError(null);
      
      const loadImage = () => {
        const img = new Image();
        img.onload = () => {
          setPrescriptionImg(`http://localhost:5000${request.prescription_url}`);
          setPrescriptionLoading(false);
        };
        img.onerror = () => {
          setPrescriptionError('Failed to load prescription image');
          setPrescriptionLoading(false);
        };
        img.src = `http://localhost:5000${request.prescription_url}`;
      };

      loadImage();
    }
  }, [request && request.prescription_url]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'urgent':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'normal':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'low':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8 gap-4">
          <button
            className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg p-2 transition-colors"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Blood Request Details</h1>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-10 h-10 mb-2" />
            <span className="text-lg font-semibold">{error}</span>
          </div>
        ) : request ? (
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700">
            
            {/* Header Section with Key Info */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <Droplets className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {request.blood_type}{request.rh_factor} Blood Request
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {request.quantity} units needed for {request.patient_name}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                    {request.status || 'Pending'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(request.urgency)}`}>
                    {request.urgency || 'Normal'} Priority
                  </span>
                </div>
              </div>
            </div>

            {/* Request Information */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Patient Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Patient Information
                  </h3>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg space-y-3">
                    {request.patient_name && (
                      <div>
                        <span className="font-medium text-blue-800 dark:text-blue-200">Name:</span>
                        <span className="ml-2 text-blue-700 dark:text-blue-300">{request.patient_name}</span>
                      </div>
                    )}
                    {request.patient_age && (
                      <div>
                        <span className="font-medium text-blue-800 dark:text-blue-200">Age:</span>
                        <span className="ml-2 text-blue-700 dark:text-blue-300">{request.patient_age} years</span>
                      </div>
                    )}
                    {request.patient_gender && (
                      <div>
                        <span className="font-medium text-blue-800 dark:text-blue-200">Gender:</span>
                        <span className="ml-2 text-blue-700 dark:text-blue-300 capitalize">{request.patient_gender}</span>
                      </div>
                    )}
                    {request.purpose && (
                      <div>
                        <span className="font-medium text-blue-800 dark:text-blue-200">Purpose:</span>
                        <span className="ml-2 text-blue-700 dark:text-blue-300">{request.purpose}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Phone className="w-5 h-5 text-green-600" />
                    Contact Information
                  </h3>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg space-y-3">
                    {request.contact_name && (
                      <div>
                        <span className="font-medium text-green-800 dark:text-green-200">Contact Person:</span>
                        <span className="ml-2 text-green-700 dark:text-green-300">{request.contact_name}</span>
                      </div>
                    )}
                    {request.contact_phone && (
                      <div>
                        <span className="font-medium text-green-800 dark:text-green-200">Phone:</span>
                        <span className="ml-2 text-green-700 dark:text-green-300">{request.contact_phone}</span>
                      </div>
                    )}
                    {request.relationship && (
                      <div>
                        <span className="font-medium text-green-800 dark:text-green-200">Relationship:</span>
                        <span className="ml-2 text-green-700 dark:text-green-300">{request.relationship}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hospital Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Building className="w-5 h-5 text-purple-600" />
                    Hospital Information
                  </h3>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg space-y-3">
                    {request.hospital_name && (
                      <div>
                        <span className="font-medium text-purple-800 dark:text-purple-200">Hospital:</span>
                        <span className="ml-2 text-purple-700 dark:text-purple-300">{request.hospital_name}</span>
                      </div>
                    )}
                    {request.hospital_address && (
                      <div>
                        <span className="font-medium text-purple-800 dark:text-purple-200">Address:</span>
                        <span className="ml-2 text-purple-700 dark:text-purple-300">{request.hospital_address}</span>
                      </div>
                    )}
                    {(request.municipality || request.district || request.province) && (
                      <div>
                        <span className="font-medium text-purple-800 dark:text-purple-200">Location:</span>
                        <span className="ml-2 text-purple-700 dark:text-purple-300">
                          {[request.municipality, request.district, request.province].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Request Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-orange-600" />
                    Request Details
                  </h3>
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg space-y-3">
                    {request.required_date && (
                      <div>
                        <span className="font-medium text-orange-800 dark:text-orange-200">Required By:</span>
                        <span className="ml-2 text-orange-700 dark:text-orange-300">{request.required_date}</span>
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-orange-800 dark:text-orange-200">Created:</span>
                      <span className="ml-2 text-orange-700 dark:text-orange-300">{formatDate(request.created_at)}</span>
                    </div>
                    {request.updated_at && request.updated_at !== request.created_at && (
                      <div>
                        <span className="font-medium text-orange-800 dark:text-orange-200">Last Updated:</span>
                        <span className="ml-2 text-orange-700 dark:text-orange-300">{formatDate(request.updated_at)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              {request.additional_info && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <Info className="w-5 h-5 text-gray-600" />
                    Additional Information
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-gray-700 dark:text-gray-300">{request.additional_info}</p>
                  </div>
                </div>
              )}

              {/* Prescription */}
              {request.prescription_url && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-red-600" />
                    Prescription
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    {prescriptionLoading ? (
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <Loader2 className="w-5 h-5 animate-spin" /> Loading prescription...
                      </div>
                    ) : prescriptionError ? (
                      <div className="text-red-500 dark:text-red-400">{prescriptionError}</div>
                    ) : prescriptionImg ? (
                      <div className="space-y-3">
                        <a
                          href={prescriptionImg}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          <Eye className="w-4 h-4" /> View Full Size Prescription
                        </a>
                        <img
                          src={prescriptionImg}
                          alt="Prescription"
                          className="rounded-lg border max-w-md shadow-lg"
                          style={{ maxHeight: 400 }}
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">Blood request not found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BloodRequestDetailPage;
