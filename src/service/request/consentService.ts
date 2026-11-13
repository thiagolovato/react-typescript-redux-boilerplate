import type { ConsentDocument } from '../../types/consent';
import { toApiRequestError } from './apiError';
import { API_ROUTES, httpClient } from './httpClient';

export const consentService = {
  /** Terms and research consent in force, in a core language code (`pt_BR`). Public: no token needed. */
  getCurrent: async (language: string): Promise<ConsentDocument[]> => {
    try {
      return await httpClient.get<ConsentDocument[]>(
          `${API_ROUTES.core}/consents/current?${new URLSearchParams({ language })}`,
      );
    } catch (error) {
      throw toApiRequestError(error);
    }
  },
};
