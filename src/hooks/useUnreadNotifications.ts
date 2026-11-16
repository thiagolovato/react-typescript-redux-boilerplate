import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { notificationService } from '../service/request';

// New notices show up without a reload. A count every minute is cheap for the server and fast enough here.
const POLL_INTERVAL_MS = 60_000;
/** Fired by the notifications page after marking notices read, so the badge updates at once. */
export const NOTIFICATIONS_CHANGED_EVENT = 'mentormentee:notifications-changed';

export const announceNotificationsChanged = () => window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT));

/**
 * Unread notices of the signed-in person. Checked on each page change, every minute while the tab is visible, when the
 * tab comes back into view and when the page marks some read. A hidden tab asks nothing: nobody sees the badge.
 */
export function useUnreadNotifications(): number {
  const [count, setCount] = useState(0);
  const { pathname } = useLocation();

  useEffect(() => {
    let current = true;
    const load = () => {
      notificationService.getUnreadCount()
          .then((found) => current && setCount(found))
          // The badge is a hint: a failed check keeps the last count instead of an error on every page.
          .catch(() => undefined);
    };
    const loadIfVisible = () => {
      if (document.visibilityState === 'visible') load();
    };
    load();
    const timer = window.setInterval(loadIfVisible, POLL_INTERVAL_MS);
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, load);
    document.addEventListener('visibilitychange', loadIfVisible);
    return () => {
      current = false;
      window.clearInterval(timer);
      window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, load);
      document.removeEventListener('visibilitychange', loadIfVisible);
    };
  }, [pathname]);

  return count;
}
