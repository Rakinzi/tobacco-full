import axios from 'axios';

// Create Axios instance with base configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor to dynamically get token from localStorage for each request
apiClient.interceptors.request.use(
  (config) => {
    // Get the latest token from localStorage for every request
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor with more selective handling of 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
   
    // Only log out for authentication endpoint failures
    // This prevents premature logouts while browsing
    if (response && response.status === 401) {
      console.log('401 error from:', response.config.url);
      
      // Only log out for specific auth endpoints
      if (response.config.url.includes('/login') || 
          response.config.url.includes('/user') ||
          response.config.url.includes('/logout')) {
        console.log('Logging out due to auth endpoint failure');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Only redirect if we're in a browser environment
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
   
    return Promise.reject(error);
  }
);

// Export a function to refresh auth token
export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

export default apiClient;