import axios, { AxiosError, AxiosResponse, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

// Extend the AxiosRequestConfig interface to include our custom options
declare module 'axios' {
  interface AxiosRequestConfig {
    skipAuthRefresh?: boolean;
  }
}

// Define the queue item type
interface QueueItem {
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}

// Request queue for rate limiting and token refresh
const requestQueue: QueueItem[] = [];
let isRefreshing = false;

// Create axios instance with base URL from environment variables
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request for debugging
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      withCredentials: config.withCredentials,
      data: config.data,
    });
    
    return config;
  },
  (error: AxiosError) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Extend the config type to include our custom properties
declare module 'axios' {
  interface AxiosRequestConfig {
    _retry?: boolean;
    _queued?: boolean;
    skipAuthRefresh?: boolean;
  }
}

// Process the queue of pending requests
const processQueue = (error: Error | AxiosError | null, token: string | null = null) => {
  requestQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  requestQueue.length = 0;
};

// Add response interceptor to handle errors, token refresh, and rate limiting
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful responses for debugging
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean; _queued?: boolean };
    
    // Log the error for debugging
    console.error('API Error:', {
      url: originalRequest?.url,
      status: error.response?.status,
      data: error.response?.data,
      config: {
        headers: originalRequest?.headers,
        withCredentials: originalRequest?.withCredentials,
      },
    });

    // Handle rate limiting (429)
    if (error.response?.status === 429) {
      console.log('Rate limited, adding to queue...');
      
      // Get retry-after header or default to 1 second
      const retryAfter = error.response?.headers?.['retry-after'] || '1';
      const delay = Math.min(parseInt(retryAfter, 10) * 1000, 10000); // Max 10s delay
      
      // If not already queued, add to queue and retry after delay
      if (!originalRequest?._queued) {
        originalRequest._queued = true;
        
        return new Promise((resolve, reject) => {
          requestQueue.push({
            resolve: () => {
              // Retry the original request
              api(originalRequest).then(resolve).catch(reject);
            },
            reject
          });
          
          setTimeout(() => {
            processQueue(null);
          }, delay);
        });
      }
      
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      console.log('Handling 401 Unauthorized error');
      
      // If this is a retry request or refresh token endpoint, redirect to login
      if (originalRequest?._retry || originalRequest?.url?.includes('refresh-token')) {
        console.log('Already retried or refresh failed, redirecting to login');
        // Clear auth state
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(error);
      }
      
      // If already refreshing, add to queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          requestQueue.push({
            resolve: () => {
              // Retry the original request with new token
              if (originalRequest?.headers) {
                const token = localStorage.getItem('token');
                if (token) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
              }
              api(originalRequest).then(resolve).catch(reject);
            },
            reject
          });
        });
      }
      
      // Mark the request as a retry and start refresh process
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        console.log('Attempting to refresh token...');
        const response = await api.post('/auth/refresh-token', {}, { 
          skipAuthRefresh: true,
          _queued: true // Skip queue for refresh token request
        });
        
        const { access_token } = response.data;
        
        if (access_token) {
          console.log('Token refreshed successfully');
          localStorage.setItem('token', access_token);
          
          // Update the default Authorization header
          api.defaults.headers.common.Authorization = `Bearer ${access_token}`;
          
          // Process any queued requests with the new token
          processQueue(null, access_token);
          
          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);
        // If refresh fails, clear auth and redirect to login
        localStorage.removeItem('token');
        const error = new Error('Failed to refresh token') as AxiosError;
        error.isAxiosError = true;
        error.toJSON = () => ({});
        processQueue(error);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // Handle other error cases
    if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else if (error.message) {
      // Something happened in setting up the request
      console.error('Request setup error:', error.message);
    } else {
      console.error('An unexpected error occurred:', error);
    }
    
    return Promise.reject(error);
  }
);

export default api;