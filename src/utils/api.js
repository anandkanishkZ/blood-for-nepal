// API Configuration and Utilities
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Blood Request API
export const bloodRequestAPI = {
  // Submit a new blood request (with file upload)
  submitRequest: async (data) => {
    const formData = new FormData();
    // Add all fields to formData
    for (const key in data) {
      if (key === 'location' && typeof data[key] === 'object') {
        // Flatten location fields
        for (const locKey in data.location) {
          formData.append(locKey, data.location[locKey] || '');
        }
      } else if (key === 'prescription' && data.prescription) {
        formData.append('prescription', data.prescription);
      } else if (key !== 'prescriptionPreview') {
        formData.append(key, data[key]);
      }
    }
    // POST to /blood-requests (base URL already includes /api/v1)
    return apiClient.uploadFile('/blood-requests', formData);
  },
  // Fetch all blood requests (admin)
  getAll: async () => {
    return apiClient.get('/blood-requests');
  },
  // Fetch a single blood request by ID (admin)
  getById: async (id) => {
    return apiClient.get(`/blood-requests/${id}`);
  },
  // Get prescription image URL for direct access
  getPrescriptionImageUrl: (prescriptionUrl) => {
    if (!prescriptionUrl) return null;
    // Remove leading slash if present and construct full URL
    const cleanUrl = prescriptionUrl.startsWith('/') ? prescriptionUrl.slice(1) : prescriptionUrl;
    return `${API_BASE_URL.replace('/api/v1', '')}/${cleanUrl}`;
  },
  
  // Delete blood request (admin) - Soft delete (move to trash)
  delete: async (id) => {
    return apiClient.delete(`/blood-requests/${id}`);
  },
  
  // Permanently delete blood request (admin) - Hard delete from trash
  permanentlyDelete: async (id) => {
    return apiClient.delete(`/blood-requests/${id}/permanent`);
  },
  
  // Restore blood request from trash (admin)
  restore: async (id, admin_notes = '') => {
    return apiClient.put(`/blood-requests/${id}/restore`, { admin_notes });
  },
  
  // Mark blood request as spam (admin)
  markAsSpam: async (id, admin_notes = '') => {
    return apiClient.put(`/blood-requests/${id}/spam`, { admin_notes });
  },
  
  // Mark blood request as completed (admin)
  markAsCompleted: async (id, admin_notes = '') => {
    return apiClient.put(`/blood-requests/${id}/complete`, { admin_notes });
  },
  
  // Update blood request status (admin)
  updateStatus: async (id, status, admin_notes = '') => {
    return apiClient.put(`/blood-requests/${id}/status`, { status, admin_notes });
  },
  
  // Revert blood request (admin) - reset to pending and remove spam/completed flags
  revert: async (id, admin_notes = '') => {
    return apiClient.put(`/blood-requests/${id}/revert`, { admin_notes });
  },
};

// API Configuration and Utilities (moved below bloodRequestAPI)
// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'; // Already defined above

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = this.getTokenFromStorage();
  }

  // Get token from localStorage
  getTokenFromStorage() {
    return localStorage.getItem('token');
  }

  // Set token in localStorage
  setToken(token) {
    if (token) {
      localStorage.setItem('token', token);
      this.token = token;
    } else {
      localStorage.removeItem('token');
      this.token = null;
    }
  }

  // Get default headers
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Make API request
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: this.getHeaders(),
      credentials: 'include', // Include cookies
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle different response types
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        // Handle API errors
        let errorMessage;
        
        if (data && typeof data === 'object') {
          // Try to extract error message from different response structures
          errorMessage = data.message || data.error?.message || data.error || JSON.stringify(data);
        } else {
          errorMessage = data || `HTTP error! status: ${response.status}`;
        }
        
        const error = new Error(errorMessage);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
      }
      
      // Re-throw API errors
      throw error;
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // File upload request
  async uploadFile(endpoint, formData) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Always get fresh token from localStorage for uploads
    const currentToken = this.getTokenFromStorage();
    
    // Update instance token if different
    if (currentToken !== this.token) {
      this.token = currentToken;
    }
    
    const config = {
      method: 'POST',
      headers: {
        // Don't set Content-Type for FormData, let browser set it with boundary
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {})
      },
      credentials: 'include',
      body: formData,
    };

    try {
      const response = await fetch(url, config);
      
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const errorMessage = data?.message || data || `HTTP error! status: ${response.status}`;
        const error = new Error(errorMessage);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
      }
      throw error;
    }
  }
}

// Create singleton instance
const apiClient = new ApiClient();

