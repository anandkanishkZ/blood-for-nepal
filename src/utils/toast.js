import { toast } from 'react-toastify';

// Professional toast notification utilities
export const showToast = {
  success: (message, options = {}) => {
    toast.success(message, {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options
    });
  },

  error: (message, options = {}) => {
    toast.error(message, {
      position: "top-right",
      autoClose: 5000, // Slightly longer for errors
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options
    });
  },

  warning: (message, options = {}) => {
    toast.warning(message, {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options
    });
  },

  info: (message, options = {}) => {
    toast.info(message, {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options
    });
  },

  // Special notifications with professional messages
  login: {
    success: () => showToast.success('Welcome back! Login successful.'),
    error: (message) => showToast.error(message || 'Login failed. Please try again.'),
  },

  logout: {
    success: () => showToast.info('You have been logged out successfully.'),
  },

  register: {
    success: () => showToast.success('Account created successfully! Welcome to Blood For Nepal.'),
    error: (message) => showToast.error(message || 'Registration failed. Please try again.'),
  },

  profile: {
    updated: () => showToast.success('Profile updated successfully.'),
    error: (message) => showToast.error(message || 'Failed to update profile.'),
  },

  bloodRequest: {
    created: () => showToast.success('Blood request submitted successfully.'),
    updated: () => showToast.success('Blood request updated successfully.'),
    cancelled: () => showToast.info('Blood request cancelled.'),
    error: (message) => showToast.error(message || 'Failed to process blood request.'),
  },

  donation: {
    scheduled: () => showToast.success('Donation appointment scheduled successfully.'),
    completed: () => showToast.success('Thank you for your life-saving donation!'),
    cancelled: () => showToast.info('Donation appointment cancelled.'),
    error: (message) => showToast.error(message || 'Failed to process donation.'),
  },

  // Utility functions
  dismiss: () => toast.dismiss(),
  dismissAll: () => toast.dismiss(),
};

export default showToast;
