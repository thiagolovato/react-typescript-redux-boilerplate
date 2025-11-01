import axios from 'axios';
import { RegisterRequest, RegisterResponse } from '../../types/auth/register';
import type { Profile } from '../../types/profile';
import { httpClient } from './httpClient';

// Gateway Configuration
const GATEWAY_BASE_URL = 'http://localhost:8765';

// Route-specific configurations
const API_ROUTES = {
  auth: '/auth', // Maps to mentor-mentee-auth service
  core: '/mmc', // Maps to mentor-mentee-core service
} as const;

// Configure axios defaults
axios.defaults.baseURL = GATEWAY_BASE_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// API Error types
interface ApiErrorResponse {
  message?: string;
  data?: string;
}

interface ApiError {
  response?: {
    data?: ApiErrorResponse | string;
  };
}

// Generic HTTP methods
export const httpClient = {
  get: async <T>(path: string, config?: { headers?: Record<string, string> }) => {
    try {
      const response = await axios.get<T>(path, config);
      return response.data;
    } catch (error) {
      console.error('API GET Error:', error);
      throw error;
    }
  },

  post: async <T>(path: string, data?: object | string, config?: { headers?: Record<string, string> }) => {
    try {
      const response = await axios.post<T>(path, data, config);
      console.log('API POST Response:', response);
      return response.data;
    } catch (error) {
      console.error('API POST Error:', error);
      throw error;
    }
  },

  put: async <T>(path: string, data: object | string, config?: { headers?: Record<string, string> }) => {
    try {
      const response = await axios.put<T>(path, data, config);
      return response.data;
    } catch (error) {
      console.error('API PUT Error:', error);
      throw error;
    }
  },

  delete: async <T>(path: string, config?: { headers?: Record<string, string> }) => {
    try {
      const response = await axios.delete<T>(path, config);
      return response.data;
    } catch (error) {
      console.error('API DELETE Error:', error);
      throw error;
    }
  },
};

