import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { switchRole } from '../../redux/reducers/auth';
import { useEndSession } from '../../hooks/useEndSession';
import { useI18n } from '../../hooks/useI18n';
import { useUnreadNotifications } from '../../hooks/useUnreadNotifications';
import {
  ApiErrorAlert, BellIcon, Button, SwapIcon, HomeIcon, LanguageToggle, LogoutIcon, MenuIcon, PairIcon, PanelIcon, RoleBird, ThemeToggle, UserIcon,
} from '../ui';
import birds from '../../assets/mentor-mentee-birds-640.jpg';
import { APP_ROUTES } from '../../constants/routes';
import { homePathFor } from '../../constants/auth';
import type { SignUpType } from '../../types/auth/register';
import type { ApiError } from '../../types/api';
import { toApiError } from '../../service/request/apiError';

// Larger counts show as "9+" so the badge stays small.
const HTTP_UNAUTHORIZED = 401;
// Shown when a 401 came without a code. Same as AuthLayout.
const FALLBACK_SESSION_CODE = 'auth.token.invalid';
const MAX_BADGE = 9;

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
}

const participantNavItems = [
  { to: APP_ROUTES.dashboard, Icon: HomeIcon, label: 'navigation.dashboard' },
  { to: APP_ROUTES.mentorship, Icon: PairIcon, label: 'navigation.mentorship' },
  { to: APP_ROUTES.notifications, Icon: BellIcon, label: 'navigation.notifications' },
  { to: APP_ROUTES.profile, Icon: UserIcon, label: 'navigation.profile' },
] as const;

const coordinatorNavItems = [
  { to: APP_ROUTES.coordination, Icon: HomeIcon, label: 'navigation.coordination' },
  { to: APP_ROUTES.notifications, Icon: BellIcon, label: 'navigation.notifications' },
] as const;

