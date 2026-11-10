import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { authService, tokenUtils } from '../../service/request/api';
import { RegisterRequest, RegisterResponse } from '../../types/auth/register';
import type { ApiError } from '../../types/api';
import { ApiRequestError, toApiError } from '../../service/request/apiError';

// Types for auth state
interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: {
    userId?: number;
    email?: string;
    customerType?: 'MENTOR' | 'MENTEE';
  } | null;
  loading: boolean;
  error: ApiError | null;
}

interface LoginCredentials {
  email: string;
  password: string;
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
        const response = await authService.login(credentials.email, credentials.password);
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

export const validateToken = createAsyncThunk<
  boolean,
  string,
  { rejectValue: { unauthorized: boolean } }
>(
    'auth/validateToken',
    async (token, thunkAPI) => {
      try {
        // Validate with server only - let backend handle expiration
        await authService.authenticate(token);
        return true;
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
          // Claim name set by JwtTokenUtil.CLAIM_TYPE in auth-service.
          type?: 'MENTOR' | 'MENTEE'
        };
        if (decoded) {
          // Keep userId from login/register. The token payload does not carry it.
          state.user = {
            ...state.user,
            email: decoded.sub || decoded.email,
            customerType: decoded.type,
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
        .addCase(loginUser.fulfilled, (state, action) => {
          state.loading = false;
          state.isAuthenticated = true;
          state.token = action.payload.jwt;
          state.error = null;

          state.user = {
            userId: action.payload.userId,
            email: action.payload.username,
            customerType: action.payload.type as 'MENTOR' | 'MENTEE',
          };

          tokenUtils.save(action.payload.jwt);
        })
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
        .addCase(registerUser.fulfilled, (state, action) => {
          state.loading = false;
          state.isAuthenticated = true;
          state.token = action.payload.jwt;
          state.error = null;

          state.user = {
            userId: action.payload.userId,
            email: action.payload.username,
            customerType: action.payload.type as 'MENTOR' | 'MENTEE',
          };

          tokenUtils.save(action.payload.jwt);
        })
        .addCase(registerUser.rejected, (state, action) => {
          state.loading = false;
          state.isAuthenticated = false;
          state.token = null;
          state.user = null;
          state.error = action.payload ?? toApiError(action.error);
        });

    // Validate Token
    builder
        .addCase(validateToken.pending, (state) => {
          state.loading = true;
        })
        .addCase(validateToken.fulfilled, (state) => {
          state.loading = false;
          state.isAuthenticated = true;
          state.error = null;
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
