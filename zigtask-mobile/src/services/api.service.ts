import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';
import { ApiResponse, ApiError } from '../types/api.types';

// Replace with your actual API URL
const API_BASE_URL = 'http://192.168.68.55:8000'; // For development - computer's IP
// const API_BASE_URL = 'https://your-api-domain.com'; // For production

const TOKEN_KEY = 'zigtask_token';

class ApiService {
  private client: AxiosInstance;
  private readonly baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor for auth token
    this.client.interceptors.request.use(
      async (config) => {
        try {
          const token = await SecureStore.getItemAsync(TOKEN_KEY);
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error('Error retrieving token:', error);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError<ApiError>) => {
        this.handleApiError(error);
        return Promise.reject(error);
      }
    );
  }

  private handleApiError(error: AxiosError<ApiError>): void {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          this.handleUnauthorized();
          break;
        case 403:
          Alert.alert('Error', 'Access denied');
          break;
        case 404:
          Alert.alert('Error', 'Resource not found');
          break;
        case 409:
          Alert.alert('Error', data?.message || 'Conflict occurred');
          break;
        case 422:
          Alert.alert('Error', 'Validation failed');
          break;
        case 500:
          Alert.alert('Error', 'Internal server error');
          break;
        default:
          Alert.alert('Error', data?.message || 'An unexpected error occurred');
      }
    } else if (error.request) {
      Alert.alert('Network Error', 'Please check your internet connection');
    } else {
      Alert.alert('Error', 'Request failed');
    }
  }

  private async handleUnauthorized(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync('zigtask_user');
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
    
    Alert.alert(
      'Session Expired', 
      'Please sign in again.',
      [{ text: 'OK' }]
    );
  }

  // Generic HTTP methods
  async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    const response = await this.client.get<T>(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  async patch<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.patch<T>(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }

  // Utility methods
  getBaseURL(): string {
    return this.baseURL;
  }

  async setAuthToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch (error) {
      console.error('Error storing token:', error);
      throw error;
    }
  }

  async clearAuthToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync('zigtask_user');
    } catch (error) {
      console.error('Error clearing auth tokens:', error);
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService; 