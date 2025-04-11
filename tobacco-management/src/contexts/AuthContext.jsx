import React, { createContext, useContext, useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import AuthService from '../services/auth-service';

// Authentication Context
const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => ({ success: false }),
  refreshUser: async () => {}
});

// Authentication Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [error, setError] = useState(null);
  
  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        // First, make sure the token from localStorage is applied to axios
        const token = localStorage.getItem('token');
        if (token) {
          AuthService.setupAxiosInterceptors(token);
        }
        
        // Check if user is already logged in
        if (AuthService.isAuthenticated()) {
          // Load user data from localStorage first for immediate display
          const userData = AuthService.getCurrentUser();
          setUser(userData);
          
          // Then refresh the user profile from the server
          const response = await AuthService.refreshUserProfile();
          if (response.success) {
            setUser(response.data);
          } else if (response.error) {
            // If refresh fails, log the user out
            console.error('Failed to refresh user profile:', response.error);
            await AuthService.logout();
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Handle initialization errors by clearing authentication
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
  }, []);
  
  // Login function
  const login = async (credentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await AuthService.login(credentials);
      if (response.success) {
        setUser(response.data.user);
        return { success: true };
      } else {
        setError(response.error);
        return { success: false, error: response.error };
      }
    } catch (err) {
      const errorMessage = err.message || 'Login failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };
  
  // Register function
  const register = async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await AuthService.register(userData);
      if (response.success) {
        setUser(response.data.user);
        return { success: true };
      } else {
        setError(response.error);
        return { success: false, error: response.error };
      }
    } catch (err) {
      const errorMessage = err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };
  
  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      await AuthService.logout();
      setUser(null);
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Logout failed.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };
  
  // Refresh user function
  const refreshUser = async () => {
    setIsLoading(true);
    try {
      const response = await AuthService.refreshUserProfile();
      if (response.success) {
        setUser(response.data);
        return { success: true };
      } else {
        console.error('Failed to refresh user:', response.error);
        if (response.error.includes('Unauthorized') || response.error.includes('401')) {
          // If unauthorized, log the user out
          await logout();
        }
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Failed to refresh user', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };
  
  // Value object to provide in context
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshUser,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Protected route component
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
 
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
 
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
 
  return children;
};