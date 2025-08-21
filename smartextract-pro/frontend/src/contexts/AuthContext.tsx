import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import authService, { UserProfile } from '../services/auth';
import api from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<UserProfile>;
  register: (email: string, username: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Add a simple rate limiter
const createRateLimiter = (limit: number, interval: number) => {
  let lastCalled = 0;
  let callCount = 0;
  
  return () => {
    const now = Date.now();
    
    // Reset counter if interval has passed
    if (now - lastCalled > interval) {
      callCount = 0;
      lastCalled = now;
    }
    
    // Check if we've exceeded the limit
    if (callCount >= limit) {
      return false;
    }
    
    callCount++;
    return true;
  };
};

// Create a rate limiter: max 5 calls per 10 seconds
const rateLimiter = createRateLimiter(5, 10000);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second
    
    const checkAuth = async () => {
      if (!isMounted) return;
      
      // Apply rate limiting
      if (!rateLimiter()) {
        console.warn('Rate limit exceeded, skipping auth check');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      
      try {
        const token = localStorage.getItem('token');
        console.log('Auth check - Token exists:', !!token);
        
        if (token) {
          try {
            console.log('Auth check - Validating token...');
            const userData = await authService.getCurrentUser();
            console.log('Auth check - User profile:', userData);
            
            if (isMounted) {
              setUser(userData);
              setIsAuthenticated(true);
            }
          } catch (err: any) {
            console.error('Auth check - Token validation failed:', err);
            
            // Handle rate limiting errors
            if (err.response?.status === 429 && retryCount < maxRetries) {
              console.log(`Rate limited, retrying in ${retryDelay}ms (attempt ${retryCount + 1}/${maxRetries})`);
              retryCount++;
              await new Promise(resolve => setTimeout(resolve, retryDelay));
              return checkAuth();
            }
            
            if (isMounted) {
              authService.logout();
              setUser(null);
              setIsAuthenticated(false);
            }
          }
        } else if (isMounted) {
          console.log('Auth check - No token found');
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Auth check - Unexpected error:', err);
        if (isMounted) {
          authService.logout();
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    // Always run the auth check, even if no token (to ensure loading state is set to false)
    checkAuth();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, password: string): Promise<UserProfile> => {
    // Apply rate limiting for login attempts
    if (!rateLimiter()) {
      const errorMsg = 'Too many login attempts. Please wait a moment and try again.';
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    console.log('Starting login process...');
    setLoading(true);
    setError(null);
    
    try {
      // Clear any existing tokens and state
      localStorage.removeItem('token');
      
      // Prepare login credentials
      const credentials = {
        username: email,
        password: password
      };
      
      // Call the auth service to login - this returns AuthResponse with access_token
      const authResponse = await authService.login(credentials);
      const authToken = authResponse.access_token;
      
      if (!authToken) {
        throw new Error('No access token received from server');
      }
      
      // Store the token
      localStorage.setItem('token', authToken);
      
      // Set the default authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      
      // Fetch the user profile using the token
      try {
        const userProfile = await authService.getCurrentUser();
        setUser(userProfile);
        setIsAuthenticated(true);
        return userProfile;
      } catch (profileErr) {
        console.warn('Failed to fetch user profile after login, using basic user data');
        // Create a minimal user profile with required fields
        const basicUser: UserProfile = {
          id: 0, // Temporary ID
          email,
          username: email.split('@')[0],
          full_name: email.split('@')[0],
          is_active: true,
          is_superuser: false,
          created_at: new Date().toISOString()
        };
        setUser(basicUser);
        setIsAuthenticated(true);
        return basicUser;
      }
    } catch (err: any) {
      console.error('Login error:', err);
      let errorMessage = 'Failed to login';
      
      if (err.response) {
        if (err.response.status === 429) {
          errorMessage = 'Too many login attempts. Please try again later.';
        } else if (err.response.status === 401) {
          errorMessage = 'Invalid email or password';
        } else if (err.response.data?.detail) {
          errorMessage = err.response.data.detail;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // Clear any partial auth state
      authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      setError(errorMessage);
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, username: string, password: string, fullName?: string) => {
    setLoading(true);
    setError(null);
    try {
      await authService.register({ email, username, password, full_name: fullName });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        error,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};