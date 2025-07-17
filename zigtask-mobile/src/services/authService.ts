import { apiService } from './api.service';
import { AuthResponse, LoginDto, RegisterDto } from '../types/api.types';

class AuthService {
  async login(credentials: LoginDto): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>('/auth/signin', credentials);
      return response;
    } catch (error) {
      console.error('Auth service - login error:', error);
      throw error;
    }
  }

  async register(data: RegisterDto): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>('/auth/signup', data);
      return response;
    } catch (error) {
      console.error('Auth service - register error:', error);
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
      await apiService.clearAuthToken();
    } catch (error) {
      console.error('Auth service - logout error:', error);
      // Ensure tokens are cleared even if there's an error
      await apiService.clearAuthToken();
    }
  }
}

export const authService = new AuthService();
export default authService; 