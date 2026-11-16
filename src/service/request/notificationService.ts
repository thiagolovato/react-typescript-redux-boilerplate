import type { PageResponse } from '../../types/api';
import type { AppNotification, UnreadCount } from '../../types/notification';
import { toApiRequestError } from './apiError';
import { API_ROUTES, authHeader, httpClient } from './httpClient';

const NOTIFICATIONS = `${API_ROUTES.core}/notifications`;

/** The caller's in-app notices. Coordinators share one inbox. */
export const notificationService = {
  /** One page, newest first. */
  getMine: async (page: number): Promise<PageResponse<AppNotification>> => {
    try {
      const query = new URLSearchParams({ page: String(page) });
      return await httpClient.get<PageResponse<AppNotification>>(`${NOTIFICATIONS}?${query}`, authHeader());
    } catch (error) {
      throw toApiRequestError(error);
    }
  },

  getUnreadCount: async (): Promise<number> => {
    try {
      return (await httpClient.get<UnreadCount>(`${NOTIFICATIONS}/unread-count`, authHeader())).count;
    } catch (error) {
      throw toApiRequestError(error);
    }
  },

  markRead: async (id: number): Promise<AppNotification> => {
    try {
      return await httpClient.post<AppNotification>(`${NOTIFICATIONS}/${id}/read`, undefined, authHeader());
    } catch (error) {
      throw toApiRequestError(error);
    }
  },

  markAllRead: async (): Promise<void> => {
    try {
      await httpClient.post<void>(`${NOTIFICATIONS}/read-all`, undefined, authHeader());
    } catch (error) {
      throw toApiRequestError(error);
    }
  },
};
