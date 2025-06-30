import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../public/context/AuthContext";
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
  Lock,
  Menu,
  Settings,
  Heart,
  FileText,
  LogOut,
  ChevronRight,
  Home,
  Star,
  Award,
  Activity,
  Zap,
  Bell,
  Smartphone,
  Globe,
  UserCheck,
  Sparkles,
  ChevronDown
} from "lucide-react";
import apiClient from "../../utils/api.js";

const defaultAvatar = "https://ui-avatars.com/api/?name=User&background=F87171&color=fff";

// Utility function to construct full avatar URL
const getFullAvatarUrl = (avatarPath, bustCache = false) => {
  if (!avatarPath) return null;
  if (avatarPath.startsWith('http')) return avatarPath;
  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';
  if (bustCache) {
    const timestamp = new Date().getTime();
    return `${baseUrl}${avatarPath}?t=${timestamp}`;
  }
  return `${baseUrl}${avatarPath}`;
};

const ViewProfilePage = () => {
  const { user, updateProfile, isLoading, changePassword, checkAuthStatus, forceRefreshUser, logout } = useAuth();
  
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');
  const sidebarRef = useRef(null);
  
  // Profile state
  const [editMode, setEditMode] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    address: "",
    province: "",
    district: "",
    municipality: "",
    date_of_birth: "",
    gender: "",
    blood_type: "",
    emergency_contact: "",
    medical_conditions: "",
    is_donor: false,
  });
  
  // Avatar state
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
  
  // Refs
  const firstEditFieldRef = useRef(null);
  const passwordModalRef = useRef(null);

  // Navigation items
  const navigationItems = [
    {
      id: 'profile',
      label: 'Profile Information',
      icon: User,
      description: 'View and edit your personal details',
      color: 'from-blue-500 to-purple-600'
    },
    {
      id: 'donor-status',
      label: 'Donor Status',
      icon: Heart,
      description: 'Manage your blood donation availability',
      color: 'from-red-500 to-pink-600'
    },
    {
      id: 'settings',
      label: 'Account Settings',
      icon: Settings,
      description: 'Password and security settings',
      color: 'from-gray-500 to-gray-700'
    }
  ];

  // Effects
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    };

    if (sidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarOpen]);

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || "",
        phone: user.phone || "",
        address: user.address || "",
        province: user.province || "",
        district: user.district || "",
        municipality: user.municipality || "",
        date_of_birth: user.date_of_birth ? user.date_of_birth.substring(0, 10) : "",
        gender: user.gender || "",
        blood_type: user.blood_type || "",
        emergency_contact: user.emergency_contact || "",
        medical_conditions: user.medical_conditions || "",
        is_donor: user.is_donor || false,
      });
      
      if (user.avatar) {
        setAvatarPreview(getFullAvatarUrl(user.avatar));
      } else {
        setAvatarPreview(`https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'User')}&background=F87171&color=fff`);
      }
    }
  }, [user]);

  useEffect(() => {
    if (editMode && firstEditFieldRef.current) {
      setTimeout(() => firstEditFieldRef.current.focus(), 100);
    }
  }, [editMode]);

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

  useEffect(() => {
    if (passwordForm.newPassword) {
      setPasswordStrength(checkPasswordStrength(passwordForm.newPassword));
    } else {
      setPasswordStrength({ score: 0, feedback: "" });
    }
  }, [passwordForm.newPassword]);

  // Handlers
  const handleNavigation = (sectionId) => {
    setActiveSection(sectionId);
    setSidebarOpen(false);
    if (editMode) {
      setEditMode(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      showToast('Failed to logout. Please try again.', 'error');
    }
  };

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
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setForm({ ...form, [name]: newValue });
    
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  const handleDateChange = (field, value) => {
    const currentDate = form.date_of_birth ? new Date(form.date_of_birth) : new Date();
    let day = currentDate.getDate();
    let month = currentDate.getMonth() + 1;
    let year = currentDate.getFullYear();

    if (field === 'day') day = parseInt(value) || 1;
    if (field === 'month') month = parseInt(value) || 1;
    if (field === 'year') year = parseInt(value) || new Date().getFullYear();

    if (day && month && year && value !== '') {
      const daysInMonth = new Date(year, month, 0).getDate();
      if (day > daysInMonth) {
        day = daysInMonth;
      }
      
      const newDate = new Date(year, month - 1, day);
      const dateString = newDate.toISOString().split('T')[0];
      
      setForm({ ...form, date_of_birth: dateString });
    } else if (value === '') {
      setForm({ ...form, date_of_birth: '' });
    }
    
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
        province: user.province || "",
        district: user.district || "",
        municipality: user.municipality || "",
        date_of_birth: user.date_of_birth ? user.date_of_birth.substring(0, 10) : "",
        gender: user.gender || "",
        blood_type: user.blood_type || "",
        emergency_contact: user.emergency_contact || "",
        medical_conditions: user.medical_conditions || "",
        is_donor: user.is_donor || false,
      });
      setAvatar(null);
      if (user.avatar) {
        setAvatarPreview(getFullAvatarUrl(user.avatar));
      } else {
        setAvatarPreview(`https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'User')}&background=F87171&color=fff`);
      }
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setFormErrors({ ...formErrors, avatar: 'Invalid file type. Please select an image.' });
        return;
      }

      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
      setFormErrors({ ...formErrors, avatar: '' });
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatar) {
      setFormErrors({ ...formErrors, avatar: 'Please select an avatar to upload.' });
      return;
    }

    if (avatar.size > 2 * 1024 * 1024) {
      setFormErrors({ ...formErrors, avatar: 'File size must be less than 2MB.' });
      return;
    }

    const formData = new FormData();
    formData.append('profilePhoto', avatar);

    try {
      const response = await apiClient.uploadFile('/upload', formData);

      if (response && response.filePath) {
        const newAvatarUrl = getFullAvatarUrl(response.filePath, true);
        setAvatarPreview(newAvatarUrl);
        setFormErrors({ ...formErrors, avatar: '' });
        setAvatar(null);
        showToast.success("Profile photo uploaded successfully!");
        
        const refreshUserData = async (attempts = 0) => {
          try {
            const refreshResult = await forceRefreshUser();
            
            if (refreshResult.success) {
              const currentUser = refreshResult.user;
              if (currentUser.avatar === response.filePath) {
                return true;
              } else {
                if (attempts < 3) {
                  setTimeout(() => refreshUserData(attempts + 1), 1000);
                } else {
                  if (user) {
                    const updatedUser = { ...user, avatar: response.filePath };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    setAvatarPreview(newAvatarUrl);
                  }
                }
              }
            } else {
              console.error('❌ Force refresh failed:', refreshResult.error);
              if (attempts < 3) {
                setTimeout(() => refreshUserData(attempts + 1), 1000);
              }
            }
          } catch (error) {
            console.error('❌ Failed to refresh user data:', error);
            if (attempts < 3) {
              setTimeout(() => refreshUserData(attempts + 1), 1000);
            }
          }
        };
        
        refreshUserData();
      } else {
        console.error('❌ Invalid response structure:', response);
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('❌ Avatar upload error:', error);
      setFormErrors({ ...formErrors, avatar: 'Failed to upload avatar. Please try again.' });
      showToast.error("Failed to upload profile photo. Please try again.");
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
      const result = await updateProfile(form);
      if (result && result.success) {
        showToast.success("Profile updated successfully!");
        setEditMode(false);
        setFormErrors({});
      } else {
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

  // Password handlers
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({ ...passwordForm, [name]: value });
    
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

  // Loading state
  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-32 w-32 border-4 border-red-200 border-t-red-500 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Heart className="w-8 h-8 text-red-500 animate-pulse" />
            </div>
          </div>
          <p className="mt-6 text-gray-600 dark:text-gray-400 text-lg font-medium">Loading your profile...</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Please wait while we fetch your information</p>
        </div>
      </div>
    );
  }

  const isBlocked = user.is_active === false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-red-200/20 to-pink-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
        <div className="absolute bottom-0 left-1/2 w-80 h-80 bg-gradient-to-br from-green-200/20 to-teal-200/20 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="lg:flex relative z-10">
        {/* Enhanced Sidebar */}
        <div 
          ref={sidebarRef}
          className={`fixed top-0 left-0 h-full w-80 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-white/20 dark:border-gray-700/50 shadow-2xl transform transition-all duration-500 ease-out z-50 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 lg:static lg:z-auto`}
        >
          {/* Gradient Header */}
          <div className="relative bg-gradient-to-br from-red-500 via-red-600 to-pink-600 p-8 border-b border-white/10">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={avatarPreview}
                      alt={`${user?.full_name || 'User'}'s profile picture`}
                      className="w-16 h-16 rounded-2xl object-cover border-3 border-white/30 shadow-xl ring-4 ring-white/20 transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'User')}&background=F87171&color=fff`;
                      }}
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <div className="text-white">
                    <h2 className="font-bold text-lg leading-tight">
                      {user?.full_name || 'User'}
                    </h2>
                    <p className="text-white/80 text-sm font-medium">
                      {user?.email}
                    </p>
                    {user?.is_donor && (
                      <div className="flex items-center mt-2 space-x-1">
                        <Heart className="w-4 h-4 text-red-200 fill-current" />
                        <span className="text-xs text-white/90 font-medium">Blood Donor</span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <Star className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-white/90 text-xs font-medium">Profile</p>
                      <p className="text-white text-sm font-bold">
                        {Math.round(([user?.full_name, user?.blood_type, user?.date_of_birth, user?.gender, user?.emergency_contact, user?.phone, user?.address, user?.medical_conditions].filter(Boolean).length / 8) * 100)}%
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-white/90 text-xs font-medium">Status</p>
                      <p className="text-white text-sm font-bold">
                        {isBlocked ? 'Blocked' : 'Active'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Navigation */}
          <nav className="flex-1 px-6 py-8 space-y-3">
            {navigationItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`w-full group relative overflow-hidden transition-all duration-300 ${
                    isActive ? 'transform scale-[1.02]' : 'hover:transform hover:scale-[1.01]'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`relative flex items-center px-5 py-4 rounded-2xl transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/30 dark:to-pink-900/20 shadow-lg border border-red-100 dark:border-red-800/50'
                      : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800/50 dark:hover:to-gray-700/50 hover:shadow-md border border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                  }`}>
                    
                    {/* Active indicator */}
                    {isActive && (
                      <>
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-red-400 to-red-600 rounded-l-full shadow-lg"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-pink-500/5 rounded-2xl"></div>
                      </>
                    )}
                    
                    {/* Icon container */}
                    <div className={`relative p-3 rounded-xl mr-4 transition-all duration-300 ${
                      isActive 
                        ? 'bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/50 dark:to-red-800/50 shadow-inner' 
                        : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600 group-hover:shadow-md'
                    }`}>
                      <Icon className={`w-5 h-5 transition-all duration-300 ${
                        isActive 
                          ? 'text-red-600 dark:text-red-400 transform rotate-3' 
                          : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'
                      }`} />
                      
                      {isActive && (
                        <div className="absolute -top-1 -right-1">
                          <Sparkles className="w-3 h-3 text-red-400 animate-pulse" />
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0 text-left">
                      <div className={`font-semibold text-base transition-colors duration-300 ${
                        isActive ? 'text-red-700 dark:text-red-300' : 'text-gray-900 dark:text-white'
                      }`}>
                        {item.label}
                      </div>
                      <div className={`text-sm mt-1 leading-relaxed transition-colors duration-300 ${
                        isActive 
                          ? 'text-red-600 dark:text-red-400' 
                          : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                      }`}>
                        {item.description}
                      </div>
                    </div>
                    
                    {/* Arrow indicator */}
                    <ChevronRight className={`w-5 h-5 transition-all duration-300 ${
                      isActive 
                        ? 'text-red-500 dark:text-red-400 transform rotate-90 translate-x-1' 
                        : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 group-hover:translate-x-1'
                    }`} />
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Enhanced Footer */}
          <div className="border-t border-gray-200/50 dark:border-gray-700/50 p-6">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-5 py-4 text-left rounded-2xl text-red-600 dark:text-red-400 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 dark:hover:from-red-900/20 dark:hover:to-red-800/20 transition-all duration-300 group border border-transparent hover:border-red-200 dark:hover:border-red-800/50 hover:shadow-lg"
            >
              <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/30 mr-3 group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors duration-300">
                <LogOut className="w-5 h-5" />
              </div>
              <span className="font-semibold">Sign Out</span>
              <ChevronRight className="w-4 h-4 ml-auto transform group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>
        </div>

        {/* Enhanced Main Content */}
        <div className="flex-1 lg:ml-80">
          {/* Modern Header */}
          <div className="sticky top-0 z-30 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/50 shadow-lg">
            <div className="px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden p-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                  >
                    <Menu className="w-6 h-6" />
                  </button>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                      {navigationItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-base mt-1 font-medium">
                      {navigationItems.find(item => item.id === activeSection)?.description || 'Manage your account'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => window.history.back()}
                    className="flex items-center space-x-3 px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  >
                    <Home className="w-5 h-5" />
                    <span className="hidden sm:inline font-medium">Back to Dashboard</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-8">
            {isBlocked && (
              <div className="mb-8 relative overflow-hidden animate-in slide-in-from-top duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-red-600/10 rounded-3xl"></div>
                <div className="relative p-8 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-red-200 dark:border-red-800/50 rounded-3xl shadow-2xl">
                  <div className="flex items-start gap-6">
                    <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-2xl">
                      <Shield className="w-8 h-8 text-red-600 dark:text-red-300" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-2">Account Blocked</h2>
                      <p className="text-red-700 dark:text-red-300 mb-4 text-lg">You cannot access certain features until an admin unblocks your account.</p>
                      {user.block_note && (
                        <div className="mt-4 p-4 bg-red-200/50 dark:bg-red-800/30 rounded-2xl border border-red-300 dark:border-red-700">
                          <span className="font-semibold text-red-900 dark:text-red-200">Reason:</span>
                          <span className="text-red-800 dark:text-red-300 ml-2">{user.block_note}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Section Content */}
            {activeSection === 'profile' && (
              <div className="max-w-6xl space-y-8 animate-in slide-in-from-bottom duration-700">
                {/* Main Profile Card */}
                <div className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 rounded-3xl"></div>
                  
                  <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/50 dark:to-red-800/50 rounded-2xl">
                          <User className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                            Profile Information
                          </h2>
                          <p className="text-gray-600 dark:text-gray-400 font-medium">Manage your personal details and preferences</p>
                        </div>
                      </div>
                      {!editMode && (
                        <button
                          onClick={handleEdit}
                          className="group flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-500/30"
                          aria-label="Edit Profile"
                        >
                          <Edit3 className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
                          <span className="font-semibold">Edit Profile</span>
                        </button>
                      )}
                    </div>

                    {/* Rest of the profile content will continue... */}
                    {/* This is getting quite long, so I'll continue in the next part */}
                    
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProfilePage;
