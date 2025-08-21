import api from './api';

// Helper function to get cookie value
const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  full_name?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface UserProfile {
  id: number;
  email: string;
  username: string;
  full_name: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
}

const authService = {
  /**
   * Login user and get access token
   * @param credentials User credentials
   * @returns Promise with auth token response
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      console.log('Attempting login with username:', credentials.username);
      
      // Convert to URLSearchParams for x-www-form-urlencoded format
      const params = new URLSearchParams();
      params.append('username', credentials.username);
      params.append('password', credentials.password);
      
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      };
      
      console.log('Sending login request to /auth/login');
      const response = await api.post('/auth/login', params.toString(), { 
        headers,
        skipAuthRefresh: true // Skip auth token refresh for login request
      });
      
      if (!response.data.access_token) {
        throw new Error('No access token received from server');
      }
      
      const { access_token } = response.data;
      console.log('Login successful, storing token');
      
      // Store token in localStorage
      localStorage.setItem('token', access_token);
      
      // Set default Authorization header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Return the auth response
      return {
        access_token,
        token_type: 'bearer'
      };
      
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', (error as any).response);
      console.error('Error message:', (error as any).message);
      throw error;
    }
  },

  /**
   * Register a new user
   * @param userData User registration data
   * @returns Promise with created user data
   */
  register: async (userData: RegisterData): Promise<UserProfile> => {
    const response = await api.post<UserProfile>('/auth/register', userData);
    return response.data;
  },

  /**
   * Get current user profile
   * @returns Promise with user profile data
   */
  getCurrentUser: async (): Promise<UserProfile> => {
    try {
      console.log('Fetching current user profile...');
      const response = await api.get('/auth/me');
      
      // Log the full response for debugging
      console.log('User profile response:', response);
      
      if (!response.data) {
        throw new Error('No data received in response');
      }
      
      // Map the response data to the UserProfile interface
      const userData = response.data;
      const userProfile: UserProfile = {
        id: userData.id,
        email: userData.email,
        username: userData.username,
        full_name: userData.full_name || '',
        is_active: userData.is_active || false,
        is_superuser: userData.is_superuser || false,
        created_at: userData.created_at || new Date().toISOString()
      };
      
      console.log('User profile mapped successfully:', userProfile);
      return userProfile;
      
    } catch (error: any) {
      console.error('Error in getCurrentUser:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
      throw error;
    }
  },

  /**
   * Logout user
   */
  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAuthenticated');
  },

  /**
   * Check if user is authenticated
   * @returns boolean indicating if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return localStorage.getItem('isAuthenticated') === 'true';
  },
};

export default authService;