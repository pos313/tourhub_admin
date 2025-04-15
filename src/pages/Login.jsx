import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LockKeyhole, Mail, AlertCircle, Info } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, useMockData } = useAuth();
  const navigate = useNavigate();
  
  // When in development, show placeholder values
  const isDevelopment = process.env.NODE_ENV === 'development';
  const emailPlaceholder = isDevelopment ? 'admin@example.com' : 'email@example.com';
  const passwordPlaceholder = isDevelopment ? 'admin123' : '••••••••';

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
      if (errorMessage.includes('CORS') || errorMessage.includes('connect to the server')) {
        errorMessage = 'Unable to connect to the server. This might be a CORS issue or the backend server is not running. If you are in development mode, you can still login with any credentials for testing.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
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
          {isDevelopment && (
            <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 p-3 rounded-md mb-4 flex items-start">
              <Info className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <p>Development mode: You can use any credentials for testing. Mock data will be used if the backend is not available.</p>
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