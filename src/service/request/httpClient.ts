import axios from 'axios';
import axiosRetry from 'axios-retry';
import { tokenUtils } from './tokenUtils';

// Set per environment: .env.development for `npm run dev`, a build arg for the Docker image.
const GATEWAY_BASE_URL = import.meta.env.VITE_API_URL;
if (!GATEWAY_BASE_URL) {
  throw new Error('VITE_API_URL is not set. Add it to .env.development or pass it to the build.');
}

const HTTP_UNAUTHORIZED = 401;

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

/** Problem code of a 401, such as `auth.token.expired`, when the server sent one. */
type SessionRejectedHandler = (code: string | undefined) => void;
let sessionRejectedHandler: SessionRejectedHandler | null = null;

/**
 * Called when a request that carried the session token answers 401: the token expired, was tampered with, or the
 * account is gone, so the session is over. Requests without a token (login, sign-up) never trigger it: their 401
 * means wrong credentials. AuthLayout registers the handler for the pages that need a session.
 *
 * The handler runs once: several requests in flight can fail together (a page and the unread count), and the session
 * ends only once. AuthLayout registers it again after the next login.
 */
export const onSessionRejected = (handler: SessionRejectedHandler | null) => {
  sessionRejectedHandler = handler;
};

axios.interceptors.response.use(undefined, (error: unknown) => {
  if (axios.isAxiosError(error) && error.response?.status === HTTP_UNAUTHORIZED
    && error.config?.headers?.has('Authorization')) {
    const data: unknown = error.response.data;
    const code = typeof data === 'object' && data !== null && 'code' in data ? String(data.code) : undefined;
    const handler = sessionRejectedHandler;
    sessionRejectedHandler = null;
    handler?.(code);
  }
  return Promise.reject(error);
});

export const authHeader = () => ({ headers: { Authorization: `Bearer ${tokenUtils.get()}` } });
