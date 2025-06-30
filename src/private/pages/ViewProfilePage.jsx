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
  ChevronDown,
  Upload,
  Building2,
  Stethoscope,
  CalendarCheck,
  UserCircle,
  CreditCard,
  Palette
} from "lucide-react";
import apiClient from "../../utils/api.js";

const defaultAvatar = "https://ui-avatars.com/api/?name=User&background=F87171&color=fff";

// Utility function to construct full avatar URL
const getFullAvatarUrl = (avatarPath, bustCache = false) => {
  if (!avatarPath) return null;
  if (avatarPath.startsWith('http')) return avatarPath;
  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';
  // Add cache busting only when specifically requested (like after upload)
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
  const [activeSection, setActiveSection] = useState('overview');
  const sidebarRef = useRef(null);
  
  // Existing state
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

  // Sidebar navigation items with modern structure
  const navigationItems = [
    {
      id: 'overview',
      label: 'Profile Overview',
      icon: UserCircle,
      description: 'View your complete profile summary',
      color: 'bg-blue-50 text-blue-600 border-blue-200'
    },
    {
      id: 'personal',
      label: 'Personal Information',
      icon: User,
      description: 'Basic details and contact information',
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200'
    },
    {
      id: 'medical',
      label: 'Medical Details',
      icon: Stethoscope,
      description: 'Health information and blood type',
      color: 'bg-purple-50 text-purple-600 border-purple-200'
    },
    {
      id: 'donor-status',
      label: 'Donor Settings',
      icon: Heart,
      description: 'Blood donation preferences',
      color: 'bg-red-50 text-red-600 border-red-200'
    },
    {
      id: 'security',
      label: 'Security & Privacy',
      icon: Shield,
      description: 'Password and account security',
      color: 'bg-amber-50 text-amber-600 border-amber-200'
    }
  ];

  // Handle sidebar click outside to close
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

  // Handle sidebar navigation
  const handleNavigation = (sectionId) => {
    setActiveSection(sectionId);
    setSidebarOpen(false);
    if (editMode) {
      setEditMode(false);
    }
    // Smooth scroll to top on section change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      showToast('Failed to logout. Please try again.', 'error');
    }
  };

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
      // Set avatar preview from user data if available
      if (user.avatar) {
        setAvatarPreview(getFullAvatarUrl(user.avatar));
      } else {
        setAvatarPreview(`https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'User')}&background=dc2626&color=fff&size=200`);
      }
    }
  }, [user]);

  // Set default active section to overview
  useEffect(() => {
    setActiveSection('overview');
  }, []);

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
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setForm({ ...form, [name]: newValue });
    
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
      // Reset avatar
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
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setFormErrors({ ...formErrors, avatar: 'Invalid file type. Please select an image.' });
        return;
      }

      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
      setFormErrors({ ...formErrors, avatar: '' }); // Clear any previous error
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatar) {
      setFormErrors({ ...formErrors, avatar: 'Please select an avatar to upload.' });
      return;
    }

    // Validate file size (2MB limit)
    if (avatar.size > 2 * 1024 * 1024) {
      setFormErrors({ ...formErrors, avatar: 'File size must be less than 2MB.' });
      return;
    }

    const formData = new FormData();
    formData.append('profilePhoto', avatar);

    try {
      const response = await apiClient.uploadFile('/upload', formData);

      if (response && response.filePath) {
        // Update avatar preview with the uploaded file URL
        const newAvatarUrl = getFullAvatarUrl(response.filePath, true);
        setAvatarPreview(newAvatarUrl);
        setFormErrors({ ...formErrors, avatar: '' });
        setAvatar(null);
        showToast.success("Profile photo uploaded successfully!");
        
        // Force refresh user data with multiple attempts to ensure update
        const refreshUserData = async (attempts = 0) => {
          try {
            const refreshResult = await forceRefreshUser();
            
            if (refreshResult.success) {
              // Verify the user data was actually updated
              const currentUser = refreshResult.user;
              if (currentUser.avatar === response.filePath) {
                return true;
              } else {
                if (attempts < 3) {
                  setTimeout(() => refreshUserData(attempts + 1), 1000);
                } else {
                  // Force update the local state anyway
                  if (user) {
                    const updatedUser = { ...user, avatar: response.filePath };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    // Trigger a re-render by updating the avatar preview
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
        
        // Start the refresh process
        refreshUserData();
      } else {
        console.error('❌ Invalid response structure:', response);
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('❌ Avatar upload error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-500/20 border-l-red-500 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-r-red-400 animate-pulse mx-auto"></div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Loading your profile</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Please wait while we fetch your information...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show blocked warning
  const isBlocked = user.is_active === false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-red-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-emerald-400/5 to-teal-400/5 rounded-full blur-3xl"></div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <img
              src={avatarPreview}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border-2 border-red-500/20"
            />
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{user.full_name}</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          
          {/* Sidebar Navigation */}
          <div className={`lg:w-80 ${sidebarOpen ? 'fixed inset-0 z-50 lg:relative lg:inset-auto' : 'hidden lg:block'}`}>
            {/* Mobile Backdrop */}
            {sidebarOpen && (
              <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}
            
            {/* Sidebar Content */}
            <div 
              ref={sidebarRef}
              className={`relative lg:sticky lg:top-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 overflow-hidden ${
                sidebarOpen ? 'w-80 h-full lg:h-auto ml-0 lg:ml-auto' : ''
              }`}
            >
              {/* Sidebar Header */}
              <div className="p-6 bg-gradient-to-r from-red-500 to-pink-500 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={avatarPreview}
                        alt="Profile"
                        className="w-12 h-12 rounded-full object-cover border-2 border-white/30"
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{user.full_name}</h3>
                      <p className="text-xs text-white/80">{user.email}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden p-1 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Navigation Menu */}
              <div className="p-4 space-y-2">
                {navigationItems.map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigation(item.id)}
                      className={`w-full text-left p-4 rounded-xl transition-all duration-200 group border ${
                        isActive 
                          ? `${item.color} shadow-sm border-current`
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300 border-transparent hover:border-gray-200 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${isActive ? 'bg-white/50' : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'}`}>
                          <item.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-sm ${isActive ? 'font-semibold' : ''}`}>
                            {item.label}
                          </p>
                          <p className={`text-xs mt-0.5 ${isActive ? 'opacity-80' : 'text-gray-500 dark:text-gray-400'}`}>
                            {item.description}
                          </p>
                        </div>
                        {isActive && (
                          <ChevronRight className="h-4 w-4 opacity-60" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Sidebar Footer */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 p-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 group-hover:bg-red-100 dark:group-hover:bg-red-900/30">
                    <LogOut className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-sm">Sign Out</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 max-w-4xl">
            {renderMainContent()}
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClosePasswordModal}></div>
            <div 
              ref={passwordModalRef}
              className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 overflow-hidden"
              tabIndex={-1}
            >
              {/* Modal Header */}
              <div className="p-6 bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Lock className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-semibold">Change Password</h2>
                  </div>
                  <button
                    onClick={handleClosePasswordModal}
                    className="p-1 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      className={`w-full px-4 py-3 pl-4 pr-12 rounded-xl border-2 transition-all duration-200 bg-white dark:bg-gray-700 ${
                        passwordErrors.currentPassword
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-gray-200 dark:border-gray-600 focus:border-blue-500'
                      }`}
                      placeholder="Enter your current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{passwordErrors.currentPassword}</p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      className={`w-full px-4 py-3 pl-4 pr-12 rounded-xl border-2 transition-all duration-200 bg-white dark:bg-gray-700 ${
                        passwordErrors.newPassword
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-gray-200 dark:border-gray-600 focus:border-blue-500'
                      }`}
                      placeholder="Create a new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {passwordForm.newPassword && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Password Strength</span>
                        <span className={`text-xs font-semibold ${
                          passwordStrength.score >= 4 ? 'text-green-600' : 
                          passwordStrength.score >= 3 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {passwordStrength.strength}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            passwordStrength.score >= 4 ? 'bg-green-500' : 
                            passwordStrength.score >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{passwordStrength.feedback}</p>
                    </div>
                  )}
                  
                  {passwordErrors.newPassword && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{passwordErrors.newPassword}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      className={`w-full px-4 py-3 pl-4 pr-12 rounded-xl border-2 transition-all duration-200 bg-white dark:bg-gray-700 ${
                        passwordErrors.confirmPassword
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-gray-200 dark:border-gray-600 focus:border-blue-500'
                      }`}
                      placeholder="Confirm your new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{passwordErrors.confirmPassword}</p>
                  )}
                </div>

                {/* Modal Actions */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClosePasswordModal}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                      isChangingPassword
                        ? 'bg-blue-300 dark:bg-blue-700 cursor-not-allowed text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {isChangingPassword ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Changing...</span>
                      </div>
                    ) : (
                      'Update Password'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Render main content based on active section
  function renderMainContent() {
    switch (activeSection) {
      case 'overview':
        return renderOverviewSection();
      case 'personal':
        return renderPersonalSection();
      case 'medical':
        return renderMedicalSection();
      case 'donor-status':
        return renderDonorSection();
      case 'security':
        return renderSecuritySection();
      default:
        return renderOverviewSection();
    }
  }

  // Overview Section - Dashboard-style summary
  function renderOverviewSection() {
    const calculateAge = (birthDate) => {
      if (!birthDate) return 'N/A';
      const today = new Date();
      const birth = new Date(birthDate);
      const age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        return age - 1;
      }
      return age;
    };

    const completionPercentage = () => {
      const fields = [user.full_name, user.phone, user.address, user.date_of_birth, user.gender, user.blood_type, user.emergency_contact];
      const filledFields = fields.filter(field => field && field.toString().trim() !== '').length;
      return Math.round((filledFields / fields.length) * 100);
    };

    return (
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src={avatarPreview}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover border-4 border-white/30 shadow-lg"
                  />
                  <label className="absolute inset-0 rounded-full cursor-pointer group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="sr-only"
                    />
                    <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="h-6 w-6 text-white" />
                    </div>
                  </label>
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{user.full_name || 'Your Name'}</h1>
                  <p className="text-white/90 text-lg">{user.email}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      user.is_donor ? 'bg-green-500/20 text-green-100' : 'bg-yellow-500/20 text-yellow-100'
                    }`}>
                      {user.is_donor ? '🩸 Active Donor' : '👤 User'}
                    </span>
                    {user.blood_type && (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white">
                        Blood Type: {user.blood_type}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {avatar && (
                <button
                  onClick={handleAvatarUpload}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium"
                >
                  Upload Photo
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <UserCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Profile Complete</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{completionPercentage()}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Age</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{calculateAge(user.date_of_birth)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                <Droplets className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Blood Type</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{user.blood_type || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <Heart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Donor Status</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {user.is_donor ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => handleNavigation('personal')}
              className="p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-colors text-left group border border-blue-200 dark:border-blue-800"
            >
              <Edit3 className="h-5 w-5 text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-medium text-blue-900 dark:text-blue-200">Edit Profile</p>
              <p className="text-sm text-blue-600 dark:text-blue-400">Update your information</p>
            </button>

            <button
              onClick={() => handleNavigation('security')}
              className="p-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-xl transition-colors text-left group border border-green-200 dark:border-green-800"
            >
              <Shield className="h-5 w-5 text-green-600 dark:text-green-400 mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-medium text-green-900 dark:text-green-200">Security Settings</p>
              <p className="text-sm text-green-600 dark:text-green-400">Change password</p>
            </button>

            <button
              onClick={() => handleNavigation('donor-status')}
              className="p-4 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-colors text-left group border border-red-200 dark:border-red-800"
            >
              <Heart className="h-5 w-5 text-red-600 dark:text-red-400 mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-medium text-red-900 dark:text-red-200">Donor Settings</p>
              <p className="text-sm text-red-600 dark:text-red-400">Manage availability</p>
            </button>
          </div>
        </div>

        {/* Profile Completion Progress */}
        {completionPercentage() < 100 && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-6 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-yellow-900 dark:text-yellow-200">Complete Your Profile</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Your profile is {completionPercentage()}% complete. Add missing information to get the most out of Blood for Nepal.
                </p>
              </div>
              <button
                onClick={() => handleNavigation('personal')}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors font-medium"
              >
                Complete Now
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Personal Information Section
  function renderPersonalSection() {
    return (
      <div className="space-y-6">
        {/* Section Header */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                <User className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Personal Information</h2>
                <p className="text-gray-500 dark:text-gray-400">Manage your basic details and contact information</p>
              </div>
            </div>
            {!editMode && (
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors font-medium flex items-center space-x-2"
              >
                <Edit3 className="h-4 w-4" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-gray-700/50">
          {editMode ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    <User className="h-4 w-4 inline mr-2" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    ref={firstEditFieldRef}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 bg-white dark:bg-gray-700 ${
                      formErrors.full_name
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-200 dark:border-gray-600 focus:border-emerald-500'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {formErrors.full_name && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {formErrors.full_name}
                    </p>
                  )}
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    <Mail className="h-4 w-4 inline mr-2" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    readOnly
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 cursor-not-allowed text-gray-500 dark:text-gray-400"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Email cannot be changed</p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    <Phone className="h-4 w-4 inline mr-2" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 bg-white dark:bg-gray-700 ${
                      formErrors.phone
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-200 dark:border-gray-600 focus:border-emerald-500'
                    }`}
                    placeholder="+977 98X-XXX-XXXX"
                  />
                  {formErrors.phone && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {formErrors.phone}
                    </p>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    <UserCheck className="h-4 w-4 inline mr-2" />
                    Gender *
                  </label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 bg-white dark:bg-gray-700 ${
                      formErrors.gender
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-200 dark:border-gray-600 focus:border-emerald-500'
                    }`}
                  >
                    <option value="">Select your gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {formErrors.gender && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {formErrors.gender}
                    </p>
                  )}
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Date of Birth *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <input
                      type="number"
                      placeholder="Day"
                      min="1"
                      max="31"
                      value={form.date_of_birth ? new Date(form.date_of_birth).getDate() : ''}
                      onChange={(e) => handleDateChange('day', e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 bg-white dark:bg-gray-700 ${
                        formErrors.date_of_birth
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-gray-200 dark:border-gray-600 focus:border-emerald-500'
                      }`}
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Month"
                      min="1"
                      max="12"
                      value={form.date_of_birth ? new Date(form.date_of_birth).getMonth() + 1 : ''}
                      onChange={(e) => handleDateChange('month', e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 bg-white dark:bg-gray-700 ${
                        formErrors.date_of_birth
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-gray-200 dark:border-gray-600 focus:border-emerald-500'
                      }`}
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Year"
                      min="1920"
                      max="2010"
                      value={form.date_of_birth ? new Date(form.date_of_birth).getFullYear() : ''}
                      onChange={(e) => handleDateChange('year', e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 bg-white dark:bg-gray-700 ${
                        formErrors.date_of_birth
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-gray-200 dark:border-gray-600 focus:border-emerald-500'
                      }`}
                    />
                  </div>
                </div>
                {formErrors.date_of_birth && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    {formErrors.date_of_birth}
                  </p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <MapPin className="h-4 w-4 inline mr-2" />
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 bg-white dark:bg-gray-700 ${
                    formErrors.address
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-200 dark:border-gray-600 focus:border-emerald-500'
                  }`}
                  placeholder="Enter your full address"
                />
                {formErrors.address && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    {formErrors.address}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isUpdatingProfile
                      ? 'bg-emerald-300 dark:bg-emerald-700 cursor-not-allowed text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  {isUpdatingProfile ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Save className="h-4 w-4" />
                      <span>Save Changes</span>
                    </div>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{user.full_name || 'Not provided'}</p>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="flex items-center space-x-2 mb-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{user.email}</p>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="flex items-center space-x-2 mb-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{user.phone || 'Not provided'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="flex items-center space-x-2 mb-2">
                      <UserCheck className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Gender</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">{user.gender || 'Not provided'}</p>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Date of Birth</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {user.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Not provided'}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{user.address || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Medical Information Section
  function renderMedicalSection() {
    return (
      <div className="space-y-6">
        {/* Section Header */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <Stethoscope className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Medical Information</h2>
                <p className="text-gray-500 dark:text-gray-400">Health details and emergency contacts</p>
              </div>
            </div>
            {!editMode && (
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors font-medium flex items-center space-x-2"
              >
                <Edit3 className="h-4 w-4" />
                <span>Edit Medical Info</span>
              </button>
            )}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-gray-700/50">
          {editMode ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Blood Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    <Droplets className="h-4 w-4 inline mr-2" />
                    Blood Type *
                  </label>
                  <select
                    name="blood_type"
                    value={form.blood_type}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 bg-white dark:bg-gray-700 ${
                      formErrors.blood_type
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-200 dark:border-gray-600 focus:border-purple-500'
                    }`}
                  >
                    <option value="">Select your blood type</option>
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
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {formErrors.blood_type}
                    </p>
                  )}
                </div>

                {/* Emergency Contact */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    <Phone className="h-4 w-4 inline mr-2" />
                    Emergency Contact *
                  </label>
                  <input
                    type="tel"
                    name="emergency_contact"
                    value={form.emergency_contact}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 bg-white dark:bg-gray-700 ${
                      formErrors.emergency_contact
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-200 dark:border-gray-600 focus:border-purple-500'
                    }`}
                    placeholder="Emergency contact number"
                  />
                  {formErrors.emergency_contact && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {formErrors.emergency_contact}
                    </p>
                  )}
                </div>
              </div>

              {/* Medical Conditions */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <FileText className="h-4 w-4 inline mr-2" />
                  Medical Conditions
                </label>
                <textarea
                  name="medical_conditions"
                  value={form.medical_conditions}
                  onChange={handleChange}
                  rows="4"
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 bg-white dark:bg-gray-700 ${
                    formErrors.medical_conditions
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-200 dark:border-gray-600 focus:border-purple-500'
                  }`}
                  placeholder="List any medical conditions, allergies, or medications you're currently taking..."
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  This information helps medical staff provide better care in emergencies.
                </p>
                {formErrors.medical_conditions && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    {formErrors.medical_conditions}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isUpdatingProfile
                      ? 'bg-purple-300 dark:bg-purple-700 cursor-not-allowed text-white'
                      : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  {isUpdatingProfile ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Save className="h-4 w-4" />
                      <span>Save Medical Info</span>
                    </div>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                      <Droplets className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <span className="text-sm font-medium text-red-700 dark:text-red-300">Blood Type</span>
                  </div>
                  <p className="text-3xl font-bold text-red-800 dark:text-red-200">{user.blood_type || 'Not provided'}</p>
                  {user.blood_type && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      Can donate to: {getCompatibleTypes(user.blood_type)}
                    </p>
                  )}
                </div>

                <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Emergency Contact</span>
                  </div>
                  <p className="text-xl font-semibold text-blue-800 dark:text-blue-200">{user.emergency_contact || 'Not provided'}</p>
                </div>
              </div>

              <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-600 rounded-lg">
                    <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Medical Conditions</span>
                </div>
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                  {user.medical_conditions || 'No medical conditions reported'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );

    // Helper function for blood type compatibility
    function getCompatibleTypes(bloodType) {
      const compatibility = {
        'A+': 'A+, AB+',
        'A-': 'A+, A-, AB+, AB-',
        'B+': 'B+, AB+',
        'B-': 'B+, B-, AB+, AB-',
        'AB+': 'AB+',
        'AB-': 'AB+, AB-',
        'O+': 'A+, B+, AB+, O+',
        'O-': 'All blood types'
      };
      return compatibility[bloodType] || 'Unknown';
    }
  }

  // Donor Status Section
  function renderDonorSection() {
    return (
      <div className="space-y-6">
        {/* Section Header */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Blood Donor Settings</h2>
                <p className="text-gray-500 dark:text-gray-400">Manage your blood donation availability and preferences</p>
              </div>
            </div>
          </div>
        </div>

        {/* Donor Status Card */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-gray-700/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Donor Status Toggle */}
            <div className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
              form.is_donor 
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
                : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl ${
                    form.is_donor 
                      ? 'bg-red-100 dark:bg-red-900/30' 
                      : 'bg-gray-100 dark:bg-gray-600'
                  }`}>
                    <Heart className={`h-6 w-6 ${
                      form.is_donor 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Blood Donor Status</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {form.is_donor 
                        ? 'You are currently available for blood donation' 
                        : 'You are not currently available for blood donation'
                      }
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_donor"
                    checked={form.is_donor}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                </label>
              </div>
            </div>

            {/* Donor Information - Show when active */}
            {form.is_donor && (
              <div className="space-y-6 p-6 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-200 dark:border-red-800">
                <h4 className="text-lg font-semibold text-red-800 dark:text-red-200 flex items-center">
                  <CalendarCheck className="h-5 w-5 mr-2" />
                  Donation Preferences
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Preferred Donation Frequency */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Preferred Donation Frequency
                    </label>
                    <select
                      name="donation_frequency"
                      value={form.donation_frequency || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border-2 border-red-200 dark:border-red-700 focus:border-red-500 transition-all duration-200 bg-white dark:bg-gray-700"
                    >
                      <option value="">Select frequency</option>
                      <option value="monthly">Monthly (Every 4-8 weeks)</option>
                      <option value="quarterly">Quarterly (Every 3 months)</option>
                      <option value="biannually">Bi-annually (Every 6 months)</option>
                      <option value="annually">Annually (Once a year)</option>
                    </select>
                  </div>

                  {/* Last Donation Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Last Donation Date (Optional)
                    </label>
                    <input
                      type="date"
                      name="last_donation_date"
                      value={form.last_donation_date || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border-2 border-red-200 dark:border-red-700 focus:border-red-500 transition-all duration-200 bg-white dark:bg-gray-700"
                    />
                  </div>
                </div>

                {/* Donor Guidelines */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <h5 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Important Donor Guidelines
                  </h5>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• You must be at least 16 years old (with parental consent) or 17+ without consent</li>
                    <li>• Weight should be at least 50kg (110 lbs)</li>
                    <li>• Wait at least 8 weeks between whole blood donations</li>
                    <li>• Avoid alcohol 24 hours before donation</li>
                    <li>• Get adequate rest and eat well before donating</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isUpdatingProfile
                    ? 'bg-red-300 dark:bg-red-700 cursor-not-allowed text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                {isUpdatingProfile ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Updating...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Save className="h-4 w-4" />
                    <span>Update Donor Status</span>
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Security Section
  function renderSecuritySection() {
    return (
      <div className="space-y-6">
        {/* Section Header */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
              <Shield className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Security & Privacy</h2>
              <p className="text-gray-500 dark:text-gray-400">Manage your account security settings</p>
            </div>
          </div>
        </div>

        {/* Security Options */}
        <div className="space-y-4">
          {/* Change Password */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Password</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Update your account password</p>
                </div>
              </div>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium flex items-center space-x-2"
              >
                <Edit3 className="h-4 w-4" />
                <span>Change Password</span>
              </button>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Account Status</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Your account information and status</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <div className="flex items-center space-x-2 mb-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">Account Status</span>
                </div>
                <p className="text-lg font-semibold text-green-800 dark:text-green-200">
                  {user.is_active !== false ? 'Active' : 'Suspended'}
                </p>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Member Since</span>
                </div>
                <p className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Unknown'}
                </p>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <Eye className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Privacy Preferences</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Control how your information is shared</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Show profile in donor search</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Allow others to find you when searching for donors</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={user.is_donor || false}
                    onChange={handleChange}
                    className="sr-only peer"
                    disabled
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default ViewProfilePage;
