import { RegisterRequest, RegisterResponse } from '../../types/auth/register';
import { toApiRequestError } from './apiError';
import { API_ROUTES, authAxios } from './httpClient';

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

  /** Coordinators must use the coordinator login, and mentors and mentees the normal one. The server refuses the other. */
  login: async (email: string, password: string, coordinator = false): Promise<RegisterResponse> => {
    try {
      const response = await authAxios.post<RegisterResponse>(
          `${API_ROUTES.auth}/users/${coordinator ? 'coordinator/' : ''}login`,
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
