import { apiService } from './api.service';
import { SignUpData, SignInData, AuthResponse } from '../types/api.types';

class AuthService {
  async signUp(data: SignUpData): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>('/auth/signup', data);
      return response;
    } catch (error) {
      console.error('Auth service - signup error:', error);
      throw error;
    }
  }

  async signIn(data: SignInData): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>('/auth/signin', data);
      return response;
    } catch (error) {
      console.error('Auth service - signin error:', error);
      throw error;
    }
  }

  async refreshToken(): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>('/auth/refresh');
      return response;
    } catch (error) {
      console.error('Auth service - refresh token error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await apiService.post('/auth/logout');
    } catch (error) {
      console.error('Auth service - logout error:', error);
      // Don't throw error for logout as we want to clear local data anyway
    } finally {
      apiService.clearAuthToken();
    }
  }
}

export const authService = new AuthService();
export default authService; 