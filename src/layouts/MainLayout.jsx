import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon, LogOut, LayoutDashboard } from 'lucide-react';

const MainLayout = () => {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <LayoutDashboard className="h-6 w-6" />
            <h1 className="text-xl font-bold">TourHub Admin</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated && (
              <>
                <span className="hidden md:inline-block">
                  {currentUser?.username || currentUser?.email}
                </span>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full hover:bg-primary-foreground/10"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 p-2 rounded-full hover:bg-primary-foreground/10"
                  aria-label="Logout"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="hidden md:inline-block">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow container mx-auto p-4 md:p-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-muted p-4 text-center text-muted-foreground text-sm">
        <div className="container mx-auto">
          <p>© {new Date().getFullYear()} TourHub Admin. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;