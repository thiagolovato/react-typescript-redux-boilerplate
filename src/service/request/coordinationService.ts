import type { PageResponse } from '../../types/api';
import type { MenteeCandidates, UnmatchedMentee } from '../../types/coordination';
import type { CoordinatorMentorship } from '../../types/mentorship';
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

  /** Pairs of the cohort open today, newest first, declined ones included. Coordinators only. */
  getMentorships: async (): Promise<CoordinatorMentorship[]> => {
    try {
      return await httpClient.get<CoordinatorMentorship[]>(`${API_ROUTES.core}/coordination/mentorships`, authHeader());
    } catch (error) {
      throw toApiRequestError(error);
    }
  },

  /**
   * Proposes the mentors to the mentee in the cohort open today, one option each. The mentee chooses one first, then
   * that mentor answers. Coordinators only.
   */
  propose: async (menteeUserId: number, mentorUserIds: number[]): Promise<CoordinatorMentorship[]> => {
    try {
      return await httpClient.post<CoordinatorMentorship[]>(
          `${API_ROUTES.core}/coordination/mentorships`,
          { menteeUserId, mentorUserIds },
          authHeader(),
      );
    } catch (error) {
      throw toApiRequestError(error);
    }
  },

  /** Withdraws a proposal not yet accepted by both, all its options while the mentee is choosing. Coordinators only. */
  withdraw: async (id: number): Promise<CoordinatorMentorship[]> => {
    try {
      return await httpClient.delete<CoordinatorMentorship[]>(`${API_ROUTES.core}/coordination/mentorships/${id}`, authHeader());
    } catch (error) {
      throw toApiRequestError(error);
    }
  },
};
