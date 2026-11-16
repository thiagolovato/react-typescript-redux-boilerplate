import type { PageResponse } from '../../types/api';
import type { Cohort, CohortRequest, MenteeCandidates, UnmatchedMentee } from '../../types/coordination';
import type { CoordinatorMentorship } from '../../types/mentorship';
import { PAGE_SIZE } from '../../constants/pagination';
import { toApiRequestError } from './apiError';
import { API_ROUTES, authHeader, httpClient } from './httpClient';

const COHORTS = `${API_ROUTES.core}/coordination/cohorts`;

export const coordinationService = {
  /** Every cohort. Coordinators only. */
  getCohorts: async (): Promise<Cohort[]> => {
    try {
      return await httpClient.get<Cohort[]>(COHORTS, authHeader());
    } catch (error) {
      throw toApiRequestError(error);
    }
  },

  /** Creates a cohort; its dates must not overlap another one. Coordinators only. */
  createCohort: async (cohort: CohortRequest): Promise<Cohort> => {
    try {
      return await httpClient.post<Cohort>(COHORTS, cohort, authHeader());
    } catch (error) {
      throw toApiRequestError(error);
    }
  },

  /** Edits a cohort. Limits below the pairs it already has are refused. Coordinators only. */
  updateCohort: async (id: number, cohort: CohortRequest): Promise<Cohort> => {
    try {
      return await httpClient.put<Cohort>(`${COHORTS}/${id}`, cohort, authHeader());
    } catch (error) {
      throw toApiRequestError(error);
    }
  },

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
