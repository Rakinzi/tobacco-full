import axios from 'axios';

// Create Axios instance with base configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Initialize the axios interceptor when the module loads
const token = localStorage.getItem('token');
if (token) {
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Authentication Service
const AuthService = {
  // Setup axios interceptors to add token to requests
  setupAxiosInterceptors: (token) => {
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete apiClient.defaults.headers.common['Authorization'];
    }
  },
  
  // Login method
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/login', credentials);
      const { token, user } = response.data;
      
      // Store token and user data in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Setup axios interceptors
      AuthService.setupAxiosInterceptors(token);
      
      return {
        success: true,
        data: { token, user }
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed. Please try again.'
      };
    }
  },
  
  // Register method
  register: async (userData) => {
    try {
      const response = await apiClient.post('/register', userData);
      const { token, user } = response.data;
      
      // Store token and user data in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Setup axios interceptors
      AuthService.setupAxiosInterceptors(token);
      
      return {
        success: true,
        data: { token, user }
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.errors ||
               error.response?.data?.message ||
               'Registration failed. Please try again.'
      };
    }
  },
  
  // Logout method
  logout: async () => {
    try {
      // Try to call the logout endpoint, but don't wait for it
      apiClient.get('/logout').catch(err => console.warn('Logout API call failed', err));
    } finally {
      // Always clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
     
      // Remove authorization header
      AuthService.setupAxiosInterceptors(null);
    }
    return { success: true };
  },
  
  // Get current user from localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.log('Error parsing user data', error);
        return null;
      }
    }
    return null;
  },
  
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
  
  // Refresh user profile
  refreshUserProfile: async () => {
    try {
      // Make sure token is set in axios before making this request
      const token = localStorage.getItem('token');
      if (token) {
        AuthService.setupAxiosInterceptors(token);
      }
      
      const response = await apiClient.get('/user');
      const { user } = response.data;
      
      // Update user in localStorage
      localStorage.setItem('user', JSON.stringify(user));
      
      return {
        success: true,
        data: user
      };
    } catch (error) {
      console.error('Error refreshing user profile:', error);
      
      // If we get a 401 Unauthorized, clear the token
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        AuthService.setupAxiosInterceptors(null);
      }
      
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch user profile.'
      };
    }
  }
};

export default AuthService;