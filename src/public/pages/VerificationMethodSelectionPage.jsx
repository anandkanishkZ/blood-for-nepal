import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mail, Phone, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { showToast } from '../../utils/toast';
import { authAPI } from '../../utils/api';
import logo from '../../assets/logo-transparent.png';

const VerificationMethodSelectionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  // Get user data from navigation state
  const userId = location.state?.userId;
  const userEmail = location.state?.email;
  const userPhone = location.state?.phone;

  // Redirect to login if no user data
  useEffect(() => {
    if (!userId) {
      navigate('/login', { replace: true });
      return;
    }
    
    setUserInfo({
      userId,
      email: userEmail,
      phone: userPhone
    });
  }, [userId, userEmail, userPhone, navigate]);

  const handleMethodSelection = (method) => {
    setSelectedMethod(method);
  };

  const handleContinue = async () => {
    if (!selectedMethod) {
      showToast.error('Please select a verification method');
      return;
    }

    // Validate method availability
    if (selectedMethod === 'email' && !userEmail) {
      showToast.error('Email address is not available for verification');
      return;
    }

    if (selectedMethod === 'sms' && !userPhone) {
      showToast.error('Phone number is not available for verification');
      return;
    }

    setIsSubmitting(true);

    try {
      // Switch to selected verification method and send verification
      const response = await authAPI.switchVerificationMethod(userId, selectedMethod);
      
      showToast.success(response.message || 'Verification method updated successfully');
      
      // Navigate to verification page with method-specific data
      if (selectedMethod === 'email') {
        navigate('/email-verification-needed', {
          state: {
            userId,
            userEmail,
            verificationMethod: 'email'
          }
        });
      } else {
        navigate('/sms-verification-needed', {
          state: {
            userId,
            userPhone,
            verificationMethod: 'sms'
          }
        });
      }
    } catch (error) {
      showToast.error(error.message || 'Failed to update verification method. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login', { replace: true });
  };

  if (!userInfo) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-red-100 rounded-full translate-y-12 -translate-x-12 opacity-50"></div>
        
        {/* Logo */}
        <div className="text-center mb-6 relative z-10">
          <img src={logo} alt="Blood For Nepal" className="h-12 w-15 mx-auto" />
        </div>
        
        <div className="relative z-10">
          <div className="text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-blue-500" />
            </div>
            
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-gray-900">Choose Verification Method</h2>
              <p className="text-gray-600 leading-relaxed">
                Please select how you'd like to verify your account. We'll send you a verification code using your chosen method.
              </p>
            </div>

            {/* Verification Methods */}
            <div className="space-y-4">
              {/* Email Method */}
              <div
                onClick={() => handleMethodSelection('email')}
                className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                  selectedMethod === 'email'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${!userEmail ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    selectedMethod === 'email' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Mail className="w-6 h-6" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-gray-900">Email Verification</h3>
                    <p className="text-sm text-gray-600">
                      {userEmail ? `We'll send a verification link to ${userEmail}` : 'Email address not available'}
                    </p>
                  </div>
                  {selectedMethod === 'email' && (
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                  )}
                </div>
              </div>

              {/* SMS Method */}
              <div
                onClick={() => handleMethodSelection('sms')}
                className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                  selectedMethod === 'sms'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${!userPhone ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    selectedMethod === 'sms' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Phone className="w-6 h-6" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-gray-900">SMS Verification</h3>
                    <p className="text-sm text-gray-600">
                      {userPhone ? `We'll send a verification code to ${userPhone}` : 'Phone number not available'}
                    </p>
                  </div>
                  {selectedMethod === 'sms' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>
              </div>
            </div>

            {/* Information Box */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">Why do we need verification?</p>
                  <p>Account verification helps us ensure the security of your account and prevents unauthorized access.</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleContinue}
                disabled={!selectedMethod || isSubmitting}
                className="w-full bg-red-600 text-white py-3 px-6 rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  'Continue with Selected Method'
                )}
              </button>
              
              <button
                onClick={handleBackToLogin}
                className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-xl hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationMethodSelectionPage;
