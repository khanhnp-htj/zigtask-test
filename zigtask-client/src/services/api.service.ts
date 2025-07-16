import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { ApiResponse, ApiError } from '../types/api.types';

class ApiService {
  private client: AxiosInstance;
  private readonly baseURL: string;

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    
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
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
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
          toast.error('Access denied');
          break;
        case 404:
          toast.error('Resource not found');
          break;
        case 409:
          toast.error(data?.message || 'Conflict occurred');
          break;
        case 422:
          toast.error('Validation failed');
          break;
        case 500:
          toast.error('Internal server error');
          break;
        default:
          toast.error(data?.message || 'An unexpected error occurred');
      }
    } else if (error.request) {
      toast.error('Network error - please check your connection');
    } else {
      toast.error('Request failed');
    }
  }

  private handleUnauthorized(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.error('Session expired. Please sign in again.');
    window.location.href = '/signin';
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

  setAuthToken(token: string): void {
    localStorage.setItem('token', token);
  }

  clearAuthToken(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService; 