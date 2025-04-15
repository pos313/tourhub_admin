// Configuration file for the TourHub Admin application

// API Base URL - Change this according to your environment
export const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (process.env.NODE_ENV === 'production'
  ? 'https://api.tourhub.example.com'
  : 'http://localhost:5000');

// Client-side API URL (used in browser)
export const CLIENT_API_URL = `${API_BASE_URL}/api`;

// Admin-specific API endpoint prefix - this is appended to the CLIENT_API_URL
// e.g., http://localhost:5000/api + /admin = http://localhost:5000/api/admin
export const ADMIN_API_PREFIX = '/admin';

// General application configuration
export const APP_CONFIG = {
  name: 'TourHub Admin',
  version: '0.1.0',
  description: 'Administration dashboard for TourHub application',
  copyright: `© ${new Date().getFullYear()} TourHub`,
};

// Authentication settings
export const AUTH_CONFIG = {
  tokenStorageKey: 'tourhub_admin_token',
  userStorageKey: 'user',
  sessionTimeout: 60 * 60 * 1000, // 1 hour in milliseconds
};

// Theme settings
export const THEME_CONFIG = {
  storageKey: 'theme',
  defaultTheme: 'light',
};

// Pagination defaults
export const PAGINATION_CONFIG = {
  defaultPageSize: 10,
  pageSizeOptions: [10, 25, 50, 100],
};

// CORS Configuration for development
export const CORS_CONFIG = {
  credentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};

export default {
  API_BASE_URL,
  CLIENT_API_URL,
  ADMIN_API_PREFIX,
  APP_CONFIG,
  AUTH_CONFIG,
  THEME_CONFIG,
  PAGINATION_CONFIG,
  CORS_CONFIG,
};