import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, MapPin, HeartPulse as Pulse, User, Phone, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import BloodTypeCard from '../components/common/BloodTypeCard';

const EmergencyPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [seconds, setSeconds] = useState(5);
  const [formData, setFormData] = useState({
    patientName: '',
    contactName: '',
    contactPhone: '',
    bloodType: '',
    rhFactor: '',
    location: {
      province: '',
      district: '',
      municipality: '',
      ward: ''
    },
    hospitalName: '',
    additionalInfo: '',
  });
  
  useEffect(() => {
    let timer;
    if (isSuccess && seconds > 0) {
      timer = window.setTimeout(() => setSeconds(seconds - 1), 1000);
    } else if (isSuccess && seconds === 0) {
      navigate('/');
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isSuccess, seconds, navigate]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleBloodTypeSelect = (type, rhFactor) => {
    setFormData({
      ...formData,
      bloodType: type,
      rhFactor: rhFactor
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };
  
  const bloodTypes = [
    { type: 'A', rhFactor: '+' },
    { type: 'A', rhFactor: '-' },
    { type: 'B', rhFactor: '+' },
    { type: 'B', rhFactor: '-' },
    { type: 'AB', rhFactor: '+' },
    { type: 'AB', rhFactor: '-' },
    { type: 'O', rhFactor: '+' },
    { type: 'O', rhFactor: '-' },
  ];
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-500 mx-auto mb-2" />
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Emergency Blood Request
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Submit an urgent blood request for immediate assistance
          </p>
          
          <div className="animate-pulse mt-4 inline-flex items-center px-4 py-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 rounded-full">
            <Pulse className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">SOS Mode Active</span>
          </div>
        </div>
        
        {isSuccess ? (
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8 text-center">
            <div className="w-20 h-20 mx-auto bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center animate-pulse">
              <Heart className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">Emergency Request Sent!</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Your emergency blood request has been sent to all matching donors in the vicinity.
            </p>
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/30 rounded-lg">
              <p className="text-red-800 dark:text-red-200 font-medium">
                Emergency ID: <span className="font-bold">BFNE-{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</span>
              </p>
              <p className="mt-1 text-red-600 dark:text-red-300 text-sm">
                37 potential donors have been notified in your area
              </p>
            </div>
            <div className="mt-6 text-sm text-gray-500">
              Redirecting you to the homepage in {seconds} seconds...
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg">
            <div className="bg-red-600 dark:bg-red-800 px-4 py-3 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-white mr-2" />
                  <span className="text-white font-medium">Response Time: ASAP (Minutes)</span>
                </div>
                <div className="animate-pulse flex items-center">
                  <span className="h-2 w-2 rounded-full bg-white mr-1"></span>
                  <span className="text-white text-sm">Live</span>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-6">
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">Required Blood Type</h2>
                  <div className="grid grid-cols-4 gap-3">
                    {bloodTypes.map((bt) => (
                      <BloodTypeCard
                        key={`${bt.type}${bt.rhFactor}`}
                        type={bt.type}
                        rhFactor={bt.rhFactor}
                        isAvailable={true}
                        onClick={() => handleBloodTypeSelect(bt.type, bt.rhFactor)}
                      />
                    ))}
                  </div>
                  {formData.bloodType && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Selected: <span className="font-medium">{formData.bloodType}{formData.rhFactor}</span>
                    </p>
                  )}
                </div>
                
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">Location Information</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="hospitalName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Hospital/Location Name *
                      </label>
                      <input
                        type="text"
                        id="hospitalName"
                        name="hospitalName"
                        value={formData.hospitalName}
                        onChange={handleInputChange}
                        className="block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                        placeholder="e.g., Bir Hospital, Teaching Hospital"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Emergency Location *
                      </label>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Province"
                          value={formData.location.province}
                          onChange={(e) => setFormData({
                            ...formData,
                            location: { ...formData.location, province: e.target.value }
                          })}
                          className="block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          required
                        />
                        <input
                          type="text"
                          placeholder="District"
                          value={formData.location.district}
                          onChange={(e) => setFormData({
                            ...formData,
                            location: { ...formData.location, district: e.target.value }
                          })}
                          className="block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Municipality"
                          value={formData.location.municipality}
                          onChange={(e) => setFormData({
                            ...formData,
                            location: { ...formData.location, municipality: e.target.value }
                          })}
                          className="block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Ward (optional)"
                          value={formData.location.ward}
                          onChange={(e) => setFormData({
                            ...formData,
                            location: { ...formData.location, ward: e.target.value }
                          })}
                          className="block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      
                      {formData.location.province && (
                        <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-semibold">Selected Location:</span> {formData.location.province}, {formData.location.district}, {formData.location.municipality}
                            {formData.location.ward ? `, Ward ${formData.location.ward}` : ''}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">Contact Information</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Patient Name *
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
                          placeholder="Patient's full name"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Contact Person Name *
                      </label>
                      <input
                        type="text"
                        id="contactName"
                        name="contactName"
                        value={formData.contactName}
                        onChange={handleInputChange}
                        className="block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                        placeholder="Your name or responsible person"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Contact Phone *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          id="contactPhone"
                          name="contactPhone"
                          value={formData.contactPhone}
                          onChange={handleInputChange}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          required
                          placeholder="9841234567"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Emergency Details
                      </label>
                      <textarea
                        id="additionalInfo"
                        name="additionalInfo"
                        value={formData.additionalInfo}
                        onChange={handleInputChange}
                        rows={2}
                        className="block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Brief description of the emergency situation..."
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.bloodType || !formData.hospitalName || !formData.patientName || !formData.contactName || !formData.contactPhone || !formData.location.province}
                  className={`w-full inline-flex justify-center items-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white transition-colors ${
                    isSubmitting || !formData.bloodType || !formData.hospitalName || !formData.patientName || !formData.contactName || !formData.contactPhone || !formData.location.province
                      ? 'bg-red-400 cursor-not-allowed' 
                      : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing Emergency Request...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      Send Emergency Request
                    </>
                  )}
                </button>
                
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    This will immediately notify all matching donors in the area.
                    <br />
                    Emergency requests are prioritized over regular requests.
                  </p>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyPage;
