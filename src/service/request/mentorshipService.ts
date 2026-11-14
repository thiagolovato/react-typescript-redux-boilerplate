import type { Mentorship } from '../../types/mentorship';
import { toApiRequestError } from './apiError';
import { API_ROUTES, authHeader, httpClient } from './httpClient';

const MENTORSHIPS = `${API_ROUTES.core}/mentorships`;

/** A mentor's or mentee's own pairs. */
export const mentorshipService = {
  /** Pairs the caller may see: the mentee's open one; the mentor's once each mentee accepted. Newest first. */
  getMine: async (): Promise<Mentorship[]> => {
    try {
      return await httpClient.get<Mentorship[]>(`${MENTORSHIPS}/mine`, authHeader());
    } catch (error) {
      throw toApiRequestError(error);
    }
  },

  accept: async (id: number): Promise<Mentorship> => {
    try {
      return await httpClient.post<Mentorship>(`${MENTORSHIPS}/${id}/accept`, undefined, authHeader());
    } catch (error) {
      throw toApiRequestError(error);
    }
  },

  /** `reason` is optional; only the coordinator sees it. */
  decline: async (id: number, reason: string): Promise<Mentorship> => {
    try {
      return await httpClient.post<Mentorship>(`${MENTORSHIPS}/${id}/decline`, { reason }, authHeader());
    } catch (error) {
      throw toApiRequestError(error);
    }
  },
};
