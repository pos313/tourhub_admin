import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combine multiple class names and merge tailwind classes properly
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string into a human-readable format
 * @param {string} dateString - ISO date string
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export function formatDate(dateString, options = {}) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // Default options
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  
  // Merge default options with provided options
  const formatOptions = { ...defaultOptions, ...options };
  
  return new Intl.DateTimeFormat('en-US', formatOptions).format(date);
}

/**
 * Format a date string to a relative time string (e.g., "2 hours ago")
 * @param {string} dateString - ISO date string
 * @returns {string} Relative time string
 */
export function formatRelativeTime(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  
  // Convert to seconds
  const seconds = Math.floor(diff / 1000);
  
  // Less than a minute
  if (seconds < 60) {
    return 'just now';
  }
  
  // Less than an hour
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  // Less than a day
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  // Less than a week
  if (seconds < 604800) {
    const days = Math.floor(seconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
  
  // Default to formatted date
  return formatDate(dateString, { hour: undefined, minute: undefined });
}

/**
 * Truncate a string to a specified length and add ellipsis if needed
 * @param {string} str - The string to truncate
 * @param {number} length - Maximum length before truncating
 * @returns {string} Truncated string
 */
export function truncate(str, length = 100) {
  if (!str) return '';
  if (str.length <= length) return str;
  
  return str.slice(0, length) + '...';
}

/**
 * Get the correct CSS class for a report status
 * @param {string} status - The report status
 * @returns {string} CSS class name
 */
export function getStatusClass(status) {
  switch (status) {
    case 'pending':
      return 'status-badge status-pending';
    case 'reviewed':
      return 'status-badge status-reviewed';
    case 'dismissed':
      return 'status-badge status-dismissed';
    default:
      return 'status-badge';
  }
}

/**
 * Group reports by message ID
 * @param {Array} reports - Array of report objects
 * @returns {Object} Object with message IDs as keys and arrays of reports as values
 */
export function groupReportsByMessage(reports) {
  return reports.reduce((grouped, report) => {
    const key = `${report.message_type}-${report.message_id}`;
    
    if (!grouped[key]) {
      grouped[key] = [];
    }
    
    grouped[key].push(report);
    return grouped;
  }, {});
}

/**
 * Generate a unique client-side ID
 * @returns {string} Unique ID
 */
export function generateId() {
  return Math.random().toString(36).substring(2, 9);
}