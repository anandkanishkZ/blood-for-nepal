// API Configuration and Utilities
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

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
        const errorMessage = data?.message || data || `HTTP error! status: ${response.status}`;
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
    apiClient.setToken(null);
    window.location.href = '/login';
    return 'Session expired. Please login again.';
  } else if (error.status === 403) {
    return 'Access denied. You do not have permission to perform this action.';
  } else if (error.status === 404) {
    return 'Resource not found.';
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
      return 'This email is already registered. Please use a different email or try logging in.';
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
