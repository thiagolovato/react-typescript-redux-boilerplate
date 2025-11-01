import { Routes, Route } from 'react-router-dom';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { GlobalStyle } from './globalStyle';
import { Dashboard } from './components/Dashboard';
import Profile from './components/Profile';
import { AuthLayout } from './components/layout/AuthLayout';
import { LanguageToggle } from './components/ui/LanguageToggle';
import styled from 'styled-components';
import { tokens } from './constants/tokens';

const LanguageToggleWrapper = styled.div`
  position: fixed;
  top: ${tokens.spacing[4]};
  right: ${tokens.spacing[4]};
  z-index: ${tokens.zIndex.dropdown};
`;

function App() {
  return (
    <>
      <GlobalStyle />
      <LanguageToggleWrapper>
        <LanguageToggle />
      </LanguageToggleWrapper>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Authenticated Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
