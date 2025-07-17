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
      // For JWT-based auth, logout is handled client-side by clearing tokens
      // No need to call server endpoint since JWT tokens are stateless
      apiService.clearAuthToken();
    } catch (error) {
      console.error('Auth service - logout error:', error);
      // Ensure tokens are cleared even if there's an error
      apiService.clearAuthToken();
    }
  }
}

export const authService = new AuthService();
export default authService; 