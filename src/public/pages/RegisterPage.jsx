import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, UserPlus, Droplets } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import logo from '../../assets/logo-transparent.png';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    bloodType: '',
    password: ''
  });
  const { t } = useLanguage();

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle registration logic here
    console.log('Registration data:', formData);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-100/30 dark:bg-red-900/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-200/30 dark:bg-red-800/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-50/20 dark:bg-red-900/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Main Card with Glassmorphism */}
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl backdrop-saturate-150 rounded-3xl shadow-2xl border border-white/30 dark:border-gray-700/30 p-8">
          
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <img 
                  src={logo} 
                  alt="Blood For Nepal Logo" 
                  className="h-16 w-16 object-contain"
                />
              </div>
              <div className="ml-4">
                <h1 className="text-2xl md:text-3xl font-bold text-red-600 dark:text-red-400">
                  Blood For Nepal
                </h1>
              </div>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-2">
              Join Our Life-Saving Community
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Create your account and help save lives across Nepal
            </p>
          </div>

          {/* Registration Form - Vertical Layout */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Full Name Field */}
            <div className="group">
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-red-600 dark:group-focus-within:text-red-400">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-red-500">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="block w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 hover:bg-white/70 dark:hover:bg-gray-800/70"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="group">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-red-600 dark:group-focus-within:text-red-400">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-red-500">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="block w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 hover:bg-white/70 dark:hover:bg-gray-800/70"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Blood Type Field */}
            <div className="group">
              <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-red-600 dark:group-focus-within:text-red-400">
                Blood Type
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-red-500">
                  <Droplets className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="bloodType"
                  name="bloodType"
                  required
                  value={formData.bloodType}
                  onChange={handleInputChange}
                  className="block w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 hover:bg-white/70 dark:hover:bg-gray-800/70 appearance-none"
                >
                  <option value="" className="bg-white dark:bg-gray-800">Select your blood type</option>
                  {bloodTypes.map(type => (
                    <option key={type} value={type} className="bg-white dark:bg-gray-800">{type}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div className="group">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-red-600 dark:group-focus-within:text-red-400">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-red-500">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full pl-12 pr-12 py-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 hover:bg-white/70 dark:hover:bg-gray-800/70"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-red-500 transition-colors duration-200"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start space-x-3">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 dark:border-gray-600 rounded transition-colors duration-200"
              />
              <label htmlFor="terms" className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                I agree to the{' '}
                <Link to="/terms" className="text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 font-medium underline underline-offset-2 transition-colors duration-200">
                  Terms and Conditions
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 font-medium underline underline-offset-2 transition-colors duration-200">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full relative overflow-hidden bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 group"
            >
              <span className="relative z-10 flex items-center justify-center">
                <UserPlus className="h-5 w-5 mr-2" />
                Create Account
              </span>
              <div className="absolute inset-0 bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 underline underline-offset-2 transition-colors duration-200"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
