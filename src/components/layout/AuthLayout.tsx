import { useState } from 'react';
import { Navigate, Outlet } from 'react-router';
import { useAppSelector } from '../../redux/hooks';
import { Sidebar } from './Sidebar';

export function AuthLayout() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen">
      <Sidebar isCollapsed={isCollapsed} onToggleCollapsed={() => setIsCollapsed((value) => !value)} />
      <main className={`p-4 sm:p-6 ${isCollapsed ? 'md:ml-20' : 'md:ml-70'}`}>
        <Outlet />
      </main>
    </div>
  );
}
