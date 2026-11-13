import axios from 'axios';
import axiosRetry from 'axios-retry';
import { tokenUtils } from './tokenUtils';

// Set per environment: .env.development for `npm run dev`, a build arg for the Docker image.
const GATEWAY_BASE_URL = import.meta.env.VITE_API_URL;
if (!GATEWAY_BASE_URL) {
  throw new Error('VITE_API_URL is not set. Add it to .env.development or pass it to the build.');
}

export const API_ROUTES = {
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

export const authAxios = axios.create({
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

export const authHeader = () => ({ headers: { Authorization: `Bearer ${tokenUtils.get()}` } });
