import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth as authApi } from '../lib/api';

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
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Function to log in user
  const login = async (email, password) => {
    try {
      const response = await authApi.login(email, password);
      
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
      await authApi.logout();
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
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;