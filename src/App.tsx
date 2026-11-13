import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { Dashboard } from './components/Dashboard';
import Profile from './components/Profile';
import { Privacy } from './components/Privacy';
import { AuthLayout } from './components/layout/AuthLayout';
import { Coordination } from './components/Coordination';
import { MenteeMatching } from './components/coordination/MenteeMatching';
import { NotFound } from './components/NotFound';
import { APP_ROUTES } from './constants/routes';

// Dev-only reference page. Vite replaces import.meta.env.DEV with false in production builds,
// so the route and its lazy chunk are dropped from the bundle.
const DesignSystem = import.meta.env.DEV
  ? lazy(() => import('./components/designSystem/DesignSystem').then((module) => ({ default: module.DesignSystem })))
  : null;

function App() {
  return (
    <Routes>
      <Route path={APP_ROUTES.root} element={<Login />} />
      <Route path={APP_ROUTES.login} element={<Login />} />
      <Route path={APP_ROUTES.register} element={<Register />} />
      {/* Not linked from anywhere. Coordinators get the address directly. */}
      <Route path={APP_ROUTES.coordinatorLogin} element={<Login coordinator />} />
      <Route path={APP_ROUTES.privacy} element={<Privacy />} />
      {DesignSystem && (
        <Route path={APP_ROUTES.designSystem} element={<Suspense><DesignSystem /></Suspense>} />
      )}
      {/* Authenticated Routes */}
      <Route element={<AuthLayout roles={['MENTOR', 'MENTEE']} />}>
        <Route path={APP_ROUTES.dashboard} element={<Dashboard />} />
        <Route path={APP_ROUTES.profile} element={<Profile />} />
      </Route>
      <Route element={<AuthLayout roles={['COORDINATOR']} />}>
        <Route path={APP_ROUTES.coordination} element={<Coordination />} />
        <Route path={APP_ROUTES.menteeMatching} element={<MenteeMatching />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
