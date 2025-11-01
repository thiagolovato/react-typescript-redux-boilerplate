import React, { ComponentType, FC } from 'react';
import { Navigate } from 'react-router-dom';

const withAuthentication = <P extends React.ReactElement>(
  Component: ComponentType<P>,
): FC<P> => (props) => {
    const isAuthenticated = localStorage.getItem('logged-user');

    if (isAuthenticated) {
      return <Component {...props} />;
    }
    return (
      <Navigate
        to={{
          pathname: '/user',
        }}
      />
    );
  };

export default withAuthentication;
