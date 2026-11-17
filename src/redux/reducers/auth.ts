import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { authService, tokenUtils } from '../../service/request';
import { CustomerType, RegisterRequest, RegisterResponse, SignUpType } from '../../types/auth/register';
import type { ApiError } from '../../types/api';
import { ApiRequestError, toApiError } from '../../service/request/apiError';

// Types for auth state
interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: {
    userId?: number;
    email?: string;
    /** Role the session is active in. */
    customerType?: CustomerType;
    /** Every role of the account. Two participant roles offer a switch. */
    roles?: CustomerType[];
  } | null;
  loading: boolean;
  error: ApiError | null;
}

interface LoginCredentials {
  email: string;
  password: string;
  /** Uses the coordinator login, which only accepts coordinator accounts. */
  coordinator?: boolean;
}

// Async thunks
export const loginUser = createAsyncThunk<
  RegisterResponse,
  LoginCredentials,
  { rejectValue: ApiError }
>(
    'auth/login',
    async (credentials, thunkAPI) => {
      try {
        const response = await authService.login(credentials.email, credentials.password, credentials.coordinator);
        return response;
      } catch (error) {
        return thunkAPI.rejectWithValue(toApiError(error));
      }
    },
);

export const registerUser = createAsyncThunk<
  RegisterResponse,
  RegisterRequest,
  { rejectValue: ApiError }
>(
    'auth/register',
    async (userData, thunkAPI) => {
      try {
        const response = await authService.register(userData);
        return response;
      } catch (error) {
        return thunkAPI.rejectWithValue(toApiError(error));
      }
    },
);

/** Adds the other participant role and continues the session in it. */
export const addRole = createAsyncThunk<RegisterResponse, SignUpType, { rejectValue: ApiError }>(
    'auth/addRole',
    async (role, thunkAPI) => {
      try {
        return await authService.addRole(role);
      } catch (error) {
        return thunkAPI.rejectWithValue(toApiError(error));
      }
    },
);

/** Continues the session in another role of the account, with a new token. */
export const switchRole = createAsyncThunk<RegisterResponse, SignUpType, { rejectValue: ApiError }>(
    'auth/switchRole',
    async (role, thunkAPI) => {
      try {
        return await authService.switchRole(role);
      } catch (error) {
        return thunkAPI.rejectWithValue(toApiError(error));
      }
    },
);

/** A new session from login, sign-up or a role change: the token and who it belongs to. */
function startSession(state: AuthState, response: RegisterResponse) {
  state.loading = false;
  state.isAuthenticated = true;
  state.token = response.jwt;
  state.error = null;
  state.user = {
    userId: response.userId,
    email: response.username,
    customerType: response.type,
    roles: response.roles,
  };
  tokenUtils.save(response.jwt);
}

export const validateToken = createAsyncThunk<
  RegisterResponse,
  string,
  { rejectValue: { unauthorized: boolean } }
>(
    'auth/validateToken',
    async (token, thunkAPI) => {
      try {
        // Validate with server only - let backend handle expiration
        return await authService.authenticate(token);
      } catch (error) {
        // Only a 401 means the token is bad. A network error or 5xx keeps the session.
        const unauthorized = error instanceof ApiRequestError && error.details.status === 401;
        return thunkAPI.rejectWithValue({ unauthorized });
      }
    },
);

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  user: null,
  loading: false,
  error: null,
};

// Slice
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
      tokenUtils.save(action.payload);
    },
    clearAuth: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      state.error = null;
      tokenUtils.remove();
    },
    initializeAuth: (state) => {
      const token = tokenUtils.get();
      if (token) {
        state.token = token;
        state.isAuthenticated = true;
        // Decode token to get user info
        const decoded = tokenUtils.decode(token) as {
          sub?: string;
          email?: string;
          // Claim names set by JwtTokenUtil (CLAIM_TYPE, CLAIM_ROLES) in auth-service.
          type?: CustomerType;
          roles?: CustomerType[];
        };
        if (decoded) {
          // Keep userId from login/register. The token payload does not carry it.
          state.user = {
            ...state.user,
            email: decoded.sub || decoded.email,
            customerType: decoded.type,
            roles: decoded.roles,
          };
        }
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
        .addCase(loginUser.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(loginUser.fulfilled, (state, action) => startSession(state, action.payload))
        .addCase(loginUser.rejected, (state, action) => {
          state.loading = false;
          state.isAuthenticated = false;
          state.token = null;
          state.user = null;
          state.error = action.payload ?? toApiError(action.error);
        });

    // Register
    builder
        .addCase(registerUser.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(registerUser.fulfilled, (state, action) => startSession(state, action.payload))
        .addCase(registerUser.rejected, (state, action) => {
          state.loading = false;
          state.isAuthenticated = false;
          state.token = null;
          state.user = null;
          state.error = action.payload ?? toApiError(action.error);
        });

    // Role changes keep the session on failure: the page shows the error.
    builder
        .addCase(addRole.fulfilled, (state, action) => startSession(state, action.payload))
        .addCase(switchRole.fulfilled, (state, action) => startSession(state, action.payload));

    // Validate Token
    builder
        .addCase(validateToken.pending, (state) => {
          state.loading = true;
        })
        .addCase(validateToken.fulfilled, (state, action) => {
          state.loading = false;
          state.isAuthenticated = true;
          state.error = null;
          // The server's answer, not the stored one: a session saved before roles existed, or a role added on
          // another device, gets the account's roles here.
          state.user = {
            userId: action.payload.userId,
            email: action.payload.username,
            customerType: action.payload.type,
            roles: action.payload.roles,
          };
        })
        .addCase(validateToken.rejected, (state, action) => {
          state.loading = false;
          if (!action.payload?.unauthorized) return;
          state.isAuthenticated = false;
          state.token = null;
          state.user = null;
          state.error = null; // Don't show error for token validation
          tokenUtils.remove();
        });

  },
});

// Tokens are stateless, so logging out only forgets the token here.
export const { clearError, setToken, clearAuth, initializeAuth } = authSlice.actions;

export default authSlice.reducer;
