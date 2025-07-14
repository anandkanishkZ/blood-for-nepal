import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Mail, RefreshCw, ArrowRight, Home } from 'lucide-react';
import { authAPI } from '../../utils/api';
import { showToast } from '../../utils/toast';
import { useAuth } from '../context/AuthContext';
import logo from '../../assets/logo-transparent.png';

const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token || !email) {
        setStatus('error');
        setMessage('Invalid verification link. Please check your email for the correct link.');
        return;
      }

      setUserEmail(decodeURIComponent(email));

      try {
        const response = await authAPI.verifyEmailLink(token, email);
        
        console.log('Verification response:', response);
        
        // Check if verification was successful
        if (response.success) {
          setStatus('success');
          
          // Handle different success scenarios
          if (response.data?.alreadyVerified) {
            setMessage('Your email was already verified. Welcome back!');
            showToast.success(' Email already verified! You are logged in.');
          } else {
            setMessage(response.message || 'Email verified successfully!');
            showToast.success('Email verified successfully! Welcome to Blood For Nepal!');
          }
          
          // Auto-redirect to dashboard after 3 seconds
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(response.message || 'Email verification failed.');
        }
      } catch (error) {
        console.error('❌ Email verification error:', error);
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
        
        // If error message indicates already verified, treat as success
        if (errorMessage.toLowerCase().includes('already verified')) {
          setStatus('success');
          setMessage('Your email was already verified. Welcome back!');
          showToast.success('\u2705 Email already verified! You are logged in.');
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        } else {
          setMessage(errorMessage);
          console.log('Processed error message:', errorMessage);
        }
      }
    };

    verifyEmail();
  }, [token, email, navigate]);

  const handleResendVerification = async () => {
    if (!userEmail) {
      showToast.error('Email address not found. Please try registering again.');
      return;
    }

    setIsResending(true);
    try {
      // Note: We need the userId to resend verification
      // For now, we'll direct them to register again
      showToast.info('Please register again to receive a new verification email.');
      navigate('/register');
    } catch (error) {
      showToast.error(error.message || 'Failed to resend verification email');
    }
    setIsResending(false);
  };

  const VerifyingState = () => (
    <div className="text-center space-y-6">
      <div className="animate-pulse">
        <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
          <Mail className="w-12 h-12 text-blue-500" />
        </div>
      </div>
      <h2 className="text-2xl font-bold text-gray-900">Verifying Your Email</h2>
      <p className="text-gray-600">Please wait while we verify your email address...</p>
      <div className="flex items-center justify-center space-x-1">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );

  const SuccessState = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
        <CheckCircle className="w-16 h-16 text-green-500" />
      </div>
      
      <div className="space-y-3">
        <h2 className="text-3xl font-bold text-gray-900">🎉 Email Verified Successfully!</h2>
        <p className="text-gray-600 text-lg">Welcome to Blood For Nepal!</p>
        <p className="text-sm text-gray-500">{message}</p>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">🎊 Account Successfully Verified!</h3>
          <p className="text-sm text-gray-600">
            Your account is now verified and ready to use. You have been automatically logged in.
          </p>
          <div className="grid grid-cols-1 gap-2 text-sm text-gray-700">
            <div className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Find blood donors and recipients
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Register for donation camps
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Track your donation history
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Connect with the blood donation community
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-xl hover:from-green-700 hover:to-green-800 font-medium transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2 shadow-lg"
        >
          <ArrowRight className="w-5 h-5" />
          Go to Dashboard
        </button>
        
        <p className="text-sm text-gray-500">
          Redirecting automatically in 3 seconds...
        </p>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <p className="text-xs text-gray-400 text-center">
          Thank you for joining Blood For Nepal community! Together, we save lives. ❤️
        </p>
      </div>
    </div>
  );

  const ErrorState = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
        <XCircle className="w-12 h-12 text-red-500" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Verification Failed</h2>
        <p className="text-gray-600">{message}</p>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="text-sm text-red-700">
          <p className="font-medium mb-2">Possible reasons:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>The verification link has expired (links expire after 24 hours)</li>
            <li>The link has already been used</li>
            <li>The link was copied incorrectly</li>
          </ul>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleResendVerification}
          disabled={isResending}
          className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
        >
          {isResending ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Redirecting...
            </>
          ) : (
            <>
              <Mail className="h-4 w-4" />
              Get New Verification Email
            </>
          )}
        </button>
        
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/login')}
            className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Back to Login
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-1"
          >
            <Home className="w-4 h-4" />
            Home
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-red-100 rounded-full translate-y-12 -translate-x-12 opacity-50"></div>
        
        {/* Logo */}
        <div className="text-center mb-6 relative z-10">
          <img src={logo} alt="Blood For Nepal" className="h-12 w-12 mx-auto" />
        </div>
        
        <div className="relative z-10">
          {status === 'verifying' && <VerifyingState />}
          {status === 'success' && <SuccessState />}
          {status === 'error' && <ErrorState />}
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
