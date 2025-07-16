import axios, { AxiosInstance, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';

// Replace with your actual API URL
const API_BASE_URL = 'http://192.168.68.55:8000'; // For development - computer's IP
// const API_BASE_URL = 'https://your-api-domain.com'; // For production

const TOKEN_KEY = 'zigtask_token';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add JWT token
    this.client.interceptors.request.use(
      async (config) => {
        try {
          const token = await SecureStore.getItemAsync(TOKEN_KEY);
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error('Error getting token from secure store:', error);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token expiration
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid, clear stored auth data
          try {
            await Promise.all([
              SecureStore.deleteItemAsync(TOKEN_KEY),
              SecureStore.deleteItemAsync('zigtask_user'),
            ]);
          } catch (clearError) {
            console.error('Error clearing auth data:', clearError);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Public methods
  async get<T>(url: string, config = {}): Promise<T> {
    const response = await this.client.get(url, config);
    return response.data;
  }

  async post<T>(url: string, data = {}, config = {}): Promise<T> {
    const response = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data = {}, config = {}): Promise<T> {
    const response = await this.client.put(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data = {}, config = {}): Promise<T> {
    const response = await this.client.patch(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config = {}): Promise<T> {
    const response = await this.client.delete(url, config);
    return response.data;
  }

  // Get the underlying axios instance if needed
  getInstance(): AxiosInstance {
    return this.client;
  }
}

export const apiClient = new ApiClient();
export default apiClient; 