export function Sidebar({ isCollapsed, onToggleCollapsed }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const endSession = useEndSession();
  const { t } = useI18n();
  const { user } = useAppSelector((state) => state.auth);
  const unread = useUnreadNotifications();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [switching, setSwitching] = useState(false);
  const [switchError, setSwitchError] = useState<ApiError | null>(null);

  const isCoordinator = user?.customerType === 'COORDINATOR';
  const navItems = isCoordinator ? coordinatorNavItems : participantNavItems;

  const handleLogout = () => endSession();

  // A participant with both roles sees the app as one of them at a time.
  const otherRole: SignUpType | null = user?.customerType === 'MENTOR' || user?.customerType === 'MENTEE'
    ? (user.customerType === 'MENTOR' ? 'MENTEE' : 'MENTOR')
    : null;
  const canSwitch = otherRole !== null && (user?.roles ?? []).includes(otherRole);

  const handleSwitch = async () => {
    if (!otherRole) return;
    setSwitching(true);
    setSwitchError(null);
    const result = await dispatch(switchRole(otherRole));
    setSwitching(false);
    if (switchRole.fulfilled.match(result)) {
      setIsMobileOpen(false);
      navigate(homePathFor(result.payload.type));
      return;
    }
    const error = result.payload ?? toApiError(result.error);
    // Auth calls skip the session interceptor of httpClient, so a rejected token ends the session here.
    if (error.status === HTTP_UNAUTHORIZED) {
      void endSession(error.code ?? FALLBACK_SESSION_CODE);
      return;
    }
    setSwitchError(error);
  };

  // Labels hide only on desktop when collapsed. The mobile panel always shows them.
  const labelClass = isCollapsed ? 'md:sr-only' : '';

  return (
    <aside
      className={`z-40 flex flex-col border-b border-neutral-200 bg-neutral-50
        md:fixed md:inset-y-0 md:left-0 md:border-r md:border-b-0 ${isCollapsed ? 'md:w-20' : 'md:w-70'}`}
    >
      <div className={`flex min-h-16 items-center gap-3 px-4 ${isCollapsed ? 'md:flex-col md:justify-center md:py-4' : ''}`}>
        <span aria-hidden="true" className="size-10 shrink-0 overflow-hidden dark:rounded-full dark:bg-paper">
          <img src={birds} alt="" className="size-full scale-150 object-cover mix-blend-multiply" />
        </span>
        <span className={`flex-1 truncate text-lg font-semibold tracking-tight text-neutral-900 ${labelClass}`}>
          {t('app.name')}
        </span>
        <button
          type="button"
          onClick={() => setIsMobileOpen((value) => !value)}
          aria-expanded={isMobileOpen}
          aria-controls="main-navigation"
          className="flex size-9 items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-100 md:hidden"
        >
          <MenuIcon />
          <span className="sr-only">{t('navigation.mainMenu')}</span>
        </button>
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-expanded={!isCollapsed}
          aria-controls="main-navigation"
          aria-label={t(isCollapsed ? 'navigation.expand' : 'navigation.collapse')}
          title={t(isCollapsed ? 'navigation.expand' : 'navigation.collapse')}
          className="hidden size-8 shrink-0 items-center justify-center rounded-md text-neutral-500
            hover:bg-neutral-100 hover:text-neutral-900 md:flex"
        >
          <PanelIcon />
        </button>
      </div>

      <div
        id="main-navigation"
        className={`flex-1 flex-col md:flex ${isMobileOpen ? 'flex' : 'hidden'}`}
      >
        <nav aria-label={t('navigation.mainMenu')} className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map(({ to, Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setIsMobileOpen(false)}
              title={isCollapsed ? t(label) : undefined}
              className={({ isActive }) => `flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition-colors
                ${isCollapsed ? 'md:justify-center' : ''}
                ${isActive
                  ? 'bg-primary-50 font-medium text-primary-800'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'}`}
            >
              <span className="relative flex">
                <Icon />
                {to === APP_ROUTES.notifications && unread > 0 && (
                  <span
                    aria-hidden="true"
                    className="absolute -top-1.5 -right-2 min-w-4 rounded-full bg-primary-600 px-1 text-center
                      text-[10px] leading-4 font-semibold text-white"
                  >
                    {unread > MAX_BADGE ? `${MAX_BADGE}+` : unread}
                  </span>
                )}
              </span>
              <span className={`whitespace-nowrap ${labelClass}`}>{t(label)}</span>
              {to === APP_ROUTES.notifications && unread > 0 && (
                <span className="sr-only">{t('notifications.unreadCount', { count: unread })}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex flex-col gap-3 border-t border-neutral-200 p-3">
          <div className={`flex gap-2 ${isCollapsed ? 'md:hidden' : ''}`}>
            <LanguageToggle className="min-w-0 flex-1" />
            <ThemeToggle />
          </div>
          {user && (
            <div className={`flex items-center gap-3 px-1 ${isCollapsed ? 'md:justify-center' : ''}`}>
              {user.customerType && user.customerType !== 'COORDINATOR' && <RoleBird role={user.customerType} size="sm" />}
              <p className={`min-w-0 text-sm leading-tight ${labelClass}`}>
                <span className="block truncate text-neutral-900">{user.email}</span>
                {user.customerType && (
                  <span className="block text-neutral-600">{t(`roles.${user.customerType}`)}</span>
                )}
              </p>
            </div>
          )}
          {canSwitch && otherRole && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSwitch}
              isLoading={switching}
              fullWidth
              title={t(`navigation.switchRole.${otherRole}`)}
              leftIcon={<SwapIcon />}
              className={isCollapsed ? '' : 'md:justify-start'}
            >
              <span className={labelClass}>{t(`navigation.switchRole.${otherRole}`)}</span>
            </Button>
          )}
          <ApiErrorAlert error={switchError} fallback={t('navigation.switchRoleError')} />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            fullWidth
            title={t('dashboard.logout')}
            leftIcon={<LogoutIcon />}
            className={isCollapsed ? '' : 'md:justify-start'}
          >
            <span className={labelClass}>{t('dashboard.logout')}</span>
          </Button>
        </div>
      </div>
    </aside>
  );
}
