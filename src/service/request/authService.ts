import { RegisterRequest, RegisterResponse, SignUpType } from '../../types/auth/register';
import { toApiRequestError } from './apiError';
import { API_ROUTES, authAxios, authHeader } from './httpClient';

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

  /** Adds the other participant role to the signed-in account. Answers a token active in the new role. */
  addRole: async (role: SignUpType): Promise<RegisterResponse> => {
    try {
      const response = await authAxios.post<RegisterResponse>(`${API_ROUTES.auth}/users/roles`, { role }, authHeader());
      return response.data;
    } catch (error) {
      throw toApiRequestError(error);
    }
  },

  /** A token active in another role of the signed-in account. */
  switchRole: async (role: SignUpType): Promise<RegisterResponse> => {
    try {
      const response = await authAxios.post<RegisterResponse>(
          `${API_ROUTES.auth}/users/role-switch`,
          { role },
          authHeader(),
      );
      return response.data;
    } catch (error) {
      throw toApiRequestError(error);
    }
  },

  /** Who the token belongs to: its active role and every role of the account, read from the server. */
  authenticate: async (token: string): Promise<RegisterResponse> => {
    try {
      const response = await authAxios.get<RegisterResponse>(
          `${API_ROUTES.auth}/users/authenticate`,
          { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data;
    } catch (error) {
      throw toApiRequestError(error);
    }
  },
};