// Auth API functions
export const authAPI = {
  // Register user
  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    if (response.data?.token) {
      apiClient.setToken(response.data.token);
    }
    return response;
  },

  // Register donor with extended information (for authenticated users)
  registerDonor: async (donorData) => {
    const response = await apiClient.post('/auth/register-donor', donorData);
    return response;
  },

  // Login user
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    if (response.data?.token) {
      apiClient.setToken(response.data.token);
    }
    return response;
  },

  // Logout user
  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      apiClient.setToken(null);
    }
  },

  // Get current user
  getMe: async () => {
    return apiClient.get('/auth/me');
  },

  // Update profile
  updateProfile: async (profileData) => {
    return apiClient.put('/auth/profile', profileData);
  },

  // Change password
  changePassword: async (passwordData) => {
    return apiClient.put('/auth/change-password', passwordData);
  },

  // Get all users (admin)
  getAllUsers: async () => {
    return apiClient.get('/auth/users');
  },

  // Get user by ID (admin)
  getUserById: async (userId) => {
    return apiClient.get(`/auth/users/${userId}`);
  },

  // Block a user (admin)
  blockUser: async (userId, block_note) => {
    return apiClient.put(`/auth/users/${userId}/block`, { block_note });
  },

  // Unblock a user (admin)
  unblockUser: async (userId) => {
    return apiClient.put(`/auth/users/${userId}/unblock`);
  },

  // Impersonate a user (admin)
  impersonateUser: async (userId) => {
    return apiClient.post(`/auth/users/${userId}/impersonate`);
  },

  // Get admin dashboard stats (admin)
  getAdminStats: async () => {
    return apiClient.get('/auth/admin/stats');
  },

  // Verification endpoints
  verifyUser: async (verificationData) => {
    const response = await apiClient.post('/auth/verify', verificationData);
    if (response.data?.token) {
      apiClient.setToken(response.data.token);
    }
    return response;
  },

  resendVerification: async (userId) => {
    return apiClient.post('/auth/resend-verification', { userId });
  },

  switchVerificationMethod: async (userId, newMethod) => {
    return apiClient.post('/auth/switch-verification', { userId, newMethod });
  },

  getVerificationStatus: async (userId) => {
    return apiClient.get(`/auth/verification-status/${userId}`);
  },

  verifyEmailLink: async (token, email) => {
    const response = await apiClient.get(`/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`);
    if (response.data?.token) {
      apiClient.setToken(response.data.token);
    }
    return response;
  },
};

// Health check
export const healthAPI = {
  check: async () => {
    return apiClient.get('/health');
  },
};

// Error handling utility
export const handleApiError = (error) => {
  if (error.status === 401) {
    // Token expired or invalid
    if (
      error.message &&
      (error.message.toLowerCase().includes('token') ||
       error.message.toLowerCase().includes('session'))
    ) {
      apiClient.setToken(null);
      window.location.href = '/login';
      return 'Session expired. Please login again.';
    }
    // Otherwise, show the real backend message
    return error.data?.message || error.message || 'Unauthorized. Please try again.';
  } else if (error.status === 403) {
    return 'Access denied. You do not have permission to perform this action.';
  } else if (error.status === 404) {
    // Handle user not found during login
    const message = error.data?.message || error.message || 'Resource not found.';
    if (message.includes('No account found')) {
      return {
        message: message,
        action: 'register',
        actionText: 'Create Account'
      };
    }
    return message;
  } else if (error.status === 409) {
    // Handle duplicate account during registration
    const message = error.data?.message || error.message || 'Conflict occurred.';
    if (message.includes('account with this email already exists')) {
      return {
        message: message,
        action: 'login',
        actionText: 'Login Instead'
      };
    }
    return message;
  } else if (error.status === 422 || error.status === 400) {
    // Validation errors or duplicate data
    if (error.data?.validationErrors) {
      return error.data.validationErrors.map(err => err.message || err.msg).join(', ');
    } else if (error.data?.error?.validationErrors) {
      return error.data.error.validationErrors.map(err => err.message || err.msg).join(', ');
    }
    // Handle specific duplicate email error
    const message = error.data?.message || error.message || 'Validation failed.';
    if (message.includes('already exists')) {
      return {
        message: message,
        action: 'login',
        actionText: 'Login Instead'
      };
    }
    return message;
  } else if (error.status >= 500) {
    return 'Server error. Please try again later.';
  } else {
    return error.data?.message || error.message || 'An unexpected error occurred.';
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!apiClient.getTokenFromStorage();
};

// Get current token
export const getToken = () => {
  return apiClient.getTokenFromStorage();
};

export default apiClient;
