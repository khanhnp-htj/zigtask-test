import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { User, SignUpData, SignInData } from '../types/api.types';
import { authService } from '../services/authService';
import { apiService } from '../services/api.service';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  signUp: (data: SignUpData) => Promise<void>;
  signIn: (data: SignInData) => Promise<void>;
  logout: () => void;
  initializeAuth: () => void;
  clearError: () => void;
}

const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,

      signUp: async (data: SignUpData) => {
        set({ isLoading: true });
        try {
          const response = await authService.signUp(data);
          
          apiService.setAuthToken(response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          
          set({ 
            user: response.user, 
            isAuthenticated: true, 
            isLoading: false 
          });
          
          toast.success('Account created successfully!');
        } catch (error) {
          set({ isLoading: false });
          console.error('SignUp error:', error);
          throw error;
        }
      },

      signIn: async (data: SignInData) => {
        set({ isLoading: true });
        try {
          const response = await authService.signIn(data);
          
          apiService.setAuthToken(response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          
          set({ 
            user: response.user, 
            isAuthenticated: true, 
            isLoading: false 
          });
          
          toast.success('Signed in successfully!');
        } catch (error) {
          set({ isLoading: false });
          console.error('SignIn error:', error);
          throw error;
        }
      },

      logout: () => {
        try {
          // Call logout service (async, but we don't wait for it)
          authService.logout().catch(console.error);
          
          // Clear local state immediately
          apiService.clearAuthToken();
          
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false 
          });
          
          toast.success('Signed out successfully!');
        } catch (error) {
          console.error('Logout error:', error);
          // Still clear local state even if logout call fails
          apiService.clearAuthToken();
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false 
          });
        }
      },

      initializeAuth: () => {
        try {
          const token = localStorage.getItem('token');
          const userStr = localStorage.getItem('user');
          
          if (token && userStr) {
            const user = JSON.parse(userStr);
            set({ 
              user, 
              isAuthenticated: true,
              isLoading: false 
            });
          } else {
            set({ 
              user: null, 
              isAuthenticated: false,
              isLoading: false 
            });
          }
        } catch (error) {
          console.error('Error initializing auth:', error);
          // Clear corrupted data
          apiService.clearAuthToken();
          set({ 
            user: null, 
            isAuthenticated: false,
            isLoading: false 
          });
        }
      },

      clearError: () => {
        // This can be used for clearing any future error states
        console.log('Clear error called');
      },
    }),
    {
      name: 'auth-store',
      partialize: (state: AuthState) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export { useAuthStore };
export default useAuthStore; 