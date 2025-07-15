import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertTriangle, ArrowLeft, Eye } from 'lucide-react';
import { bloodRequestAPI } from '../../utils/api';
import AdminSidebar from '../AdminSidebar';

const fieldLabels = {
  patient_name: 'Patient Name',
  patient_age: 'Patient Age',
  patient_gender: 'Patient Gender',
  contact_name: 'Contact Name',
  contact_phone: 'Contact Phone',
  relationship: 'Relationship',
  blood_type: 'Blood Type',
  rh_factor: 'Rh Factor',
  quantity: 'Quantity',
  urgency: 'Urgency',
  required_date: 'Required Date',
  purpose: 'Purpose',
  hospital_name: 'Hospital Name',
  hospital_address: 'Hospital Address',
  province: 'Province',
  district: 'District',
  municipality: 'Municipality',
  ward: 'Ward',
  additional_info: 'Additional Info',
  prescription_url: 'Prescription',
  agreed_to_terms: 'Agreed to Terms',
  created_at: 'Created At',
  updated_at: 'Updated At',
};

const AdminBloodRequestDetailPage = ({ isDarkMode, toggleDarkMode }) => {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prescriptionImg, setPrescriptionImg] = useState(null);
  const [prescriptionLoading, setPrescriptionLoading] = useState(false);
  const [prescriptionError, setPrescriptionError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequest = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await bloodRequestAPI.getById(id);
        setRequest(res.request || null);
      } catch (err) {
        setError(err.message || 'Failed to fetch blood request');
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [id]);

  // Set prescription image URL directly
  useEffect(() => {
    if (request && request.prescription_url) {
      setPrescriptionLoading(true);
      setPrescriptionError(null);
      
      // Get direct URL to prescription image
      const imageUrl = bloodRequestAPI.getPrescriptionImageUrl(request.prescription_url);
      
      if (imageUrl) {
        setPrescriptionImg(imageUrl);
        setPrescriptionLoading(false);
      } else {
        setPrescriptionError('No prescription image available');
        setPrescriptionLoading(false);
      }
    } else {
      setPrescriptionImg(null);
      setPrescriptionLoading(false);
      setPrescriptionError(null);
    }
  }, [request && request.prescription_url]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <AdminSidebar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      <main className="flex-1 max-w-3xl mx-auto w-full px-8 py-10">
        <div className="flex items-center mb-8 gap-4">
          <button
            className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg p-2"
            onClick={() => navigate('/admin/blood-requests')}
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
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 p-8">
            {request && request.user && (
              <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg flex flex-col md:flex-row md:items-center md:gap-6 border border-blue-200 dark:border-blue-700">
                <div className="font-semibold text-blue-700 dark:text-blue-200">Requested By:</div>
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                  <span className="text-gray-900 dark:text-white font-medium">{request.user.full_name}</span>
                  <span className="text-gray-500 dark:text-gray-300">{request.user.email}</span>
                  <span className="text-gray-500 dark:text-gray-300">{request.user.phone}</span>
                  <button
                    className="text-blue-600 dark:text-blue-400 underline hover:no-underline font-medium"
                    onClick={() => navigate(`/admin/users?search=${encodeURIComponent(request.user.email)}`)}
                    title="View User Profile"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {Object.entries(fieldLabels).map(([key, label]) => {
                if (key === 'prescription_url' && request[key]) {
                  return (
                    <div key={key} className="col-span-2 flex flex-col gap-2">
                      <span className="font-semibold text-gray-700 dark:text-gray-200">{label}:</span>
                      {prescriptionLoading ? (
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400"><Loader2 className="w-5 h-5 animate-spin" /> Loading image...</div>
                      ) : prescriptionError ? (
                        <div className="text-red-500 dark:text-red-400">{prescriptionError}</div>
                      ) : prescriptionImg ? (
                        <>
                          <a
                            href={prescriptionImg}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            <Eye className="w-4 h-4" /> View Prescription Image
                          </a>
                          <img
                            src={prescriptionImg}
                            alt="Prescription"
                            className="rounded-lg border max-w-xs mt-2 shadow"
                            style={{ maxHeight: 300 }}
                          />
                        </>
                      ) : null}
                    </div>
                  );
                }
                if (key === 'agreed_to_terms') {
                  return (
                    <div key={key} className="flex flex-col">
                      <span className="font-semibold text-gray-700 dark:text-gray-200">{label}:</span>
                      <span className="text-sm text-gray-900 dark:text-gray-100">{request[key] ? 'Yes' : 'No'}</span>
                    </div>
                  );
                }
                if (request[key] === undefined || request[key] === null || request[key] === '') return null;
                return (
                  <div key={key} className="flex flex-col">
                    <span className="font-semibold text-gray-700 dark:text-gray-200">{label}:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">{request[key]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default AdminBloodRequestDetailPage;