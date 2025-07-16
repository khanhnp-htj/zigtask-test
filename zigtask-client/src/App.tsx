import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/authStore';
import { useTaskStore } from './stores/taskStore';
import { websocketService } from './services/websocketService';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { Dashboard } from './pages/Dashboard';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  const { initializeAuth, isAuthenticated, user } = useAuthStore();
  const { initializeWebSocket, disconnectWebSocket } = useTaskStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Initialize WebSocket when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      initializeWebSocket();
      websocketService.authenticateUser(user.id);
    } else {
      disconnectWebSocket();
    }

    // Cleanup on unmount
    return () => {
      disconnectWebSocket();
    };
  }, [isAuthenticated, user, initializeWebSocket, disconnectWebSocket]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public routes */}
          <Route
            path="/signin"
            element={
              !isAuthenticated ? <SignIn /> : <Navigate to="/dashboard" replace />
            }
          />
          <Route
            path="/signup"
            element={
              !isAuthenticated ? <SignUp /> : <Navigate to="/dashboard" replace />
            }
          />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Redirect root to dashboard */}
          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />

          {/* 404 fallback */}
          <Route
            path="*"
            element={<Navigate to="/dashboard" replace />}
          />
        </Routes>

        {/* Global toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
