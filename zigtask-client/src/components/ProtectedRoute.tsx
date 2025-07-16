import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  console.log('🔍 ProtectedRoute: Checking auth', { isAuthenticated, isLoading });

  // Show loading while auth is being initialized
  if (isLoading) {
    console.log('🔍 ProtectedRoute: Showing loading spinner');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Only redirect to signin after initialization is complete and user is not authenticated
  if (!isAuthenticated) {
    console.log('🔍 ProtectedRoute: Redirecting to signin - not authenticated');
    return <Navigate to="/signin" replace />;
  }

  console.log('🔍 ProtectedRoute: Rendering protected content');
  return <>{children}</>;
}; 