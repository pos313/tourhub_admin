import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LockKeyhole, Mail, AlertCircle, Info, Database } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, useMockData, setUseMockData } = useAuth();
  const navigate = useNavigate();
  
  // Check if we're in development mode
  const isDevelopment = () => {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env.MODE === 'development';
    }
    return process.env.NODE_ENV === 'development';
  };
  
  const isDevMode = isDevelopment();
  
  // Placeholder values for development
  const emailPlaceholder = isDevMode ? 'admin@example.com' : 'email@example.com';
  const passwordPlaceholder = isDevMode ? 'admin123' : '••••••••';

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset error
    setError('');
    
    // Validate inputs
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    if (!password) {
      setError('Password is required');
      return;
    }
    
    try {
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      
      // Create more user-friendly error message
      let errorMessage = error.message || 'Failed to login. Please check your credentials.';
      
      // Add helpful message for CORS errors
      if (errorMessage.includes('CORS') || 
          errorMessage.includes('connect to the server') ||
          errorMessage.includes('NetworkError')) {
        errorMessage = 'Unable to connect to the backend server. This might be a CORS issue or the server is not running. You can enable mock data mode to continue testing.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle mock data mode
  const toggleMockData = () => {
    setUseMockData(prev => !prev);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] px-4">
      <div className="w-full max-w-md">
        <div className="bg-card shadow-lg rounded-lg p-6 border">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-primary">TourHub Admin</h1>
            <p className="text-muted-foreground">Login to access the admin dashboard</p>
          </div>
          
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-4 flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
          
          {/* Development mode notice */}
          {isDevMode && (
            <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 p-3 rounded-md mb-4">
              <div className="flex items-start mb-2">
                <Info className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <p>Development mode: You can use any credentials for testing.</p>
              </div>
              
              {/* Mock data toggle switch */}
              <div className="flex items-center justify-between mt-2 bg-white/50 dark:bg-blue-950/50 p-2 rounded">
                <div className="flex items-center">
                  <Database className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">Mock Data Mode</span>
                </div>
                <button
                  type="button"
                  onClick={toggleMockData}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                    useMockData ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      useMockData ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {useMockData && (
                <p className="text-xs mt-2">
                  Mock data is enabled. The system will use simulated data instead of connecting to the backend.
                </p>
              )}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder={emailPlaceholder}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                    <LockKeyhole className="h-5 w-5" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder={passwordPlaceholder}
                    required
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>
          
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>Only authorized administrators can access this system.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;