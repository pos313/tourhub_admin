import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth as authApi, mockLogin } from '../lib/api';

// Create the authentication context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [useMockData, setUseMockData] = useState(false);

  // Check for current user session on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await authApi.getCurrentUser();
        if (response && response.user) {
          setCurrentUser(response.user);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        // Failed to get user from API, try localStorage as fallback
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          try {
            setCurrentUser(JSON.parse(savedUser));
          } catch (e) {
            console.error('Error parsing saved user:', e);
          }
        }

        // Set useMockData flag if we encounter API errors
        setUseMockData(true);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Function to log in user
  const login = async (email, password) => {
    try {
      // If we're having API issues, use mock login
      let response;
      
      if (useMockData || process.env.NODE_ENV === 'development') {
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
    useMockData
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;