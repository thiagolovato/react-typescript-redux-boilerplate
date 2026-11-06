import React, { ComponentType, useEffect, useState } from 'react';
import { Navigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { validateToken, initializeAuth } from '../../redux/reducers/auth';
import { useI18n } from '../../hooks/useI18n';

interface WithAuthenticationProps {
  requireAuth?: boolean;
  redirectTo?: string;
}

const withAuthentication = <P extends object>(
  Component: ComponentType<P>,
  options: WithAuthenticationProps = {},
) => {
  const WrappedComponent: React.FC<P> = (props) => {
    const dispatch = useAppDispatch();
    const { t } = useI18n();
    const { isAuthenticated, token, loading } = useAppSelector((state) => state.auth);
    const [isValidating, setIsValidating] = useState(true);

    const {
      requireAuth = true,
      redirectTo = '/login',
    } = options;

    useEffect(() => {
      const initAuth = async () => {
        setIsValidating(true);

        // Initialize auth from localStorage
        dispatch(initializeAuth());

        // If we have a token, validate it with the server
        if (token) {
          try {
            await dispatch(validateToken(token)).unwrap();
          } catch (error) {
            console.warn('Token validation failed:', error);
          }
        }

        setIsValidating(false);
      };

      initAuth();
    }, [dispatch, token]);

    // Show loading state while validating
    if (isValidating || loading) {
      return (
        <div role="status" className="flex min-h-[50vh] items-center justify-center text-lg text-white">
          {t('common.loading')}
        </div>
      );
    }

    // Check authentication requirement
    if (requireAuth && !isAuthenticated) {
      return <Navigate to={redirectTo} replace />;
    }

    // If authentication is not required, or user is authenticated, render component
    return <Component {...props} />;
  };

  // Set display name for debugging
  WrappedComponent.displayName = `withAuthentication(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

export default withAuthentication;
