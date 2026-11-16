import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import { ApiErrorAlert, BellIcon, Button } from '../ui';
import { useI18n } from '../../hooks/useI18n';
import { useInfiniteList } from '../../hooks/useInfiniteList';
import { announceNotificationsChanged } from '../../hooks/useUnreadNotifications';
import { useAppSelector } from '../../redux/hooks';
import { notificationService } from '../../service/request';
import { toApiError } from '../../service/request/apiError';
import { APP_ROUTES } from '../../constants/routes';
import type { ApiError } from '../../types/api';
import type { AppNotification } from '../../types/notification';

/** The caller's notices, newest first. Opening one marks it read and goes to the page it is about. */
export function Notifications() {
  const { t, currentLanguage } = useI18n();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const isCoordinator = user?.customerType === 'COORDINATOR';
  const fetchPage = useCallback((page: number) => notificationService.getMine(page), []);
  const { items, totalItems, hasNext, loading, error, loadMore, refresh, sentinelRef } = useInfiniteList(fetchPage);
  const [actionError, setActionError] = useState<ApiError | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const formatDate = new Intl.DateTimeFormat(currentLanguage, { dateStyle: 'medium', timeStyle: 'short' });

  const open = async (notification: AppNotification) => {
    setActionError(null);
    try {
      if (!notification.read) {
        await notificationService.markRead(notification.id);
        announceNotificationsChanged();
      }
      navigate(isCoordinator ? APP_ROUTES.coordination : APP_ROUTES.mentorship);
    } catch (err) {
      setActionError(toApiError(err));
    }
  };

  const markAllRead = async () => {
    setActionError(null);
    setMarkingAll(true);
    try {
      await notificationService.markAllRead();
      announceNotificationsChanged();
      refresh();
    } catch (err) {
      setActionError(toApiError(err));
    } finally {
      setMarkingAll(false);
    }
  };

  const hasUnread = items.some((notification) => !notification.read);

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">{t('notifications.title')}</h1>
        <Button variant="secondary" size="sm" onClick={markAllRead} isLoading={markingAll} disabled={!hasUnread}>
          {t('notifications.markAllRead')}
        </Button>
      </header>

      {actionError && <ApiErrorAlert error={actionError} fallback={t('notifications.errors.action')} />}

      {totalItems === 0 && (
        <p className="flex items-center gap-3 rounded-lg border border-neutral-200 p-6 text-neutral-600">
          <BellIcon />
          {t('notifications.empty')}
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {items.map((notification) => (
          <li key={notification.id}>
            <button
              type="button"
              onClick={() => void open(notification)}
              className={`flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left transition-colors
                hover:bg-neutral-100 ${notification.read
                  ? 'border-neutral-200 text-neutral-600'
                  : 'border-primary-200 bg-primary-50 text-neutral-900'}`}
            >
              <span
                aria-hidden="true"
                className={`mt-2 size-2 shrink-0 rounded-full ${notification.read ? 'bg-transparent' : 'bg-primary-600'}`}
              />
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className={notification.read ? '' : 'font-medium'}>
                  {t(`notifications.types.${notification.type}`)}
                </span>
                <time dateTime={notification.createdAt} className="text-sm text-neutral-500">
                  {formatDate.format(new Date(notification.createdAt))}
                </time>
              </span>
              {!notification.read && <span className="sr-only">{t('notifications.unread')}</span>}
            </button>
          </li>
        ))}
      </ul>

      {error && (
        <div className="flex flex-col gap-3">
          <ApiErrorAlert error={error} fallback={t('notifications.errors.load')} />
          <Button variant="secondary" size="sm" onClick={() => void loadMore()}>{t('notifications.retry')}</Button>
        </div>
      )}
      {loading && <p className="text-sm text-neutral-500">{t('common.loading')}</p>}
      {hasNext && <div ref={sentinelRef} aria-hidden="true" />}
    </section>
  );
}
