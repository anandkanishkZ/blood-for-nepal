import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Mail, Calendar, Droplets, MapPin, CheckCircle, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../../utils/api';
import { showToast } from '../../utils/toast';
import SearchLocationInput from '../components/common/SearchLocationInput';

// Helper component for pre-filled field indicator
const PreFilledIndicator = ({ isVisible }) => {
  if (!isVisible) return null;
  
  return (
    <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-3 w-3">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 items-center justify-center">
        <Check className="h-2 w-2 text-white" />
      </span>
    </span>
  );
};

const DonorRegistrationPage = () => {
  const { t } = useLanguage();
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    patientName: '',
    phoneNumber: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    bloodType: '',
    rhFactor: '',
    lastDonation: '',
    medicalConditions: '',
    location: {
      province: '',
      district: '',
      municipality: ''
    },
    street: '',
    agreedToTerms: false,
    availableForEmergency: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [preFilledFields, setPreFilledFields] = useState({
    patientName: false,
    phoneNumber: false,
    email: false,
    dateOfBirth: false,
    gender: false,
    bloodType: false,
    rhFactor: false,
    lastDonation: false,
    medicalConditions: false,
    street: false,
    availableForEmergency: false
  });
  
  useEffect(() => {
    // Wait for auth check to complete
    if (isLoading) {
      return;
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/register-donor' } });
      return;
    }

    // Pre-fill form data with user information
    if (user) {
      // Format date for input (YYYY-MM-DD)
      const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        try {
          const date = new Date(dateString);
          return date.toISOString().split('T')[0];
        } catch {
          return '';
        }
      };

      // Parse blood type to separate blood type and Rh factor
      const parseBloodType = (bloodType) => {
        if (!bloodType) return { bloodType: '', rhFactor: '' };
        const match = bloodType.match(/^(A|B|AB|O)([+-])$/);
        if (match) {
          return {
            bloodType: match[1],
            rhFactor: match[2] // Keep as '+' or '-'
          };
        }
        return { bloodType: '', rhFactor: '' };
      };

      const { bloodType, rhFactor } = parseBloodType(user.blood_type);

      setFormData(prev => ({
        ...prev,
        // Personal Information
        patientName: user.full_name || user.name || '',
        email: user.email || '',
        phoneNumber: user.phone || '',
        dateOfBirth: formatDateForInput(user.date_of_birth),
        gender: user.gender || '',
        
        // Medical Information
        bloodType: bloodType,
        rhFactor: rhFactor,
        lastDonation: formatDateForInput(user.last_donation_date),
        medicalConditions: user.medical_conditions || '',
        
        // Location Information (if address is stored as a string, we'll keep it in street field)
        street: user.address || '',
        
        // Additional settings (if available in user profile)
        availableForEmergency: user.emergency_contact ? true : false
      }));

      // Track which fields were pre-filled
      setPreFilledFields({
        patientName: !!(user.full_name || user.name),
        phoneNumber: !!user.phone,
        email: !!user.email,
        dateOfBirth: !!user.date_of_birth,
        gender: !!user.gender,
        bloodType: !!bloodType,
        rhFactor: !!rhFactor,
        lastDonation: !!user.last_donation_date,
        medicalConditions: !!user.medical_conditions,
        street: !!user.address,
        availableForEmergency: !!user.emergency_contact
      });
    }
  }, [isAuthenticated, isLoading, user, navigate]);
  
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? e.target.checked : value
    });
  };
  
  const handleLocationSelected = (location) => {
    setFormData({
      ...formData,
      location: {
        province: location.province || '',
        district: location.district || '',
        municipality: location.municipality || ''
      }
    });
  };
  
  const nextStep = () => {
    setCurrentStep(currentStep + 1);
    window.scrollTo(0, 0);
  };
  
  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo(0, 0);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.patientName || !formData.phoneNumber || !formData.dateOfBirth || 
        !formData.gender || !formData.bloodType || !formData.rhFactor || 
        !formData.location.province || !formData.street || !formData.agreedToTerms) {
      showToast.error('Please fill in all required fields and agree to terms.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Clean up the data before sending - remove empty optional fields
      const cleanedData = { ...formData };
      
      // Remove empty optional fields to avoid validation errors
      if (!cleanedData.lastDonation || cleanedData.lastDonation.trim() === '') {
        delete cleanedData.lastDonation;
      }
      if (!cleanedData.medicalConditions || cleanedData.medicalConditions.trim() === '') {
        delete cleanedData.medicalConditions;
      }
      if (!cleanedData.email || cleanedData.email.trim() === '') {
        delete cleanedData.email;
      }
      
      const response = await authAPI.registerDonor(cleanedData);
      
      if (response.success) {
        showToast.success('Donor registration completed successfully!');
        setIsSuccess(true);
        
        // Redirect after showing success for a while
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to complete donor registration. Please try again.';
      showToast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            {t('registerTitle') || 'Register as Blood Donor'}
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t('registerSubtitle') || 'Join our community of life-savers'}
          </p>
        </div>
        
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 -translate-y-1/2"></div>
            <div 
              className="absolute top-1/2 left-0 h-1 bg-red-600 dark:bg-red-500 -translate-y-1/2 transition-all duration-300"
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            ></div>
            
            <div className={`relative rounded-full w-10 h-10 z-10 flex items-center justify-center ${
              currentStep >= 1 ? 'bg-red-600 dark:bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>
              <User className="h-5 w-5" />
            </div>
            <div className={`relative rounded-full w-10 h-10 z-10 flex items-center justify-center ${
              currentStep >= 2 ? 'bg-red-600 dark:bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>
              <Droplets className="h-5 w-5" />
            </div>
            <div className={`relative rounded-full w-10 h-10 z-10 flex items-center justify-center ${
              currentStep >= 3 ? 'bg-red-600 dark:bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>
              <MapPin className="h-5 w-5" />
            </div>
            <div className={`relative rounded-full w-10 h-10 z-10 flex items-center justify-center ${
              currentStep >= 4 ? 'bg-red-600 dark:bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
          
          <div className="flex justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
            <span>{t('personalInfo') || 'Personal Info'}</span>
            <span>{t('medicalInfo') || 'Medical Info'}</span>
            <span>{t('locationInfo') || 'Location Info'}</span>
            <span>Confirm</span>
          </div>
        </div>
        
        {isSuccess ? (
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8 text-center">
            <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Registration Successful!</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Thank you for registering as a blood donor. You are now part of our life-saving community.
            </p>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-500">
              Redirecting you to the homepage...
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg">
            <form onSubmit={handleSubmit}>
              {currentStep === 1 && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('personalInfo') || 'Personal Information'}</h2>
                  
                  {/* Pre-filled information notice */}
                  {user && (formData.patientName || formData.email || formData.phoneNumber || formData.dateOfBirth || formData.gender) && (
                    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            <strong>{t('infoPrefilledTitle') || 'Information Pre-filled'}:</strong> {t('infoPrefilledDescription') || "We've automatically filled in some fields from your profile. Please review and update any information as needed."}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('fullName') || 'Full Name'} *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="patientName"
                          name="patientName"
                          value={formData.patientName}
                          onChange={handleInputChange}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          required
                        />
                        <PreFilledIndicator isVisible={preFilledFields.patientName} />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('phoneNumber') || 'Phone Number'} *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          id="phoneNumber"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          required
                        />
                        <PreFilledIndicator isVisible={preFilledFields.phoneNumber} />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('email') || 'Email'}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <PreFilledIndicator isVisible={preFilledFields.email} />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('dateOfBirth') || 'Date of Birth'} *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="date"
                          id="dateOfBirth"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          required
                        />
                        <PreFilledIndicator isVisible={preFilledFields.dateOfBirth} />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('gender') || 'Gender'} *
                      </label>
                      <div className="relative">
                        <select
                          id="gender"
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          className="block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          required
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                        <PreFilledIndicator isVisible={preFilledFields.gender} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 flex justify-end">
                    <button
                      type="button"
                      onClick={nextStep}
                      className="ml-3 inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
              
              {currentStep === 2 && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('medicalInfo') || 'Medical Information'}</h2>
                  
                  {/* Pre-filled medical information notice */}
                  {user && (formData.bloodType || formData.rhFactor || formData.lastDonation || formData.medicalConditions) && (
                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <Droplets className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-green-700 dark:text-green-300">
                            <strong>{t('medicalPrefilledTitle') || 'Medical Data Pre-filled'}:</strong> {t('medicalPrefilledDescription') || "Your blood type and medical information from your profile have been automatically filled. Please verify and update if necessary."}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('bloodType') || 'Blood Type'} *
                      </label>
                      <div className="relative">
                        <select
                          id="bloodType"
                          name="bloodType"
                          value={formData.bloodType}
                          onChange={handleInputChange}
                          className="block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          required
                        >
                          <option value="">Select Blood Type</option>
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="AB">AB</option>
                          <option value="O">O</option>
                        </select>
                        <PreFilledIndicator isVisible={preFilledFields.bloodType} />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="rhFactor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('rhFactor') || 'Rh Factor'} *
                      </label>
                      <div className="relative">
                        <select
                          id="rhFactor"
                          name="rhFactor"
                          value={formData.rhFactor}
                          onChange={handleInputChange}
                          className="block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          required
                        >
                          <option value="">Select Rh Factor</option>
                          <option value="+">Positive (+)</option>
                          <option value="-">Negative (-)</option>
                        </select>
                        <PreFilledIndicator isVisible={preFilledFields.rhFactor} />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="lastDonation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('lastDonation') || 'Last Donation Date'}
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          id="lastDonation"
                          name="lastDonation"
                          value={formData.lastDonation}
                          onChange={handleInputChange}
                          className="block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <PreFilledIndicator isVisible={preFilledFields.lastDonation} />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="medicalConditions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('medicalConditions') || 'Medical Conditions'}
                      </label>
                      <div className="relative">
                        <textarea
                          id="medicalConditions"
                          name="medicalConditions"
                          value={formData.medicalConditions}
                          onChange={handleInputChange}
                          rows={3}
                          className="block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="List any medical conditions or medications..."
                        />
                        <PreFilledIndicator isVisible={preFilledFields.medicalConditions} />
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="availableForEmergency"
                        name="availableForEmergency"
                        type="checkbox"
                        checked={formData.availableForEmergency}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                      <label htmlFor="availableForEmergency" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                        I am available for emergency blood donation
                      </label>
                    </div>
                  </div>
                  
                  <div className="mt-8 flex justify-between">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="inline-flex justify-center py-2 px-6 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-white bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={nextStep}
                      className="ml-3 inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
              
              {currentStep === 3 && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">{t('locationInfo') || 'Location Information'}</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select Your Location *
                      </label>
                      <SearchLocationInput onLocationSelected={handleLocationSelected} />
                      
                      {formData.location.province && (
                        <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-semibold">Selected Location:</span> {formData.location.province}, {formData.location.district}, {formData.location.municipality}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="street" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('street') || 'Street Address'} *
                      </label>
                      <input
                        type="text"
                        id="street"
                        name="street"
                        value={formData.street}
                        onChange={handleInputChange}
                        className="block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter your street address"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mt-8 flex justify-between">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="inline-flex justify-center py-2 px-6 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-white bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={nextStep}
                      className="ml-3 inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
              
              {currentStep === 4 && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Confirm Your Information</h2>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('personalInfo') || 'Personal Information'}</h3>
                      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{t('fullName') || 'Full Name'}</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{formData.patientName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{t('phoneNumber') || 'Phone Number'}</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{formData.phoneNumber}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{t('email') || 'Email'}</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{formData.email || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{t('dateOfBirth') || 'Date of Birth'}</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{formData.dateOfBirth}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{t('gender') || 'Gender'}</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{formData.gender}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('medicalInfo') || 'Medical Information'}</h3>
                      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{t('bloodType') || 'Blood Type'}</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{formData.bloodType} {formData.rhFactor}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{t('lastDonation') || 'Last Donation'}</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{formData.lastDonation || '-'}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400">{t('medicalConditions') || 'Medical Conditions'}</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{formData.medicalConditions || '-'}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Emergency Availability</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {formData.availableForEmergency ? 'Available for emergency' : 'Not available for emergency'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('locationInfo') || 'Location Information'}</h3>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Address</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {formData.street}, {formData.location.municipality}, {formData.location.district}, {formData.location.province}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="agreedToTerms"
                          name="agreedToTerms"
                          type="checkbox"
                          checked={formData.agreedToTerms}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                          required
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="agreedToTerms" className="font-medium text-gray-700 dark:text-gray-300">
                          I agree to the <a href="#" className="text-red-600 hover:text-red-500">Terms and Conditions</a> and <a href="#" className="text-red-600 hover:text-red-500">Privacy Policy</a>
                        </label>
                        <p className="text-gray-500 dark:text-gray-400">
                          By registering, you agree to be contacted for blood donation purposes.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 flex justify-between">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="inline-flex justify-center py-2 px-6 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-white bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Previous
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !formData.agreedToTerms}
                      className={`ml-3 inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                        isSubmitting || !formData.agreedToTerms 
                          ? 'bg-red-300 dark:bg-red-800 cursor-not-allowed' 
                          : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                      }`}
                    >
                      {isSubmitting ? 'Submitting...' : 'Register as Donor'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonorRegistrationPage;
