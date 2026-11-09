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
      <main className={`px-4 py-8 sm:px-8 sm:py-10 ${isCollapsed ? 'md:ml-20' : 'md:ml-70'}`}>
        <Outlet />
      </main>
    </div>
  );
}
