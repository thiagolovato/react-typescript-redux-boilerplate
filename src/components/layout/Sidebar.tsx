import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { logoutUser } from '../../redux/reducers/auth';
import { useI18n } from '../../hooks/useI18n';
import { Button, LanguageToggle } from '../ui';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
}

const navItems = [
  { to: '/dashboard', icon: '🏠', label: 'navigation.dashboard' },
  { to: '/profile', icon: '👤', label: 'navigation.profile' },
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
      className={`z-40 flex flex-col border-primary-700 bg-primary-800 text-neutral-50
        md:fixed md:inset-y-0 md:left-0 md:border-r ${isCollapsed ? 'md:w-20' : 'md:w-70'}`}
    >
      <div className="flex min-h-16 items-center gap-2 border-b border-primary-700 px-4">
        <span aria-hidden="true" className={`text-2xl ${isCollapsed ? 'md:hidden' : ''}`}>🌸</span>
        <span className={`flex-1 truncate text-lg font-bold ${labelClass}`}>{t('app.name')}</span>
        <button
          type="button"
          onClick={() => setIsMobileOpen((value) => !value)}
          aria-expanded={isMobileOpen}
          aria-controls="main-navigation"
          className="rounded-md px-3 py-2 hover:bg-primary-700 md:hidden"
        >
          <span aria-hidden="true">☰</span>
          <span className="sr-only">{t('navigation.mainMenu')}</span>
        </button>
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-expanded={!isCollapsed}
          aria-controls="main-navigation"
          aria-label={t(isCollapsed ? 'navigation.expand' : 'navigation.collapse')}
          className="hidden size-8 shrink-0 items-center justify-center rounded-full bg-primary-500
            hover:bg-primary-400 md:flex"
        >
          <span aria-hidden="true">{isCollapsed ? '→' : '←'}</span>
        </button>
      </div>

      <div
        id="main-navigation"
        className={`flex-1 flex-col md:flex ${isMobileOpen ? 'flex' : 'hidden'}`}
      >
        <nav aria-label={t('navigation.mainMenu')} className="flex flex-1 flex-col py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsMobileOpen(false)}
              title={isCollapsed ? t(item.label) : undefined}
              className={({ isActive }) => `flex items-center gap-3 border-l-4 px-4 py-3 transition-colors
                hover:bg-primary-700 hover:text-neutral-50
                ${isActive ? 'border-primary-500 bg-primary-700 text-neutral-50' : 'border-transparent text-neutral-400'}`}
            >
              <span aria-hidden="true">{item.icon}</span>
              <span className={`whitespace-nowrap ${labelClass}`}>{t(item.label)}</span>
            </NavLink>
          ))}
        </nav>

        <div className="flex flex-col gap-3 border-t border-primary-700 p-4">
          <LanguageToggle className={isCollapsed ? 'md:hidden' : ''} />
          {user && (
            <p className={`truncate text-sm ${labelClass}`}>
              {user.email} ({t(user.customerType === 'MENTOR' ? 'roles.MENTOR' : 'roles.MENTEE')})
            </p>
          )}
          <Button variant="outline" size="sm" onClick={handleLogout} fullWidth title={t('dashboard.logout')}>
            {isCollapsed && <span aria-hidden="true" className="hidden md:inline">🚪</span>}
            <span className={labelClass}>{t('dashboard.logout')}</span>
          </Button>
        </div>
      </div>
    </aside>
  );
}
