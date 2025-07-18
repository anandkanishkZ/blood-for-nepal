import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Mail, RefreshCw, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { showToast } from '../../utils/toast';
import { authAPI } from '../../utils/api';
import logo from '../../assets/logo-transparent.png';

const EmailVerificationNeededPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Get user data from navigation state
  const userEmail = location.state?.userEmail;
  const userId = location.state?.userId;
  const verificationMethod = location.state?.verificationMethod || 'email';

  // Redirect to login if no user data
  useEffect(() => {
    if (!userEmail || !userId) {
      navigate('/login', { replace: true });
    }
  }, [userEmail, userId, navigate]);

  // Handle resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendVerification = async () => {
    if (resendCooldown > 0) return;
    
    setIsResending(true);
    try {
      const response = await authAPI.resendVerification(userId);
      showToast.success(response.message || 'Verification email sent successfully!');
      setResendCooldown(60); // 1 minute cooldown
    } catch (error) {
      showToast.error(error.message || 'Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleSwitchMethod = () => {
    navigate('/choose-verification-method', {
      state: {
        userId,
        email: userEmail,
        fromSwitch: true
      }
    });
  };

  const handleBackToLogin = () => {
    navigate('/login', { replace: true });
  };

  if (!userEmail || !userId) {
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
            <div className="mx-auto w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-12 h-12 text-orange-500" />
            </div>
            
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-gray-900">Account Verification Required</h2>
              <p className="text-gray-600 leading-relaxed">
                Your account needs to be verified before you can log in. We've sent a verification link to your email address.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Account Created Successfully!</p>
                  <p>We've sent a verification link to your email address.</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-2">Next Steps:</p>
                <ul className="space-y-1 text-left">
                  <li>• Check your email and click the verification link to complete your registration</li>
                  <li>• Check your spam/junk folder if you don't see the email</li>
                  <li>• The verification link is valid for 24 hours</li>
                </ul>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleResendVerification}
                disabled={isResending || resendCooldown > 0}
                className="w-full bg-red-600 text-white py-3 px-6 rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : resendCooldown > 0 ? (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Resend in {resendCooldown}s
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4" />
                    Resend Verification Email
                  </>
                )}
              </button>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleBackToLogin}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-xl hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </button>
                
                <button
                  onClick={handleSwitchMethod}
                  className="flex-1 bg-blue-100 text-blue-800 py-3 px-4 rounded-xl hover:bg-blue-200 transition-colors flex items-center justify-center gap-2 text-center"
                >
                  Switch to SMS
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-500 text-center">
                Email sent to: <span className="font-medium text-gray-700">{userEmail}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationNeededPage;
