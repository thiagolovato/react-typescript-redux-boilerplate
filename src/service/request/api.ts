import axios, { AxiosError } from 'axios';
import axiosRetry from 'axios-retry';
import { RegisterRequest, RegisterResponse } from '../../types/auth/register';
import { toApiRequestError } from './apiError';
import type { InterestGroup, Profile, ProfileRequest } from '../../types/profile';

const GATEWAY_BASE_URL = 'http://localhost:8765';

const API_ROUTES = {
  auth: '/auth',
  core: '/mmc',
} as const;

axios.defaults.baseURL = GATEWAY_BASE_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

axiosRetry(axios, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error: AxiosError) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
           error.response?.status === 503 ||
           error.response?.status === 502 ||
           error.response?.status === 504;
  },
  onRetry: (retryCount, _error, requestConfig) => {
    console.log(`Retry attempt ${retryCount} for ${requestConfig.url}`);
  },
});

const authAxios = axios.create({
  baseURL: GATEWAY_BASE_URL,
  timeout: 10000,
});

axiosRetry(authAxios, {
  retries: 5,
  retryDelay: (retryCount) => {
    return retryCount * 500;
  },
  retryCondition: (error: AxiosError) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
           error.response?.status === 503 ||
           error.response?.status === 502 ||
           error.response?.status === 504 ||
           error.response?.status === 500;
  },
  onRetry: (retryCount, _error, requestConfig) => {
    console.log(`Auth retry attempt ${retryCount} for ${requestConfig.url}`);
  },
});

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
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    try {
      const response = await authAxios.post<RegisterResponse>(
          `${API_ROUTES.auth}/users/register`,
          data,
      );
      return response.data;
    } catch (error) {
      throw toApiRequestError(error);
    }
  },

  login: async (email: string, password: string): Promise<RegisterResponse> => {
    try {
      const response = await authAxios.post<RegisterResponse>(
          `${API_ROUTES.auth}/users/login`,
          { email, password },
      );
      return response.data;
    } catch (error) {
      throw toApiRequestError(error);
    }
  },

  authenticate: async (token: string): Promise<unknown> => {
    try {
      const response = await authAxios.get(
          `${API_ROUTES.auth}/users/authenticate`,
          { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data;
    } catch (error) {
      throw toApiRequestError(error);
    }
  },

  refreshToken: async (refreshToken: string): Promise<RegisterResponse> => {
    try {
      const response = await authAxios.post<RegisterResponse>(
          `${API_ROUTES.auth}/users/refresh`,
          { refreshToken },
      );
      return response.data;
    } catch (error) {
      throw toApiRequestError(error);
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
      throw toApiRequestError(error);
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
      throw toApiRequestError(error);
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
      throw toApiRequestError(error);
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
      throw toApiRequestError(error);
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
      throw toApiRequestError(error);
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
      throw toApiRequestError(error);
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

const authHeader = () => ({ headers: { Authorization: `Bearer ${tokenUtils.get()}` } });

export const profileService = {
  /** The caller's own profile, or null when they have not created one yet. */
  getMine: async (): Promise<Profile | null> => {
    try {
      return await httpClient.get<Profile>(`${API_ROUTES.core}/customers/me`, authHeader());
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) return null;
      throw toApiRequestError(error);
    }
  },
  create: async (profile: ProfileRequest): Promise<Profile> => {
    try {
      return await httpClient.post<Profile>(`${API_ROUTES.core}/customers`, profile, authHeader());
    } catch (error) {
      throw toApiRequestError(error);
    }
  },
  update: async (profile: ProfileRequest): Promise<Profile> => {
    try {
      return await httpClient.put<Profile>(`${API_ROUTES.core}/customers/me`, profile, authHeader());
    } catch (error) {
      throw toApiRequestError(error);
    }
  },
};

export const referenceDataService = {
  /** Interest groups and their areas, for the profile form. */
  getInterestGroups: async (): Promise<InterestGroup[]> => {
    try {
      return await httpClient.get<InterestGroup[]>(`${API_ROUTES.core}/interest-groups`, authHeader());
    } catch (error) {
      throw toApiRequestError(error);
    }
  },
};
