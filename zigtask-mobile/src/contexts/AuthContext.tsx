import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { User, AuthResponse, LoginDto, RegisterDto } from '../types/api.types';
import { authService } from '../services/authService';
import { apiService } from '../services/api.service';
import { websocketService } from '../services/websocketService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const TOKEN_KEY = 'zigtask_token';
const USER_KEY = 'zigtask_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      const [storedToken, storedUser] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(USER_KEY),
      ]);

      if (storedToken && storedUser) {
        const userData = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(userData);
        
        // Initialize WebSocket connection for real-time updates
        websocketService.connect();
        websocketService.authenticateUser(userData.id);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      // Clear any corrupted data
      await logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginDto) => {
    try {
      setIsLoading(true);
      const response: AuthResponse = await authService.login(credentials);
      
      // Ensure we have valid data
      const tokenValue = response.token || '';
      const userData = response.user || null;
      
      if (!tokenValue || !userData) {
        throw new Error('Invalid response from server');
      }
      
      // Store securely
      await Promise.all([
        SecureStore.setItemAsync(TOKEN_KEY, tokenValue),
        SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData)),
        apiService.setAuthToken(tokenValue),
      ]);

      setToken(tokenValue);
      setUser(userData);
      
      // Initialize WebSocket connection for real-time updates
      websocketService.connect();
      websocketService.authenticateUser(userData.id);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterDto) => {
    try {
      setIsLoading(true);
      const response: AuthResponse = await authService.register(data);
      
      // Ensure we have valid data
      const tokenValue = response.token || '';
      const userData = response.user || null;
      
      if (!tokenValue || !userData) {
        throw new Error('Invalid response from server');
      }
      
      // Store securely
      await Promise.all([
        SecureStore.setItemAsync(TOKEN_KEY, tokenValue),
        SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData)),
        apiService.setAuthToken(tokenValue),
      ]);

      setToken(tokenValue);
      setUser(userData);
      
      // Initialize WebSocket connection for real-time updates
      websocketService.connect();
      websocketService.authenticateUser(userData.id);
    } catch (error: any) {
      console.error('Registration error:', error);
      // Handle specific error codes
      if (error.response?.status === 409) {
        throw new Error('An account with this email already exists. Please try logging in instead.');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call logout service (async, but we don't wait for it)
      authService.logout().catch(console.error);
      
      // Clear local data immediately
      await Promise.all([
        SecureStore.deleteItemAsync(TOKEN_KEY),
        SecureStore.deleteItemAsync(USER_KEY),
      ]);
      
      // Disconnect WebSocket on logout
      websocketService.unauthenticateUser();
      websocketService.disconnect();
      
      // Clear API service auth
      await apiService.clearAuthToken();
      
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setToken(null);
      setUser(null);
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    initializeAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 