// Auth Service - Routes through /auth/** gateway
export const authService = {
  // Register new user
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    try {
      const response = await httpClient.post<RegisterResponse>(
          `${API_ROUTES.auth}/users/register`,
          data,
      );
      return response;
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.response?.data) {
        const errorData = apiError.response.data;
        const errorMessage = typeof errorData === 'string' ? errorData : errorData.message;
        throw new Error(errorMessage || 'Erro ao criar conta');
      }
      throw new Error('Erro ao criar conta. Tente novamente.');
    }
  },

  // Login user
  login: async (email: string, password: string): Promise<RegisterResponse> => {
    try {
      const response = await httpClient.post<RegisterResponse>(
          `${API_ROUTES.auth}/users/login`,
          { email, password },
      );
      return response;
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.response?.data) {
        const errorData = apiError.response.data;
        const errorMessage = typeof errorData === 'string' ? errorData : errorData.message;
        throw new Error(errorMessage || 'Erro ao fazer login');
      }
      throw new Error('Erro ao fazer login. Verifique suas credenciais.');
    }
  },

  // Validate token
  authenticate: async (token: string): Promise<unknown> => {
    try {
      const response = await httpClient.get(
          `${API_ROUTES.auth}/users/authenticate`,
          { headers: { Authorization: `Bearer ${token}` } },
      );
      return response;
    } catch (error) {
      throw new Error('Token inválido');
    }
  },

  // Refresh token (future implementation)
  refreshToken: async (refreshToken: string): Promise<RegisterResponse> => {
    try {
      const response = await httpClient.post<RegisterResponse>(
          `${API_ROUTES.auth}/users/refresh`,
          { refreshToken },
      );
      return response;
    } catch (error) {
      throw new Error('Erro ao renovar token');
    }
  },

  // Logout
  logout: async (token: string): Promise<void> => {
    try {
      await httpClient.post(
          `${API_ROUTES.auth}/users/logout`,
          {},
          { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch (error) {
      console.warn('Erro ao fazer logout no servidor:', error);
      // Continue with local logout even if server logout fails
    }
  },
};

// Core Service - Routes through /mmc/** gateway (for future use)
export const coreService = {
  // User profile management
  getProfile: async (userId: string): Promise<unknown> => {
    try {
      const token = tokenUtils.get();
      const response = await httpClient.get(
          `${API_ROUTES.core}/users/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } },
      );
      return response;
    } catch (error) {
      throw new Error('Erro ao buscar perfil do usuário');
    }
  },

  updateProfile: async (userId: string, profileData: Record<string, unknown>): Promise<unknown> => {
    try {
      const token = tokenUtils.get();
      const response = await httpClient.put(
          `${API_ROUTES.core}/users/${userId}`,
          profileData,
          { headers: { Authorization: `Bearer ${token}` } },
      );
      return response;
    } catch (error) {
      throw new Error('Erro ao atualizar perfil');
    }
  },

  // Mentorship management
  findMentors: async (filters?: Record<string, string>): Promise<unknown> => {
    try {
      const token = tokenUtils.get();
      const queryParams = filters ? `?${new URLSearchParams(filters)}` : '';
      const response = await httpClient.get(
          `${API_ROUTES.core}/mentors${queryParams}`,
          { headers: { Authorization: `Bearer ${token}` } },
      );
      return response;
    } catch (error) {
      throw new Error('Erro ao buscar mentores');
    }
  },

  findMentees: async (filters?: Record<string, string>): Promise<unknown> => {
    try {
      const token = tokenUtils.get();
      const queryParams = filters ? `?${new URLSearchParams(filters)}` : '';
      const response = await httpClient.get(
          `${API_ROUTES.core}/mentees${queryParams}`,
          { headers: { Authorization: `Bearer ${token}` } },
      );
      return response;
    } catch (error) {
      throw new Error('Erro ao buscar mentees');
    }
  },

  // Mentorship sessions
  getMentorshipSessions: async (): Promise<unknown> => {
    try {
      const token = tokenUtils.get();
      const response = await httpClient.get(
          `${API_ROUTES.core}/sessions`,
          { headers: { Authorization: `Bearer ${token}` } },
      );
      return response;
    } catch (error) {
      throw new Error('Erro ao buscar sessões de mentoria');
    }
  },

  createMentorshipSession: async (sessionData: Record<string, unknown>): Promise<unknown> => {
    try {
      const token = tokenUtils.get();
      const response = await httpClient.post(
          `${API_ROUTES.core}/sessions`,
          sessionData,
          { headers: { Authorization: `Bearer ${token}` } },
      );
      return response;
    } catch (error) {
      throw new Error('Erro ao criar sessão de mentoria');
    }
  },
};

// Token management utilities
export const tokenUtils = {
  save: (token: string) => {
    localStorage.setItem('authToken', token);
  },

  get: (): string | null => {
    return localStorage.getItem('authToken');
  },

  remove: () => {
    localStorage.removeItem('authToken');
  },

  isValid: (): boolean => {
    const token = tokenUtils.get();
    return !!token;
  },

  // Decode JWT token to get user info (without verification)
  decode: (token?: string): unknown | null => {
    try {
      const tokenToUse = token || tokenUtils.get();
      if (!tokenToUse) return null;

      const base64Url = tokenToUse.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
          window.atob(base64)
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join(''),
      );

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  },


};

// Legacy exports for backward compatibility
export const authApi = authService;
export const post = httpClient.post;
export const get = httpClient.get;

export const profileService = {
  save: async (profile: Profile): Promise<Profile> => {
    try {
      const token = tokenUtils.get();
      const response = await httpClient.post<Profile>(
          `${API_ROUTES.core}/customers`,
          profile,
          { headers: { Authorization: `Bearer ${token}` } },
      );
      return response;
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.response?.data) {
        const errorData = apiError.response.data;
        const errorMessage = typeof errorData === 'string' ? errorData : errorData.message;
        throw new Error(errorMessage || 'Erro ao salvar perfil');
      }
      throw new Error('Erro ao salvar perfil. Tente novamente.');
    }
  },
  get: async (userId: number): Promise<Profile> => {
    try {
      const token = tokenUtils.get();
      const response = await httpClient.get<Profile>(
          `${API_ROUTES.core}/customers/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } },
      );
      return response;
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.response?.data) {
        const errorData = apiError.response.data;
        const errorMessage = typeof errorData === 'string' ? errorData : errorData.message;
        throw new Error(errorMessage || 'Erro ao buscar perfil');
      }
      throw new Error('Erro ao buscar perfil. Tente novamente.');
    }
  },
};
