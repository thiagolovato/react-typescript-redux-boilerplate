import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { Dashboard } from './components/Dashboard';
import Profile from './components/Profile';
import { Privacy } from './components/Privacy';
import { AuthLayout } from './components/layout/AuthLayout';
import { Coordination } from './components/Coordination';
import { NotFound } from './components/NotFound';
import { COORDINATOR_LOGIN_PATH } from './constants/auth';

// Dev-only reference page. Vite replaces import.meta.env.DEV with false in production builds,
// so the route and its lazy chunk are dropped from the bundle.
const DesignSystem = import.meta.env.DEV
  ? lazy(() => import('./components/designSystem/DesignSystem').then((module) => ({ default: module.DesignSystem })))
  : null;

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {/* Not linked from anywhere. Coordinators get the address directly. */}
      <Route path={COORDINATOR_LOGIN_PATH} element={<Login coordinator />} />
      <Route path="/privacy" element={<Privacy />} />
      {DesignSystem && (
        <Route path="/design-system" element={<Suspense><DesignSystem /></Suspense>} />
      )}
      {/* Authenticated Routes */}
      <Route element={<AuthLayout roles={['MENTOR', 'MENTEE']} />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route element={<AuthLayout roles={['COORDINATOR']} />}>
        <Route path="/coordination" element={<Coordination />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
