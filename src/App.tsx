import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { Dashboard } from './components/Dashboard';
import Profile from './components/Profile';
import { AuthLayout } from './components/layout/AuthLayout';

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
      {DesignSystem && (
        <Route path="/design-system" element={<Suspense><DesignSystem /></Suspense>} />
      )}
      {/* Authenticated Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}

export default App;
