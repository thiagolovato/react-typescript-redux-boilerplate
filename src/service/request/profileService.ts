import axios from 'axios';
import type { Profile, ProfileRequest } from '../../types/profile';
import { toApiRequestError } from './apiError';
import { API_ROUTES, authHeader, httpClient } from './httpClient';

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
