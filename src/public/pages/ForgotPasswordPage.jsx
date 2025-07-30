import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Mail, Lock, AlertTriangle, ArrowLeft, Send, RotateCcw } from 'lucide-react';
import logoTransparent from '../../assets/logo-transparent.png';

const ForgotPasswordPage = () => {
  const [formData, setFormData] = useState({
    email: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [responseData, setResponseData] = useState(null);

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Redirect to dashboard if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.trim()) {
      toast.error('कृपया आफ्नो इमेल ठेगाना प्रविष्ट गर्नुहोस्। (Please enter your email address.)');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('कृपया मान्य इमेल ठेगाना प्रविष्ट गर्नुहोस्। (Please enter a valid email address.)');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          method: 'email'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        setResponseData(data.data);
        toast.success(data.message);
      } else {
        toast.error(data.message || 'पासवर्ड रिसेट पठाउन असफल भयो। (Failed to send password reset.)');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error('नेटवर्क त्रुटि। कृपया फेरि प्रयास गर्नुहोस्। (Network error. Please try again.)');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const handleTryAgain = () => {
    setIsSubmitted(false);
    setResponseData(null);
    setFormData({
      email: ''
    });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <img 
                src={logoTransparent} 
                alt="Blood For Nepal Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
              <Send className="w-6 h-6 text-green-600" />
              Reset Instructions Sent
            </h2>
            
            <p className="text-gray-600 mb-6">
              पासवर्ड रिसेट लिंक तपाईंको इमेलमा पठाइयो।
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="text-sm text-blue-800">
                <p><strong>Method:</strong> Email</p>
                <p><strong>Expires in:</strong> {responseData?.expiresIn}</p>
                {responseData?.destination && (
                  <p><strong>Sent to:</strong> {responseData.destination}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={handleBackToLogin}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition duration-200 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Login
              </button>
              
              <button
                onClick={handleTryAgain}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition duration-200 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Send Another Reset
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-4">
              Didn't receive the email? Check your spam folder or try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <img 
              src={logoTransparent} 
              alt="Blood For Nepal Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
            <Lock className="w-8 h-8 text-red-600" />
            Forgot Password
          </h1>
          
          <p className="text-gray-600">
            Recover your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your registered email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200"
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending Reset Instructions...
              </>
            ) : (
              'Send Reset Instructions'
            )}
          </button>
        </form>

        <div className="mt-6 text-center space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span><strong>Security Note:</strong> For your security, we'll send reset instructions to your registered email address. 
              The reset link will expire in 30 minutes.</span>
            </p>
          </div>
          
          <div className="text-sm">
            <span className="text-gray-600">Remember your password? </span>
            <Link 
              to="/login" 
              className="font-medium text-red-600 hover:text-red-500 transition duration-200"
            >
              Back to Login
            </Link>
          </div>
          
          <div className="text-sm">
            <span className="text-gray-600">Don't have an account? </span>
            <Link 
              to="/register" 
              className="font-medium text-red-600 hover:text-red-500 transition duration-200"
            >
              Sign up here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
