import type { InterestGroup } from '../../types/profile';
import { toApiRequestError } from './apiError';
import { API_ROUTES, authHeader, httpClient } from './httpClient';

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
