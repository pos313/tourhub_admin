import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth as authApi, mockLogin } from '../lib/api';
import { useLocation } from 'react-router-dom';

// Create the authentication context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Environment check for mock data preference
const shouldUseMockData = () => {
  // Check for environment variable
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_USE_MOCK_DATA === 'true';
  }
  return false;
};

// Check if we're in development mode
const isDevelopmentMode = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.MODE === 'development';
  }
  return process.env.NODE_ENV === 'development';
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [useMockData, setUseMockData] = useState(shouldUseMockData());
  
  // Get current location to avoid API calls on login page
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  // Check for current user session on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      // Skip API call if we're on the login page
      if (isLoginPage) {
        setLoading(false);
        return;
      }
      
      // Try localStorage first to avoid unnecessary API calls
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setCurrentUser(parsedUser);
          setLoading(false);
          return; // Exit early if we have a user in localStorage
        } catch (e) {
          console.error('Error parsing saved user:', e);
          // Continue to API call if parsing fails
        }
      }
      
      // Don't make API call if we're using mock data
      if (useMockData) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await authApi.getCurrentUser();
        if (response && response.user) {
          setCurrentUser(response.user);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        // Set useMockData flag if we encounter API errors
        setUseMockData(true);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, [isLoginPage, useMockData]);

  // Function to log in user
  const login = async (email, password) => {
    try {
      // If we're having API issues, use mock login
      let response;
      
      if (useMockData || isDevelopmentMode()) {
        try {
          // Try real login first
          response = await authApi.login(email, password);
        } catch (error) {
          console.warn('API login failed, using mock login instead');
          // If API login fails, fall back to mock login
          response = await mockLogin(email, password);
        }
      } else {
        // Normal login flow
        response = await authApi.login(email, password);
      }
      
      if (response && response.user) {
        const user = response.user;
        
        // Admin validation - ensure the user has moderator privileges
        if (!user.is_moderator) {
          throw new Error('Access denied: Admin privileges required');
        }
        
        // Save to localStorage as a fallback
        localStorage.setItem('user', JSON.stringify(user));
        setCurrentUser(user);
        return user;
      } else {
        throw new Error('Login failed: Invalid response from server');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error(error.message || 'Invalid email or password');
    }
  };

  // Function to log out user
  const logout = async () => {
    try {
      // Only try to call the logout API if we're not using mock data
      if (!useMockData) {
        await authApi.logout();
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Always clear local state even if API call fails
      localStorage.removeItem('user');
      setCurrentUser(null);
    }
  };

  // Auth context value
  const value = {
    currentUser,
    login,
    logout,
    isAuthenticated: !!currentUser && currentUser.is_moderator,
    useMockData,
    setUseMockData // Export to allow toggling mock mode
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;