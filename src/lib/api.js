// API client for communicating with the backend
import { CLIENT_API_URL, ADMIN_API_PREFIX, CORS_CONFIG } from './config';

/**
 * Common fetch wrapper with error handling
 */
const fetchWithAuth = async (endpoint, options = {}) => {
  // Determine if we're in a browser environment
  const isBrowser = typeof window !== 'undefined';
  
  // Use the appropriate base URL and handle admin endpoints
  const isAdminEndpoint = endpoint.startsWith('/admin');
  let url = `${CLIENT_API_URL}`;
  
  // Ensure endpoint begins with a slash and handle admin endpoints
  let normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // For admin endpoints, we'll just use the original CLIENT_API_URL + the endpoint
  // For other endpoints, we use CLIENT_API_URL directly
  url += normalizedEndpoint;
  
  try {
    // Create a AbortController to handle timeouts
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    // Handle query parameters properly
    if (options.params) {
      const params = new URLSearchParams();
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          params.append(key, value);
        }
      });
      // Remove params from options
      const { params: _, ...restOptions } = options;
      options = restOptions;
      
      // Append params to URL
      const queryString = params.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }
    
    console.log('Making request to:', url);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': window.location.origin, // Important for CORS
        ...options.headers,
      },
      credentials: 'include', // Important for cookies/sessions
      signal: controller.signal,
      mode: 'cors', // Explicitly set CORS mode
    });
    
    clearTimeout(timeoutId);
    
    // Handle HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
    }
    
    // Parse JSON response with error handling
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        // Handle non-JSON responses
        const text = await response.text();
        console.warn('Response is not JSON:', text);
        return { text };
      }
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      const text = await response.text();
      return { text };
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('API request timed out:', endpoint);
      throw new Error('Request timed out. Please try again later.');
    }
    
    console.error('API request failed:', error);
    
    // For development purposes, provide more informative error about CORS issues
    if (error.message && error.message.includes('CORS')) {
      console.error('This appears to be a CORS issue. The server may not be allowing requests from this origin.');
      throw new Error('Unable to connect to the server due to CORS restrictions. Your origin may not be in the allowed list.');
    }
    
    throw error;
  }
};

/**
 * Auth API methods
 */
export const auth = {
  // Login with email and password
  login: async (email, password, remember = true) => {
    return fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, remember }),
    });
  },
  
  // Logout current user
  logout: async () => {
    return fetchWithAuth('/auth/logout', {
      method: 'POST',
    });
  },
  
  // Get current user info
  getCurrentUser: async () => {
    try {
      return await fetchWithAuth('/auth/me', {
        method: 'GET',
      });
    } catch (error) {
      // Allow the app to continue if auth check fails
      console.warn('Auth check failed:', error);
      return { authenticated: false };
    }
  }
};

/**
 * Admin API methods
 */
export const admin = {
  // Get all reports
  getReports: async (status = null) => {
    return fetchWithAuth(`${ADMIN_API_PREFIX}/reports`, {
      method: 'GET',
      params: status ? { status } : undefined
    });
  },
  
  // Update report status
  updateReportStatus: async (reportId, status) => {
    return fetchWithAuth(`${ADMIN_API_PREFIX}/reports/${reportId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
  
  // Get blocked users list
  getBlockedUsers: async () => {
    return fetchWithAuth(`${ADMIN_API_PREFIX}/blocked-users`, {
      method: 'GET',
    });
  },
  
  // Block a user
  blockUser: async (blockerId, blockedId) => {
    return fetchWithAuth(`${ADMIN_API_PREFIX}/block-user`, {
      method: 'POST',
      body: JSON.stringify({ blocker_id: blockerId, blocked_id: blockedId }),
    });
  },
  
  // Unblock a user
  unblockUser: async (blockId) => {
    return fetchWithAuth(`${ADMIN_API_PREFIX}/unblock-user/${blockId}`, {
      method: 'DELETE',
    });
  },
  
  // Get message details
  getMessageDetails: async (messageType, messageId) => {
    return fetchWithAuth(`${ADMIN_API_PREFIX}/message/${messageType}/${messageId}`, {
      method: 'GET',
    });
  },
  
  // Delete a message
  deleteMessage: async (messageType, messageId) => {
    return fetchWithAuth(`${ADMIN_API_PREFIX}/message/${messageType}/${messageId}`, {
      method: 'DELETE',
    });
  },
  
  // Get dashboard stats
  getDashboardStats: async () => {
    return fetchWithAuth(`${ADMIN_API_PREFIX}/dashboard-stats`, {
      method: 'GET',
    });
  },
};

/**
 * Test connection to the backend
 */
export const testConnection = async () => {
  try {
    // Create a request with proper CORS headers
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`${CLIENT_API_URL}/test-connection`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Origin': window.location.origin,
      },
      signal: controller.signal,
      mode: 'cors', // Explicitly set CORS mode
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Connection test failed:', error);
    if (error.message && error.message.includes('CORS')) {
      throw new Error('CORS Error: Your origin is not allowed by the server. Contact the administrator.');
    }
    throw new Error('Failed to connect to the backend. Please check if the server is running.');
  }
};

// Provide a mock login function for development when the backend is not available
export const mockLogin = async (email, password) => {
  console.warn('Using mock login since API is unavailable');
  return {
    authenticated: true,
    user: {
      id: 1,
      email: email || 'admin@example.com',
      username: 'admin',
      is_moderator: true,
      profile: {
        display_name: 'Admin User',
      }
    }
  };
};

export default {
  auth,
  admin,
  testConnection,
  mockLogin,
};