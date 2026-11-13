import { useState } from 'react';
import { Navigate, Outlet } from 'react-router';
import { useAppSelector } from '../../redux/hooks';
import { Sidebar } from './Sidebar';
import { homePathFor } from '../../constants/auth';
import { APP_ROUTES } from '../../constants/routes';
import type { CustomerType } from '../../types/auth/register';

interface AuthLayoutProps {
  /** Roles allowed on the pages inside. Anyone else goes to their own home page. */
  roles: CustomerType[];
}

// Hides pages from the wrong role. The server still checks the role on every request.
export function AuthLayout({ roles }: AuthLayoutProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const forCoordinators = roles.includes('COORDINATOR');

  if (!isAuthenticated) {
    return <Navigate to={forCoordinators ? APP_ROUTES.coordinatorLogin : APP_ROUTES.login} replace />;
  }

  // A session without a role (older token) keeps the mentor and mentee pages, as before.
  const type = user?.customerType;
  const allowed = type ? roles.includes(type) : !forCoordinators;
  if (!allowed) {
    return <Navigate to={homePathFor(type)} replace />;
  }

  return (
    <div className="min-h-screen">
      <Sidebar isCollapsed={isCollapsed} onToggleCollapsed={() => setIsCollapsed((value) => !value)} />
      <main className={`px-4 py-8 sm:px-8 sm:py-10 ${isCollapsed ? 'md:ml-20' : 'md:ml-70'}`}>
        <Outlet />
      </main>
    </div>
  );
}
