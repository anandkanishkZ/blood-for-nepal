import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Mail, Phone, RefreshCw, ArrowLeft, Clock, Shield, KeyRound } from 'lucide-react';
import { showToast } from '../../utils/toast';
import { authAPI } from '../../utils/api';
import { useAuth } from '../context/AuthContext';
import logo from '../../assets/logo-transparent.png';
import { OTPInput } from 'input-otp';

// Defensive check for showToast import
if (!showToast || typeof showToast !== 'object') {
  console.error('❌ showToast is not properly imported or is not an object');
}

// NOTE: Using input-otp for OTP entry; no react-otp-input needed.

// Safe toast utility function with delay to prevent race conditions
const safeShowToast = {
  success: (message, options = {}) => {
    setTimeout(() => {
      try {
        if (showToast && typeof showToast.success === 'function') {
          showToast.success(message, options);
        } else {
          console.warn('showToast.success is not available, message:', message);
        }
      } catch (error) {
        console.warn('Toast notification failed:', error, 'message:', message);
      }
    }, 100); // Small delay to ensure toast container is ready
  },
  error: (message, options = {}) => {
    setTimeout(() => {
      try {
        if (showToast && typeof showToast.error === 'function') {
          showToast.error(message, options);
        } else {
          console.warn('showToast.error is not available, message:', message);
        }
      } catch (error) {
        console.warn('Toast notification failed:', error, 'message:', message);
      }
    }, 100); // Small delay to ensure toast container is ready
  },
  info: (message, options = {}) => {
    setTimeout(() => {
      try {
        if (showToast && typeof showToast.info === 'function') {
          showToast.info(message, options);
        } else {
          console.warn('showToast.info is not available, message:', message);
        }
      } catch (error) {
        console.warn('Toast notification failed:', error, 'message:', message);
      }
    }, 100); // Small delay to ensure toast container is ready
  }
};

