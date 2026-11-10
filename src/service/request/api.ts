import axios from 'axios';
import axiosRetry from 'axios-retry';
import { RegisterRequest, RegisterResponse } from '../../types/auth/register';
import { toApiRequestError } from './apiError';
import type { InterestGroup, Profile, ProfileRequest } from '../../types/profile';

// Set per environment: .env.development for `npm run dev`, a build arg for the Docker image.
const GATEWAY_BASE_URL = import.meta.env.VITE_API_URL;
if (!GATEWAY_BASE_URL) {
  throw new Error('VITE_API_URL is not set. Add it to .env.development or pass it to the build.');
}

const API_ROUTES = {
  auth: '/auth',
  core: '/mmc',
} as const;

axios.defaults.baseURL = GATEWAY_BASE_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Only idempotent requests (GET, PUT, DELETE...) are retried, on network errors, 429 and 5xx.
// Retrying a POST could register a user twice or count one login as several attempts.
axiosRetry(axios, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: axiosRetry.isIdempotentRequestError,
});

const authAxios = axios.create({
  baseURL: GATEWAY_BASE_URL,
  timeout: 10000,
});

axiosRetry(authAxios, {
  retries: 5,
  retryDelay: (retryCount) => retryCount * 500,
  retryCondition: axiosRetry.isIdempotentRequestError,
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
