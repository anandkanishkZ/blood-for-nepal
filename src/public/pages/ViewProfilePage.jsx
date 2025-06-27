import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { showToast } from "../../utils/toast";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Droplets, 
  Edit3, 
  Save, 
  X, 
  Eye, 
  EyeOff, 
  Camera,
  AlertTriangle,
  Shield,
  Check,
  Lock
} from "lucide-react";

const defaultAvatar = "https://ui-avatars.com/api/?name=User&background=F87171&color=fff";

const ViewProfilePage = () => {
  const { user, updateProfile, isLoading, changePassword } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    address: "",
    date_of_birth: "",
    gender: "",
    blood_type: "",
    emergency_contact: "",
    medical_conditions: "",
  });
  
  // Avatar state (local preview only)
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(defaultAvatar);

  // Password change modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: "" });
  
  // Refs for focus management
  const firstEditFieldRef = useRef(null);
  const passwordModalRef = useRef(null);

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || "",
        phone: user.phone || "",
        address: user.address || "",
        date_of_birth: user.date_of_birth ? user.date_of_birth.substring(0, 10) : "",
        gender: user.gender || "",
        blood_type: user.blood_type || "",
        emergency_contact: user.emergency_contact || "",
        medical_conditions: user.medical_conditions || "",
      });
      // Set avatar preview from user data if available
      if (user.avatar) {
        setAvatarPreview(user.avatar);
      } else {
        setAvatarPreview(`https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'User')}&background=F87171&color=fff`);
      }
    }
  }, [user]);

  // Handle edit mode focus
  useEffect(() => {
    if (editMode && firstEditFieldRef.current) {
      setTimeout(() => firstEditFieldRef.current.focus(), 100);
    }
  }, [editMode]);

  // Handle modal focus and escape key
  useEffect(() => {
    if (showPasswordModal) {
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          handleClosePasswordModal();
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      passwordModalRef.current?.focus();
      
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showPasswordModal]);

  // Monitor password strength
  useEffect(() => {
    if (passwordForm.newPassword) {
      setPasswordStrength(checkPasswordStrength(passwordForm.newPassword));
    } else {
      setPasswordStrength({ score: 0, feedback: "" });
    }
  }, [passwordForm.newPassword]);

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!form.full_name.trim()) {
      errors.full_name = "Full name is required";
    } else if (form.full_name.trim().length < 2) {
      errors.full_name = "Full name must be at least 2 characters";
    }
    
    if (!form.blood_type) {
      errors.blood_type = "Blood type is required";
    }
    
    if (!form.date_of_birth) {
      errors.date_of_birth = "Date of birth is required";
    } else {
      const birthDate = new Date(form.date_of_birth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 16 || age > 100) {
        errors.date_of_birth = "Please enter a valid date of birth (age 16-100)";
      }
    }
    
    if (!form.gender) {
      errors.gender = "Gender is required";
    }
    
    if (!form.emergency_contact.trim()) {
      errors.emergency_contact = "Emergency contact is required";
    } else if (!/^[+]?[\d\s\-()]+$/.test(form.emergency_contact)) {
      errors.emergency_contact = "Please enter a valid emergency contact number";
    }
    
    if (form.phone && !/^[+]?[\d\s\-()]+$/.test(form.phone)) {
      errors.phone = "Please enter a valid phone number";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Password strength checker
  const checkPasswordStrength = (password) => {
    let score = 0;
    let feedback = [];
    
    if (password.length >= 8) score += 1;
    else feedback.push("at least 8 characters");
    
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push("lowercase letter");
    
    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push("uppercase letter");
    
    if (/\d/.test(password)) score += 1;
    else feedback.push("number");
    
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
    else feedback.push("special character");
    
    const strengthLevels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
    const strengthText = strengthLevels[Math.min(score, 4)];
    
    return {
      score,
      feedback: feedback.length > 0 ? `Add ${feedback.join(", ")}` : "Strong password!",
      strength: strengthText,
      isValid: score >= 3
    };
  };

  // Password form validation
  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordForm.currentPassword) {
      errors.currentPassword = "Current password is required";
    }
    
    if (!passwordForm.newPassword) {
      errors.newPassword = "New password is required";
    } else {
      const strength = checkPasswordStrength(passwordForm.newPassword);
      if (!strength.isValid) {
        errors.newPassword = "Password must be stronger";
      }
    }
    
    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = "Please confirm your new password";
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Clear specific field error when user starts typing
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  const handleDateChange = (field, value) => {
    // Get current date components or defaults
    const currentDate = form.date_of_birth ? new Date(form.date_of_birth) : new Date();
    let day = currentDate.getDate();
    let month = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
    let year = currentDate.getFullYear();

    // Update the specific field
    if (field === 'day') day = parseInt(value) || 1;
    if (field === 'month') month = parseInt(value) || 1;
    if (field === 'year') year = parseInt(value) || new Date().getFullYear();

    // Create new date string if all fields have values
    if (day && month && year && value !== '') {
      // Ensure valid day for the selected month/year
      const daysInMonth = new Date(year, month, 0).getDate();
      if (day > daysInMonth) {
        day = daysInMonth;
      }
      
      const newDate = new Date(year, month - 1, day);
      const dateString = newDate.toISOString().split('T')[0];
      
      setForm({ ...form, date_of_birth: dateString });
    } else if (value === '') {
      // If clearing a field, clear the entire date
      setForm({ ...form, date_of_birth: '' });
    }
    
    // Clear date of birth error when user starts selecting
    if (formErrors.date_of_birth) {
      setFormErrors({ ...formErrors, date_of_birth: "" });
    }
  };

  const handleEdit = () => {
    setEditMode(true);
    setFormErrors({});
  };

  const handleCancel = () => {
    setEditMode(false);
    setFormErrors({});
    if (user) {
      setForm({
        full_name: user.full_name || "",
        phone: user.phone || "",
        address: user.address || "",
        date_of_birth: user.date_of_birth ? user.date_of_birth.substring(0, 10) : "",
        gender: user.gender || "",
        blood_type: user.blood_type || "",
        emergency_contact: user.emergency_contact || "",
        medical_conditions: user.medical_conditions || "",
      });
      // Reset avatar
      setAvatar(null);
      if (user.avatar) {
        setAvatarPreview(user.avatar);
      } else {
        setAvatarPreview(`https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'User')}&background=F87171&color=fff`);
      }
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showToast.error("Please select a valid image file");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast.error("Image size must be less than 5MB");
        return;
      }
      
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.onerror = () => showToast.error("Failed to read image file");
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast.error("Please fix the errors below");
      return;
    }
    
    setIsUpdatingProfile(true);
    try {
      // Note: Avatar upload is not implemented (backend required)
      const result = await updateProfile(form);
      if (result && result.success) {
        showToast.success("Profile updated successfully!");
        setEditMode(false);
        setFormErrors({});
      } else {
        // Handle backend validation errors
        if (result?.error?.validationErrors) {
          const backendErrors = {};
          result.error.validationErrors.forEach(err => {
            backendErrors[err.path] = err.msg;
          });
          setFormErrors(backendErrors);
          showToast.error("Please correct the validation errors");
        } else {
          showToast.error(result?.message || result?.error?.message || "Failed to update profile");
        }
      }
    } catch (error) {
      console.error("Profile update error:", error);
      showToast.error("An unexpected error occurred");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Password change logic
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({ ...passwordForm, [name]: value });
    
    // Clear specific field error when user starts typing
    if (passwordErrors[name]) {
      setPasswordErrors({ ...passwordErrors, [name]: "" });
    }
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setPasswordErrors({});
    setPasswordStrength({ score: 0, feedback: "" });
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      showToast.error("Please fix the errors below");
      return;
    }

    setIsChangingPassword(true);
    try {
      const result = await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });
      
      if (result && result.success) {
        showToast.success("Password changed successfully!");
        handleClosePasswordModal();
      } else {
        showToast.error(result?.message || "Failed to change password");
      }
    } catch (error) {
      showToast.error("An error occurred while changing password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user?.full_name || 'User Profile'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage your profile information
                </p>
              </div>
            </div>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Profile Information
            </h2>
            {!editMode && (
              <button
                onClick={handleEdit}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                aria-label="Edit Profile"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>

          {/* Profile Completion Status */}
          {!editMode && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Profile Completion</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                {[
                  { field: 'full_name', label: 'Name', value: user?.full_name },
                  { field: 'blood_type', label: 'Blood Type', value: user?.blood_type },
                  { field: 'date_of_birth', label: 'Birth Date', value: user?.date_of_birth },
                  { field: 'gender', label: 'Gender', value: user?.gender },
                  { field: 'emergency_contact', label: 'Emergency', value: user?.emergency_contact },
                  { field: 'phone', label: 'Phone', value: user?.phone },
                  { field: 'address', label: 'Address', value: user?.address },
                  { field: 'medical_conditions', label: 'Medical Info', value: user?.medical_conditions }
                ].map(({ field, label, value }) => (
                  <div key={field} className="flex items-center space-x-1">
                    {value ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <X className="w-3 h-3 text-gray-400" />
                    )}
                    <span className={value ? 'text-green-700 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {editMode && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center">
                <Edit3 className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                <div>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    You are now editing your profile. Fields marked with * are required.
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                    Make your changes and click "Save Changes" when done.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative group">
              <img
                src={avatarPreview}
                alt={`${user?.full_name || 'User'}'s profile picture`}
                className="w-24 h-24 rounded-full object-cover border-4 border-red-200 dark:border-red-800 transition-all duration-200"
              />
              {editMode && (
                <label className="absolute bottom-0 right-0 bg-red-500 p-2 rounded-full cursor-pointer hover:bg-red-600 transition-colors shadow-lg transform hover:scale-105">
                  <Camera className="w-4 h-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="sr-only"
                    aria-label="Upload new profile picture"
                  />
                </label>
              )}
            </div>
            {editMode && (
              <div className="text-center mt-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Click the camera icon to change your photo
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Supports: JPG, PNG, GIF (max 5MB)
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name *
                </label>
                {editMode ? (
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      ref={firstEditFieldRef}
                      type="text"
                      id="full_name"
                      name="full_name"
                      value={form.full_name}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                        formErrors.full_name 
                          ? 'border-red-500 dark:border-red-400' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      required
                      aria-describedby={formErrors.full_name ? "full_name_error" : "full_name_help"}
                      aria-invalid={!!formErrors.full_name}
                    />
                    {formErrors.full_name && (
                      <div className="flex items-center mt-1 text-red-600 dark:text-red-400">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        <span id="full_name_error" className="text-sm">{formErrors.full_name}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                    {user?.full_name || 'Not specified'}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    value={user.email}
                    disabled
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    aria-describedby="email_help"
                  />
                </div>
                <p id="email_help" className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Email cannot be changed
                </p>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                {editMode ? (
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                        formErrors.phone 
                          ? 'border-red-500 dark:border-red-400' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      aria-describedby={formErrors.phone ? "phone_error" : undefined}
                      aria-invalid={!!formErrors.phone}
                    />
                    {formErrors.phone && (
                      <div className="flex items-center mt-1 text-red-600 dark:text-red-400">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        <span id="phone_error" className="text-sm">{formErrors.phone}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                    {user?.phone || 'Not specified'}
                  </p>
                )}
              </div>

              {/* Blood Type */}
              <div>
                <label htmlFor="blood_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Blood Type *
                </label>
                {editMode ? (
                  <div className="relative">
                    <Droplets className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <select
                      id="blood_type"
                      name="blood_type"
                      value={form.blood_type}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                        formErrors.blood_type 
                          ? 'border-red-500 dark:border-red-400' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      required
                      aria-describedby={formErrors.blood_type ? "blood_type_error" : undefined}
                      aria-invalid={!!formErrors.blood_type}
                    >
                      <option value="">Select blood type</option>
                      <option value="A+">A+ (A Positive)</option>
                      <option value="A-">A- (A Negative)</option>
                      <option value="B+">B+ (B Positive)</option>
                      <option value="B-">B- (B Negative)</option>
                      <option value="AB+">AB+ (AB Positive)</option>
                      <option value="AB-">AB- (AB Negative)</option>
                      <option value="O+">O+ (O Positive)</option>
                      <option value="O-">O- (O Negative)</option>
                    </select>
                    {formErrors.blood_type && (
                      <div className="flex items-center mt-1 text-red-600 dark:text-red-400">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        <span id="blood_type_error" className="text-sm">{formErrors.blood_type}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    {user?.blood_type ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        <Droplets className="w-3 h-3 mr-1" />
                        {user.blood_type}
                      </span>
                    ) : (
                      <span className="text-gray-900 dark:text-white">Not specified</span>
                    )}
                  </div>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date of Birth *
                </label>
                {editMode ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      {/* Day Selector */}
                      <div>
                        <label htmlFor="birth_day" className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Day
                        </label>
                        <select
                          id="birth_day"
                          value={form.date_of_birth ? new Date(form.date_of_birth).getDate() : ''}
                          onChange={(e) => handleDateChange('day', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                            formErrors.date_of_birth 
                              ? 'border-red-500 dark:border-red-400' 
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                          required
                          aria-describedby={formErrors.date_of_birth ? "date_of_birth_error" : undefined}
                          aria-invalid={!!formErrors.date_of_birth}
                        >
                          <option value="">Day</option>
                          {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                            <option key={day} value={day}>
                              {day.toString().padStart(2, '0')}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Month Selector */}
                      <div>
                        <label htmlFor="birth_month" className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Month
                        </label>
                        <select
                          id="birth_month"
                          value={form.date_of_birth ? new Date(form.date_of_birth).getMonth() + 1 : ''}
                          onChange={(e) => handleDateChange('month', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                            formErrors.date_of_birth 
                              ? 'border-red-500 dark:border-red-400' 
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                          required
                          aria-describedby={formErrors.date_of_birth ? "date_of_birth_error" : undefined}
                          aria-invalid={!!formErrors.date_of_birth}
                        >
                          <option value="">Month</option>
                          <option value="1">January</option>
                          <option value="2">February</option>
                          <option value="3">March</option>
                          <option value="4">April</option>
                          <option value="5">May</option>
                          <option value="6">June</option>
                          <option value="7">July</option>
                          <option value="8">August</option>
                          <option value="9">September</option>
                          <option value="10">October</option>
                          <option value="11">November</option>
                          <option value="12">December</option>
                        </select>
                      </div>

                      {/* Year Selector */}
                      <div>
                        <label htmlFor="birth_year" className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Year
                        </label>
                        <select
                          id="birth_year"
                          value={form.date_of_birth ? new Date(form.date_of_birth).getFullYear() : ''}
                          onChange={(e) => handleDateChange('year', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                            formErrors.date_of_birth 
                              ? 'border-red-500 dark:border-red-400' 
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                          required
                          aria-describedby={formErrors.date_of_birth ? "date_of_birth_error" : undefined}
                          aria-invalid={!!formErrors.date_of_birth}
                        >
                          <option value="">Year</option>
                          {Array.from({ length: 85 }, (_, i) => new Date().getFullYear() - 16 - i).map(year => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    {/* Calendar Icon and Helper Text */}
                    <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 mt-1">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>Select your birth date using the dropdowns above</span>
                    </div>
                    
                    {formErrors.date_of_birth && (
                      <div className="flex items-center mt-1 text-red-600 dark:text-red-400">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        <span id="date_of_birth_error" className="text-sm">{formErrors.date_of_birth}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                    {user?.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'Not specified'}
                  </p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Gender *
                </label>
                {editMode ? (
                  <div className="relative">
                    <select
                      id="gender"
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                        formErrors.gender 
                          ? 'border-red-500 dark:border-red-400' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      required
                      aria-describedby={formErrors.gender ? "gender_error" : undefined}
                      aria-invalid={!!formErrors.gender}
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {formErrors.gender && (
                      <div className="flex items-center mt-1 text-red-600 dark:text-red-400">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        <span id="gender_error" className="text-sm">{formErrors.gender}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                    {user?.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : 'Not specified'}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address
                </label>
                {editMode ? (
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                ) : (
                  <p className="py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                    {user?.address || 'Not specified'}
                  </p>
                )}
              </div>

              {/* Emergency Contact */}
              <div>
                <label htmlFor="emergency_contact" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Emergency Contact *
                </label>
                {editMode ? (
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      id="emergency_contact"
                      name="emergency_contact"
                      value={form.emergency_contact}
                      onChange={handleChange}
                      placeholder="Emergency contact number"
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                        formErrors.emergency_contact 
                          ? 'border-red-500 dark:border-red-400' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      required
                      aria-describedby={formErrors.emergency_contact ? "emergency_contact_error" : undefined}
                      aria-invalid={!!formErrors.emergency_contact}
                    />
                    {formErrors.emergency_contact && (
                      <div className="flex items-center mt-1 text-red-600 dark:text-red-400">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        <span id="emergency_contact_error" className="text-sm">{formErrors.emergency_contact}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                    {user?.emergency_contact || 'Not specified'}
                  </p>
                )}
              </div>

              {/* Medical Conditions */}
              <div>
                <label htmlFor="medical_conditions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Medical Conditions
                </label>
                {editMode ? (
                  <textarea
                    id="medical_conditions"
                    name="medical_conditions"
                    value={form.medical_conditions}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Any medical conditions or allergies..."
                  />
                ) : (
                  <p className="py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white min-h-[80px]">
                    {user?.medical_conditions || 'Not specified'}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {editMode && (
              <div className="flex items-center justify-end space-x-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50"
                  disabled={isUpdatingProfile}
                >
                  <X className="w-4 h-4 inline mr-2" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="flex items-center space-x-2 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdatingProfile ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Password Change Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Security
            </h2>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              aria-label="Change Password"
            >
              <Edit3 className="w-4 h-4" />
              <span>Change Password</span>
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Keep your account secure by regularly updating your password. Your password should be at least 6 characters long and include uppercase, lowercase, and numbers.
          </p>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClosePasswordModal();
          }}
        >
          <div 
            ref={passwordModalRef}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md relative transform transition-all"
            role="dialog"
            aria-labelledby="password-modal-title"
            aria-describedby="password-modal-desc"
            tabIndex={-1}
          >
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              onClick={handleClosePasswordModal}
              aria-label="Close password change modal"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full">
                <Lock className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 id="password-modal-title" className="text-lg font-semibold text-gray-900 dark:text-white">
                  Change Password
                </h3>
                <p id="password-modal-desc" className="text-sm text-gray-600 dark:text-gray-400">
                  Create a strong password to keep your account secure
                </p>
              </div>
            </div>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {/* Current Password */}
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    className={`w-full pr-10 pl-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                      passwordErrors.currentPassword 
                        ? 'border-red-500 dark:border-red-400' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    required
                    aria-describedby={passwordErrors.currentPassword ? "current_password_error" : undefined}
                    aria-invalid={!!passwordErrors.currentPassword}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <div className="flex items-center mt-1 text-red-600 dark:text-red-400">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    <span id="current_password_error" className="text-sm">{passwordErrors.currentPassword}</span>
                  </div>
                )}
              </div>
              
              {/* New Password */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    id="newPassword"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className={`w-full pr-10 pl-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                      passwordErrors.newPassword 
                        ? 'border-red-500 dark:border-red-400' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    required
                    minLength={8}
                    aria-describedby={`${passwordErrors.newPassword ? "new_password_error" : ""} password_strength`}
                    aria-invalid={!!passwordErrors.newPassword}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {passwordForm.newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">Password Strength:</span>
                      <span className={`font-medium ${
                        passwordStrength.score >= 4 ? 'text-green-600 dark:text-green-400' :
                        passwordStrength.score >= 3 ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-red-600 dark:text-red-400'
                      }`}>
                        {passwordStrength.strength}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 mt-1">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          passwordStrength.score >= 4 ? 'bg-green-500 w-full' :
                          passwordStrength.score >= 3 ? 'bg-yellow-500 w-3/4' :
                          passwordStrength.score >= 2 ? 'bg-orange-500 w-1/2' :
                          passwordStrength.score >= 1 ? 'bg-red-500 w-1/4' :
                          'bg-red-500 w-1/12'
                        }`}
                      ></div>
                    </div>
                    <p id="password_strength" className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {passwordStrength.feedback}
                    </p>
                  </div>
                )}
                
                {passwordErrors.newPassword && (
                  <div className="flex items-center mt-1 text-red-600 dark:text-red-400">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    <span id="new_password_error" className="text-sm">{passwordErrors.newPassword}</span>
                  </div>
                )}
              </div>
              
              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className={`w-full pr-10 pl-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                      passwordErrors.confirmPassword 
                        ? 'border-red-500 dark:border-red-400' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    required
                    minLength={8}
                    aria-describedby={passwordErrors.confirmPassword ? "confirm_password_error" : undefined}
                    aria-invalid={!!passwordErrors.confirmPassword}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                {passwordForm.confirmPassword && passwordForm.newPassword && (
                  <div className="flex items-center mt-1">
                    {passwordForm.newPassword === passwordForm.confirmPassword ? (
                      <div className="flex items-center text-green-600 dark:text-green-400">
                        <Check className="w-4 h-4 mr-1" />
                        <span className="text-sm">Passwords match</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600 dark:text-red-400">
                        <X className="w-4 h-4 mr-1" />
                        <span className="text-sm">Passwords do not match</span>
                      </div>
                    )}
                  </div>
                )}
                
                {passwordErrors.confirmPassword && (
                  <div className="flex items-center mt-1 text-red-600 dark:text-red-400">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    <span id="confirm_password_error" className="text-sm">{passwordErrors.confirmPassword}</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isChangingPassword || !passwordStrength.isValid}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isChangingPassword ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Changing...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      <span>Change Password</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleClosePasswordModal}
                  disabled={isChangingPassword}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewProfilePage;
