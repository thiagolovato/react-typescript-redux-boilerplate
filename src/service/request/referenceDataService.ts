import type { InterestGroup } from '../../types/profile';
import { toApiRequestError } from './apiError';
import { API_ROUTES, authHeader, httpClient } from './httpClient';

export const referenceDataService = {
  /** Interest groups and their areas, named in a core language code (`pt_BR`), English where a name is missing. */
  getInterestGroups: async (language: string): Promise<InterestGroup[]> => {
    try {
      return await httpClient.get<InterestGroup[]>(
          `${API_ROUTES.core}/interest-groups?${new URLSearchParams({ language })}`,
          authHeader(),
      );
    } catch (error) {
      throw toApiRequestError(error);
    }
  },
};