const VerificationPage = () => {
  const { userId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  // Email verification from link
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [verificationStatus, setVerificationStatus] = useState(null);
  const [status, setStatus] = useState('loading'); // loading, input, verifying, success, error
  const [verificationCode, setVerificationCode] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes for SMS
  const [canResend, setCanResend] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // If token and email are present, verify email automatically
    if (token && email) {
      verifyEmailToken();
    } else if (userId) {
      // Load verification status for manual verification
      loadVerificationStatus();
    } else {
      setStatus('error');
      setMessage('Invalid verification link');
    }
  }, [token, email, userId]);

  // Timer for SMS verification
  useEffect(() => {
    if (verificationStatus?.activeMethod === 'sms' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [verificationStatus?.activeMethod, timeLeft]);

  // Auto-refresh verification status every 30 seconds to sync timer
  useEffect(() => {
    if (userId && status === 'input') {
      const refreshInterval = setInterval(() => {
        loadVerificationStatus();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(refreshInterval);
    }
  }, [userId, status]);

  const verifyEmailToken = async () => {
    console.log('🔍 Starting email verification process...');
    setStatus('verifying');
    try {
      console.log('📞 Calling authAPI.verifyEmailLink with:', { token, email });
      const response = await authAPI.verifyEmailLink(token, email);
      
      console.log('✅ Email verification response:', response);
      console.log('Response type:', typeof response);
      console.log('Response success:', response.success);
      console.log('Response data:', response.data);
      
      // Check if verification was successful
      if (response.success) {
        console.log('🎉 Verification successful, setting status to success');
        setStatus('success');
        
        // Handle different success scenarios
        if (response.data?.alreadyVerified) {
          console.log('✅ User already verified scenario');
          setMessage('Your email was already verified. Welcome back!');
          safeShowToast.success('✅ Email already verified! You are logged in.');
        } else {
          console.log('🎉 New verification scenario');
          setMessage(response.message || 'Email verified successfully!');
          safeShowToast.success('🎉 Email verified successfully! Welcome to Blood For Nepal!');
        }
        
        // Auto-redirect to dashboard after 3 seconds
        setTimeout(() => {
          console.log('🚀 Redirecting to dashboard...');
          navigate(response.data?.redirectTo || '/dashboard');
        }, 3000);
        
        // Early return to prevent any further execution that might cause errors
        return;
      } else {
        console.log('❌ Verification failed, response success was false');
        setStatus('error');
        setMessage(response.message || 'Email verification failed.');
        return;
      }
    } catch (error) {
      console.error('❌ Email verification error in VerificationPage:', error);
      console.error('Error type:', typeof error);
      console.error('Error constructor:', error?.constructor?.name);
      console.error('Error message:', error?.message);
      console.error('Error data:', error?.data);
      console.error('Error status:', error?.status);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      
      setStatus('error');
      
      // Handle different error response structures
      let errorMessage = 'Email verification failed. The link may be expired or invalid.';
      
      // The error response structure varies between development and production
      // Development: { error: { message: "...", stack: "...", validationErrors: null } }
      // Production: { message: "..." }
      if (error.message && typeof error.message === 'string') {
        errorMessage = error.message;
      } else if (error.data && typeof error.data === 'object') {
        // Handle nested error structure (development mode)
        if (error.data.error && error.data.error.message) {
          errorMessage = error.data.error.message;
        } else if (error.data.message) {
          errorMessage = error.data.message;
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      console.log('📝 Processed error message:', errorMessage);
      setMessage(errorMessage);
    }
  };

  const loadVerificationStatus = async () => {
    try {
      const response = await authAPI.getVerificationStatus(userId);
      setVerificationStatus(response.data);
      
      if (!response.data.verificationRequired) {
        setStatus('success');
        setMessage('Your account is already verified!');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      if (response.data.activeMethod === 'sms') {
        setStatus('input');
        
        // Calculate actual remaining time based on server expiry
        if (response.data.verificationExpires) {
          const expiryTime = new Date(response.data.verificationExpires);
          const currentTime = new Date();
          const remainingSeconds = Math.max(0, Math.floor((expiryTime - currentTime) / 1000));
          
          setTimeLeft(remainingSeconds);
          setCanResend(remainingSeconds === 0);
        } else {
          // No active verification found, allow resend
          setTimeLeft(0);
          setCanResend(true);
        }
      } else if (response.data.activeMethod === 'email') {
        setStatus('input');
      } else {
        setStatus('error');
        setMessage('No active verification method found');
      }
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'Failed to load verification status');
    }
  };

  const handleVerification = async () => {
    const code = verificationCode;
    
    if (code.length !== 6) {
      safeShowToast.error('Please enter the complete verification code');
      return;
    }

    setStatus('verifying');
    try {
      const response = await authAPI.verifyUser({
        userId,
        code,
        method: verificationStatus.activeMethod
      });

      if (response.success) {
        setStatus('success');
        setMessage(response.message);
        
        safeShowToast.success('🎉 Account verified successfully! Welcome to Blood For Nepal!');
        
        // Auto-redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        setStatus('input');
        setMessage('');
        safeShowToast.error(response.message || 'Verification failed');
        setVerificationCode('');
      }
    } catch (error) {
      console.error('❌ Manual verification error:', error);
      setStatus('input');
      setMessage('');
      safeShowToast.error(error.message || 'Verification failed');
      setVerificationCode('');
    }
  };

  // Auto-verify when 6 digits are entered
  useEffect(() => {
    const code = verificationCode;
    if (code.length === 6 && status === 'input') {
      // Add a small delay to prevent double-submission
      const timeoutId = setTimeout(() => {
        handleVerification();
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [verificationCode, status]);

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      const response = await authAPI.resendVerification(userId);
      safeShowToast.success(response.message);
      
      // Check if in fallback mode and show OTP directly
      if (response.data.fallbackMode && response.data.otp) {
        safeShowToast.info(`SMS service issue. Your OTP is: ${response.data.otp}`, { duration: 10000 });
        // Update verification status to include fallback info
        setVerificationStatus(prev => ({
          ...prev,
          fallbackMode: true,
          otp: response.data.otp
        }));
      }
      
      // Reload verification status to get updated expiry time
      await loadVerificationStatus();
      
      setVerificationCode('');
    } catch (error) {
      safeShowToast.error(error.message || 'Failed to resend verification');
    }
    setIsResending(false);
  };

  const handleSwitchMethod = async (newMethod) => {
    try {
      const response = await authAPI.switchVerificationMethod(userId, newMethod);
      safeShowToast.success(response.message);
      await loadVerificationStatus();
      setVerificationCode('');
    } catch (error) {
      safeShowToast.error(error.message || 'Failed to switch verification method');
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const LoadingState = () => (
    <div className="text-center space-y-6">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-500 mx-auto"></div>
      <h2 className="text-2xl font-bold text-gray-900">Loading...</h2>
      <p className="text-gray-600">Please wait while we process your verification</p>
    </div>
  );

  const SuccessState = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-pulse">
        <CheckCircle className="w-12 h-12 text-green-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900">Verification Successful!</h2>
      <p className="text-gray-600">{message}</p>
      <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
        <p className="text-sm text-green-700">
          🎉 Welcome to Blood For Nepal! You're being redirected to your dashboard...
        </p>
      </div>
      <div className="flex items-center justify-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-500 border-t-transparent"></div>
        <span className="text-sm text-gray-600">Redirecting...</span>
      </div>
    </div>
  );

  const ErrorState = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
        <XCircle className="w-12 h-12 text-red-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900">Verification Failed</h2>
      <p className="text-gray-600">{message}</p>
      
      {userId && (
        <div className="space-y-3">
          <button
            onClick={handleResendVerification}
            disabled={isResending}
            className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
          >
            {isResending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
            {isResending ? 'Sending...' : 'Resend Verification'}
          </button>
          
          <button
            onClick={() => navigate('/register')}
            className="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Start Over
          </button>
        </div>
      )}
    </div>
  );

  const InputState = () => (
    <div className="space-y-6">
      <div className="text-center">
        <img src={logo} alt="Blood For Nepal" className="h-16 w-16 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Account</h2>
        <div className="flex items-center justify-center gap-2 text-gray-600">
          {verificationStatus?.activeMethod === 'email' ? (
            <>
              <Mail className="w-5 h-5" />
              <span>Check your email for verification link</span>
            </>
          ) : (
            <>
              <Phone className="w-5 h-5" />
              <span>Enter the 6-digit code sent to your phone</span>
            </>
          )}
        </div>
      </div>

      {/* Show OTP directly if in fallback mode */}
      {verificationStatus?.fallbackMode && verificationStatus?.otp && (
        <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-orange-700">
                <strong>⚠️ SMS Service Temporarily Unavailable</strong><br />
                Due to SMS service issues, your verification code is displayed below:<br />
                <span className="text-xl font-bold text-orange-800">{verificationStatus.otp}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {verificationStatus?.activeMethod === 'sms' && (
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Code sent to: <span className="font-medium">****{verificationStatus?.destination || '****'}</span>
            </p>
            
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
              <Clock className="w-4 h-4" />
              <span>
                {timeLeft > 0 ? `Expires in ${formatTime(timeLeft)}` : 'Code expired'}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 mb-8">
            <label htmlFor="otp-input" className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-2">
              <KeyRound className="w-6 h-6 text-red-500" />
              Enter 6-digit Verification Code
            </label>
            <div className="relative w-full flex justify-center">
              <input
                id="otp-input"
                type="text"
                value={verificationCode}
                onChange={e => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                maxLength={6}
                autoFocus
                inputMode="numeric"
                className="w-56 h-16 text-3xl tracking-widest text-center font-bold border-2 border-gray-200 rounded-xl shadow-md focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:outline-none transition-all bg-white placeholder-gray-400 disabled:bg-gray-100 disabled:text-gray-400"
                placeholder="------"
                disabled={status === 'verifying'}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-red-200 transition-all"
                onClick={async () => {
                  const text = await navigator.clipboard.readText();
                  setVerificationCode(text.replace(/[^0-9]/g, '').slice(0, 6));
                }}
                tabIndex={-1}
                disabled={status === 'verifying'}
              >
                Paste
              </button>
            </div>
            <span className="text-xs text-gray-500 mt-1">Only numbers are allowed</span>
          </div>

          <button
            onClick={handleVerification}
            disabled={status === 'verifying' || verificationCode.length !== 6}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-6 rounded-lg hover:from-red-700 hover:to-red-800 disabled:opacity-50 font-medium transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            {status === 'verifying' ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Verifying...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                Verify Account
              </>
            )}
          </button>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleResendVerification}
              disabled={isResending || !canResend}
              className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              {isResending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {isResending ? 'Sending...' : canResend ? 'Resend Code' : `Resend in ${formatTime(timeLeft)}`}
            </button>

            <button
              onClick={() => handleSwitchMethod('email')}
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Switch to Email Verification
            </button>
          </div>
        </div>
      )}

      {verificationStatus?.activeMethod === 'email' && (
        <div className="text-center space-y-6">
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Check Your Email:</strong><br />
                  We've sent a verification link to your email address. Click the link to verify your account.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleResendVerification}
              disabled={isResending}
              className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              {isResending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              {isResending ? 'Sending...' : 'Resend Email'}
            </button>

            {verificationStatus?.phoneVerified === false && (
              <button
                onClick={() => handleSwitchMethod('sms')}
                className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Switch to SMS Verification
              </button>
            )}
          </div>
        </div>
      )}

      <div className="text-center">
        <button
          onClick={() => navigate('/login')}
          className="text-gray-600 hover:text-gray-800 flex items-center justify-center gap-1 mx-auto transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </button>
      </div>
    </div>
  );

  const VerifyingState = () => (
    <div className="text-center space-y-6">
      <div className="animate-pulse">
        <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
          <Shield className="w-12 h-12 text-blue-500 animate-spin" />
        </div>
      </div>
      <h2 className="text-2xl font-bold text-gray-900">Verifying...</h2>
      <p className="text-gray-600">Please wait while we verify your account</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-red-100 rounded-full translate-y-12 -translate-x-12 opacity-50"></div>
        
        <div className="relative z-10">
          {status === 'loading' && <LoadingState />}
          {status === 'input' && <InputState />}
          {status === 'verifying' && <VerifyingState />}
          {status === 'success' && <SuccessState />}
          {status === 'error' && <ErrorState />}
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;
