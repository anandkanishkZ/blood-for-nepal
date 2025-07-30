import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { 
  AlertTriangle, 
  RotateCcw, 
  ArrowLeft, 
  Lock, 
  Ticket, 
  Eye, 
  EyeOff,
  CheckCircle,
  Shield
} from 'lucide-react';
import logoTransparent from '../../assets/logo-transparent.png';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    token: searchParams.get('token') || '',
    password: '',
    confirmPassword: '',
    method: 'email'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Verify token on component mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!formData.token) {
        setIsVerifying(false);
        return;
      }

      try {
        const response = await fetch(`/api/v1/auth/verify-reset-token/${formData.token}`);
        const data = await response.json();

        if (data.success) {
          setTokenValid(true);
          setTokenInfo(data.data);
        } else {
          setTokenValid(false);
          toast.error(data.message || 'Invalid or expired reset token');
        }
      } catch (error) {
        console.error('Token verification error:', error);
        setTokenValid(false);
        toast.error('Failed to verify reset token');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [formData.token]);

  // Calculate password strength
  useEffect(() => {
    const calculateStrength = (password) => {
      let strength = 0;
      if (password.length >= 6) strength += 1;
      if (password.length >= 8) strength += 1;
      if (/[a-z]/.test(password)) strength += 1;
      if (/[A-Z]/.test(password)) strength += 1;
      if (/[0-9]/.test(password)) strength += 1;
      if (/[^A-Za-z0-9]/.test(password)) strength += 1;
      return Math.min(strength, 4);
    };

    setPasswordStrength(calculateStrength(formData.password));
  }, [formData.password]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.token.trim()) {
      toast.error('Reset token is required');
      return;
    }

    if (!formData.password.trim()) {
      toast.error('कृपया नयाँ पासवर्ड प्रविष्ट गर्नुहोस्। (Please enter a new password.)');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('पासवर्ड कम्तिमा ६ वर्ण लामो हुनुपर्छ। (Password must be at least 6 characters long.)');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('पासवर्डहरू मेल खाँदैनन्। (Passwords do not match.)');
      return;
    }

    // Check password strength
    if (passwordStrength < 3) {
      toast.error('कृपया बलियो पासवर्ड प्रयोग गर्नुहोस्। (Please use a stronger password.)');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: formData.token,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          method: formData.method
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        navigate('/login', { 
          state: { 
            message: 'Password reset successful! Please login with your new password.',
            type: 'success'
          }
        });
      } else {
        toast.error(data.message || 'पासवर्ड रिसेट गर्न असफल भयो। (Failed to reset password.)');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('नेटवर्क त्रुटि। कृपया फेरि प्रयास गर्नुहोस्। (Network error. Please try again.)');
    } finally {
      setIsLoading(false);
    }
  };

  const getStrengthColor = (strength) => {
    switch (strength) {
      case 0:
      case 1:
        return 'bg-red-500';
      case 2:
        return 'bg-yellow-500';
      case 3:
        return 'bg-blue-500';
      case 4:
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getStrengthText = (strength) => {
    switch (strength) {
      case 0:
      case 1:
        return 'Weak';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Strong';
      default:
        return '';
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <img 
              src={logoTransparent} 
              alt="Blood For Nepal Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div className="animate-spin w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying reset token...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
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
              <AlertTriangle className="w-6 h-6 text-red-600" />
              Invalid Reset Token
            </h2>
            
            <p className="text-gray-600 mb-6">
              अवैध वा म्याद सकिएको रिसेट टोकन। कृपया नयाँ पासवर्ड रिसेट अनुरोध गर्नुहोस्।
              <br />
              (Invalid or expired reset token. Please request a new password reset.)
            </p>
            
            <div className="space-y-3">
              <Link
                to="/forgot-password"
                className="block w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition duration-200 text-center flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Request New Reset
              </Link>
              
              <Link
                to="/login"
                className="block w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition duration-200 text-center flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Login
              </Link>
            </div>
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
            <Lock className="w-8 h-8 text-green-600" />
            Reset Password
          </h1>
          
          <p className="text-gray-600">
            नयाँ पासवर्ड सेट गर्नुहोस् (Set your new password)
          </p>
          
          {tokenInfo && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Account:</strong> {tokenInfo.user?.full_name} ({tokenInfo.user?.email})
                <br />
                <strong>Expires in:</strong> {tokenInfo.expiresIn}
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Ticket className="w-4 h-4" />
              Reset Token
            </label>
            <input
              type="text"
              id="token"
              name="token"
              value={formData.token}
              onChange={handleInputChange}
              placeholder="Enter reset token/OTP"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200 font-mono"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your new password"
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            
            {formData.password && (
              <div className="mt-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Password Strength:</span>
                  <span className={`font-medium ${passwordStrength >= 3 ? 'text-green-600' : 'text-red-600'}`}>
                    {getStrengthText(passwordStrength)}
                  </span>
                </div>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-2 flex-1 rounded ${
                        level <= passwordStrength ? getStrengthColor(passwordStrength) : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Confirm New Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm your new password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200"
              required
              disabled={isLoading}
            />
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="text-red-600 text-sm mt-1">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || formData.password !== formData.confirmPassword || passwordStrength < 3}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Resetting Password...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 inline mr-2" />
                Reset Password
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
              <span>
                <strong>Password Requirements:</strong>
                <br />• At least 6 characters long
                <br />• Contains uppercase and lowercase letters
                <br />• Contains at least one number
                <br />• Use special characters for extra security
              </span>
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
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
