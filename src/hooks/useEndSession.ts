import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { clearAuth } from '../redux/reducers/auth';
import { persistor } from '../redux/store';
import { loginPathFor } from '../constants/auth';

/** Why a session ended without the person logging out, shown on the login page. */
export interface SessionEndedState {
  /** Problem code of the 401 that ended it, such as `auth.token.expired`. */
  sessionEndedCode: string;
}

/**
 * Ends the session and goes to the login page of the person's role. Pass the 401 code when the server ended the
 * session, so the login page can say why.
 */
export function useEndSession() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const customerType = useAppSelector((state) => state.auth.user?.customerType);

  return useCallback(async (sessionEndedCode?: string) => {
    const loginPath = loginPathFor(customerType);
    dispatch(clearAuth());
    // redux-persist writes storage a moment later. Without the flush, a reload right after logout
    // would bring the old session back.
    await persistor.flush();
    const state: SessionEndedState | undefined = sessionEndedCode ? { sessionEndedCode } : undefined;
    navigate(loginPath, { replace: Boolean(sessionEndedCode), state });
  }, [customerType, dispatch, navigate]);
}
