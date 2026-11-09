import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { logoutUser } from '../../redux/reducers/auth';
import { useI18n } from '../../hooks/useI18n';
import { Button, HomeIcon, LanguageToggle, LogoutIcon, MenuIcon, PanelIcon, RoleBird, UserIcon } from '../ui';
import birds from '../../assets/mentor-mentee-birds-640.jpg';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
}

const navItems = [
  { to: '/dashboard', Icon: HomeIcon, label: 'navigation.dashboard' },
  { to: '/profile', Icon: UserIcon, label: 'navigation.profile' },
] as const;

export function Sidebar({ isCollapsed, onToggleCollapsed }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useI18n();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch (error) {
      console.error('Logout error:', error);
    }
    navigate('/login');
  };

  // Labels hide only on desktop when collapsed. The mobile panel always shows them.
  const labelClass = isCollapsed ? 'md:sr-only' : '';

  return (
    <aside
      className={`z-40 flex flex-col border-b border-neutral-200 bg-neutral-50
        md:fixed md:inset-y-0 md:left-0 md:border-r md:border-b-0 ${isCollapsed ? 'md:w-20' : 'md:w-70'}`}
    >
      <div className={`flex min-h-16 items-center gap-3 px-4 ${isCollapsed ? 'md:flex-col md:justify-center md:py-4' : ''}`}>
        <span aria-hidden="true" className="size-10 shrink-0 overflow-hidden">
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
              <Icon />
              <span className={`whitespace-nowrap ${labelClass}`}>{t(label)}</span>
            </NavLink>
          ))}
        </nav>

        <div className="flex flex-col gap-3 border-t border-neutral-200 p-3">
          <LanguageToggle className={isCollapsed ? 'md:hidden' : ''} />
          {user && (
            <div className={`flex items-center gap-3 px-1 ${isCollapsed ? 'md:justify-center' : ''}`}>
              {user.customerType && <RoleBird role={user.customerType} size="sm" />}
              <p className={`min-w-0 text-sm leading-tight ${labelClass}`}>
                <span className="block truncate text-neutral-900">{user.email}</span>
                {user.customerType && (
                  <span className="block text-neutral-600">{t(`roles.${user.customerType}`)}</span>
                )}
              </p>
            </div>
          )}
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
