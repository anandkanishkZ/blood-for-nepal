import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, UserPlus, Droplets, Phone, ArrowLeft, CheckCircle, X } from 'lucide-react';
import { showToast } from '../../utils/toast';
import { showActionableToast } from '../components/common/ActionableToast';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../../utils/api';
import logo from '../../assets/logo-transparent.png';

// Component functions moved outside to prevent recreation
const RegistrationForm = ({ 
  formData, 
  handleInputChange, 
  handleFormSubmit, 
  showPassword, 
  setShowPassword, 
  showConfirmPassword, 
  setShowConfirmPassword 
}) => {
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <img src={logo} alt="Blood For Nepal" className="h-16 w-16 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-900">Join Blood For Nepal</h2>
        <p className="text-gray-600 mt-2">Help save lives by becoming a donor</p>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="inline w-4 h-4 mr-1" />
            Full Name
          </label>
          <input
            type="text"
            name="fullName"
            required
            value={formData.fullName}
            onChange={handleInputChange}
            tabIndex="1"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="inline w-4 h-4 mr-1" />
            Email Address
          </label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            tabIndex="2"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
            placeholder="Enter your email address"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="inline w-4 h-4 mr-1" />
            Phone Number
            <span className="text-sm text-gray-500 ml-1">(Optional for email verification)</span>
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            tabIndex="3"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
            placeholder="98XXXXXXXX"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Droplets className="inline w-4 h-4 mr-1" />
            Blood Type
          </label>
          <select
            name="bloodType"
            required
            value={formData.bloodType}
            onChange={handleInputChange}
            tabIndex="4"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
          >
            <option value="">Select your blood type</option>
            {bloodTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Lock className="inline w-4 h-4 mr-1" />
            Password
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            required
            value={formData.password}
            onChange={handleInputChange}
            tabIndex="5"
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
            placeholder="Create a strong password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex="-1"
            className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Lock className="inline w-4 h-4 mr-1" />
            Confirm Password
          </label>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            required
            value={formData.confirmPassword}
            onChange={handleInputChange}
            tabIndex="6"
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
            placeholder="Confirm your password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            tabIndex="-1"
            className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        <button
          type="submit"
          tabIndex="7"
          className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-6 rounded-lg hover:from-red-700 hover:to-red-800 font-medium transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Continue to Verification
        </button>

        <div className="text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-red-600 hover:text-red-700 font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

const VerificationChoice = ({ formData, setFormData, setStep, handleRegistration, isSubmitting }) => (
  <div className="space-y-6">
    <div className="text-center">
      <Droplets className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Verification Method</h2>
      <p className="text-gray-600">How would you like to verify your account?</p>
    </div>

    <div className="space-y-4">
      <div 
        className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 transform hover:scale-[1.02] ${
          formData.verificationMethod === 'email' 
            ? 'border-red-500 bg-red-50 shadow-lg' 
            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
        }`}
        onClick={() => setFormData({...formData, verificationMethod: 'email'})}
      >
        <div className="flex items-start space-x-4">
          <div className={`p-3 rounded-full ${formData.verificationMethod === 'email' ? 'bg-red-500' : 'bg-gray-400'}`}>
            <Mail className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg">Email Verification</h3>
            <p className="text-gray-600 mt-1">We'll send a verification link to your email</p>
            <p className="text-sm text-gray-500 mt-1">{formData.email}</p>
            <div className="flex items-center space-x-4 text-xs text-gray-500 mt-3">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Instant delivery
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Click to verify
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Valid for 24 hours
              </span>
            </div>
          </div>
          {formData.verificationMethod === 'email' && (
            <CheckCircle className="w-6 h-6 text-red-500" />
          )}
        </div>
      </div>

      {formData.phone && (
        <div 
          className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 transform hover:scale-[1.02] ${
            formData.verificationMethod === 'sms' 
              ? 'border-red-500 bg-red-50 shadow-lg' 
              : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
          }`}
          onClick={() => setFormData({...formData, verificationMethod: 'sms'})}
        >
          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-full ${formData.verificationMethod === 'sms' ? 'bg-red-500' : 'bg-gray-400'}`}>
              <Phone className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-lg">SMS Verification</h3>
              <p className="text-gray-600 mt-1">We'll send a 6-digit code to your phone</p>
              <p className="text-sm text-gray-500 mt-1">****{formData.phone.slice(-4)}</p>
              <div className="flex items-center space-x-4 text-xs text-gray-500 mt-3">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Quick & secure
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Works offline
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Valid for 10 minutes
                </span>
              </div>
            </div>
            {formData.verificationMethod === 'sms' && (
              <CheckCircle className="w-6 h-6 text-red-500" />
            )}
          </div>
        </div>
      )}
    </div>

    <div className="flex space-x-3">
      <button
        type="button"
        onClick={() => setStep(1)}
        className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 font-medium transition-colors flex items-center justify-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>
      <button
        type="button"
        onClick={handleRegistration}
        disabled={isSubmitting}
        className="flex-2 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-8 rounded-lg hover:from-red-700 hover:to-red-800 disabled:opacity-50 font-medium transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Creating Account...
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4" />
            Create Account
          </>
        )}
      </button>
    </div>
  </div>
);

const VerificationStep = ({ registrationData, navigate }) => {
  if (!registrationData) return null;

  return (
    <div className="text-center space-y-6">
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="w-8 h-8 text-green-500" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Created Successfully!</h2>
        <p className="text-gray-600">
          {registrationData.method === 'email' 
            ? 'We\'ve sent a verification link to your email address.'
            : 'We\'ve sent a verification code to your phone number.'
          }
        </p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Next Steps:</strong><br />
              {registrationData.method === 'email' 
                ? 'Check your email and click the verification link to complete your registration.'
                : 'Check your phone for the verification code and enter it on the next page.'
              }
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={() => navigate(`/verify/${registrationData.userId}`)}
        className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-6 rounded-lg hover:from-red-700 hover:to-red-800 font-medium transition-all duration-200 transform hover:scale-[1.02]"
      >
        Continue to Verification
      </button>

      <div className="text-center">
        <Link to="/login" className="text-gray-600 hover:text-gray-800">
          ← Back to Login
        </Link>
      </div>
    </div>
  );
};

const RegisterPage = () => {
  const [step, setStep] = useState(1); // 1: Form, 2: Verification Choice, 3: Verification
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    bloodType: '',
    password: '',
    confirmPassword: '',
    verificationMethod: 'email' // Default to email
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);
  
  const { t } = useLanguage();
  const { isAuthenticated, clearError } = useAuth();
  const navigate = useNavigate();

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const validateForm = useCallback(() => {
    const errors = [];
    
    if (!formData.fullName.trim()) errors.push('Full name is required');
    if (!formData.email.trim()) errors.push('Email is required');
    if (!formData.bloodType) errors.push('Blood type is required');
    if (!formData.password) errors.push('Password is required');
    if (formData.password.length < 6) errors.push('Password must be at least 6 characters');
    if (formData.password !== formData.confirmPassword) errors.push('Passwords do not match');
    
    if (formData.verificationMethod === 'sms' && !formData.phone.trim()) {
      errors.push('Phone number is required for SMS verification');
    }

    if (formData.phone && !/^(98|97)\d{8}$/.test(formData.phone.replace(/\D/g, ''))) {
      errors.push('Please enter a valid Nepal mobile number (98XXXXXXXX)');
    }

    return errors;
  }, [formData]);

  const handleFormSubmit = useCallback((e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach(error => showToast.error(error));
      return;
    }

    setStep(2); // Move to verification choice
  }, [formData]); // Add formData as dependency since validateForm uses it

  const handleRegistration = async () => {
    setIsSubmitting(true);
    try {
      const response = await authAPI.register(formData);
      setRegistrationData(response.data);
      showToast.success(response.message);
      setStep(3); // Move to verification step
    } catch (error) {
      console.error('Registration error:', error);
      
      // Check if error is an object with action information
      if (typeof error.message === 'object' && error.message.action) {
        showActionableToast.error(error.message.message, error.message.action, error.message.actionText);
      } else {
        showToast.error(error.message || 'Registration failed. Please try again.');
      }
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-red-100 rounded-full translate-y-12 -translate-x-12 opacity-50"></div>
        
        <div className="relative z-10">
          {step === 1 && (
            <RegistrationForm 
              formData={formData}
              handleInputChange={handleInputChange}
              handleFormSubmit={handleFormSubmit}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              showConfirmPassword={showConfirmPassword}
              setShowConfirmPassword={setShowConfirmPassword}
            />
          )}
          {step === 2 && (
            <VerificationChoice 
              formData={formData}
              setFormData={setFormData}
              setStep={setStep}
              handleRegistration={handleRegistration}
              isSubmitting={isSubmitting}
            />
          )}
          {step === 3 && (
            <VerificationStep 
              registrationData={registrationData}
              navigate={navigate}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
