import type { PageResponse } from '../../types/api';
import type { MenteeCandidates, UnmatchedMentee } from '../../types/coordination';
import { PAGE_SIZE } from '../../constants/pagination';
import { toApiRequestError } from './apiError';
import { API_ROUTES, authHeader, httpClient } from './httpClient';

export const coordinationService = {
  /** One page of the mentees without a mentor, longest waiting first. Coordinators only. */
  getUnmatchedMentees: async (page: number, size = PAGE_SIZE): Promise<PageResponse<UnmatchedMentee>> => {
    try {
      const query = new URLSearchParams({ page: String(page), size: String(size) });
      return await httpClient.get<PageResponse<UnmatchedMentee>>(
          `${API_ROUTES.core}/coordination/mentees/unmatched?${query}`,
          authHeader(),
      );
    } catch (error) {
      throw toApiRequestError(error);
    }
  },

  /** The mentee's full profile and the mentors who may pair with them, best first. Coordinators only. */
  getMenteeCandidates: async (userId: number): Promise<MenteeCandidates> => {
    try {
      return await httpClient.get<MenteeCandidates>(
          `${API_ROUTES.core}/coordination/mentees/${userId}/candidates`,
          authHeader(),
      );
    } catch (error) {
      throw toApiRequestError(error);
    }
  },
};
