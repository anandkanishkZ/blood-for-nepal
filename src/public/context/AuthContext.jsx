import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo, useRef } from 'react';
import { authAPI, handleApiError } from '../../utils/api';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  SET_ERROR: 'SET_ERROR',
  LOGOUT: 'LOGOUT',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
        error: null,
      };
    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const isCheckingAuth = useRef(false);

  // Define checkAuthStatus function with useCallback to prevent re-renders
  const checkAuthStatus = useCallback(async () => {
    // Prevent multiple simultaneous auth checks
    if (isCheckingAuth.current) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      return;
    }

    isCheckingAuth.current = true;
    try {
      const response = await authAPI.getMe();
      
      // Update localStorage with fresh user data
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.data.user });
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    } finally {
      isCheckingAuth.current = false;
    }
  }, []);

  // Check if user is authenticated on app load
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = useCallback(async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await authAPI.login(credentials);
      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.data.user });
      
      return { success: true, message: response.message };
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await authAPI.register(userData);
      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.data.user });
      
      return { success: true, message: response.message };
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Error handled, continue with logout
    } finally {
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  }, []);

  const updateProfile = useCallback(async (profileData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await authAPI.updateProfile(profileData);
      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.data.user });
      
      return { success: true, message: response.message };
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, []);

  // Force refresh user data (useful after avatar upload)
  const forceRefreshUser = useCallback(async () => {
    try {
      const response = await authAPI.getMe();
      
      // Update localStorage with fresh user data
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.data.user });
      return { success: true, user: response.data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  const changePassword = useCallback(async (passwordData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await authAPI.changePassword(passwordData);
      
      return { success: true, message: response.message };
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, []);

  const value = useMemo(() => ({
    ...state,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError,
    checkAuthStatus,
    forceRefreshUser,
  }), [state, login, register, logout, updateProfile, changePassword, clearError, checkAuthStatus, forceRefreshUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
