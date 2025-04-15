// API client for communicating with the backend
import { CLIENT_API_URL, ADMIN_API_URL } from './config';

/**
 * Common fetch wrapper with error handling
 */
const fetchWithAuth = async (endpoint, options = {}) => {
  // Determine if we're in a browser environment
  const isBrowser = typeof window !== 'undefined';
  
  // Use the appropriate base URL
  const isAdminEndpoint = endpoint.startsWith('/admin');
  const baseUrl = isAdminEndpoint ? ADMIN_API_URL : CLIENT_API_URL;
  
  // Ensure endpoint begins with a slash and does not include /api prefix
  // (since it's already in the base URL)
  let normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  // Remove duplicate /api if present
  normalizedEndpoint = normalizedEndpoint.replace(/^\/api/, '');
  
  try {
    // Create a AbortController to handle timeouts
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    // Handle query parameters properly
    let url = `${baseUrl}${normalizedEndpoint}`;
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
    return fetchWithAuth('/admin/reports', {
      method: 'GET',
      params: status ? { status } : undefined
    });
  },
  
  // Update report status
  updateReportStatus: async (reportId, status) => {
    return fetchWithAuth(`/admin/reports/${reportId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
  
  // Get blocked users list
  getBlockedUsers: async () => {
    return fetchWithAuth('/admin/blocked-users', {
      method: 'GET',
    });
  },
  
  // Block a user
  blockUser: async (blockerId, blockedId) => {
    return fetchWithAuth('/admin/block-user', {
      method: 'POST',
      body: JSON.stringify({ blocker_id: blockerId, blocked_id: blockedId }),
    });
  },
  
  // Unblock a user
  unblockUser: async (blockId) => {
    return fetchWithAuth(`/admin/unblock-user/${blockId}`, {
      method: 'DELETE',
    });
  },
  
  // Get message details
  getMessageDetails: async (messageType, messageId) => {
    return fetchWithAuth(`/admin/message/${messageType}/${messageId}`, {
      method: 'GET',
    });
  },
  
  // Delete a message
  deleteMessage: async (messageType, messageId) => {
    return fetchWithAuth(`/admin/message/${messageType}/${messageId}`, {
      method: 'DELETE',
    });
  },
  
  // Get dashboard stats
  getDashboardStats: async () => {
    return fetchWithAuth('/admin/dashboard-stats', {
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

export default {
  auth,
  admin,
  testConnection,
};