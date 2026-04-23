import api from './api';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import type { LoginCredentials, LoginResponse } from '@/types/auth';

export const authService = {
  /**
   * Login user with email and password
   */
  login: async (credentials: LoginCredentials, userType?: string): Promise<LoginResponse> => {
    let endpoint: string;
    if (userType === 'courier_staff') {
      endpoint = API_ENDPOINTS.ACCOUNTS.AUTH.COURIER_LOGIN;
    } else if (userType === 'admin') {
      endpoint = API_ENDPOINTS.ACCOUNTS.AUTH.ADMIN_LOGIN;
    } else {
      throw new Error("Invalid or missing user role for login. Only courier and admin are supported on this portal.");
    }

    const response = await api.post<LoginResponse>(
      endpoint,
      credentials
    );

    return response.data;
  },

  /**
   * Refresh access token using refresh token
   */
  refreshToken: async (refreshToken: string): Promise<{ access: string; refresh?: string }> => {
    const response = await api.post('/token/refresh/', {
      refresh: refreshToken,
    });
    return response.data;
  },

  /**
   * Logout user and clear tokens
   */
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  /**
   * Get current user from local storage
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Get access token
   */
  getAccessToken: () => {
    return localStorage.getItem('access_token');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },
};

export default authService;
