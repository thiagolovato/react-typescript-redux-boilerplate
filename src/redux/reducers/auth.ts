import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { authService, tokenUtils } from '../../service/request/api';
import { RegisterRequest, RegisterResponse } from '../../types/auth/register';

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
  error: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

// Async thunks
export const loginUser = createAsyncThunk<
  RegisterResponse,
  LoginCredentials,
  { rejectValue: string }
>(
    'auth/login',
    async (credentials, thunkAPI) => {
      try {
        const response = await authService.login(credentials.email, credentials.password);
        return response;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao fazer login';
        return thunkAPI.rejectWithValue(message);
      }
    },
);

export const registerUser = createAsyncThunk<
  RegisterResponse,
  RegisterRequest,
  { rejectValue: string }
>(
    'auth/register',
    async (userData, thunkAPI) => {
      try {
        const response = await authService.register(userData);
        return response;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao criar conta';
        return thunkAPI.rejectWithValue(message);
      }
    },
);

export const validateToken = createAsyncThunk<
  boolean,
  string,
  { rejectValue: string }
>(
    'auth/validateToken',
    async (token, thunkAPI) => {
      try {
        // Validate with server only - let backend handle expiration
        await authService.authenticate(token);
        return true;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Token inválido';
        return thunkAPI.rejectWithValue(message);
      }
    },
);

export const logoutUser = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>(
    'auth/logout',
    async () => {
      try {
        const token = tokenUtils.get();
        if (token) {
          await authService.logout(token);
        }
      } catch (error) {
      // Continue with logout even if server request fails
        console.warn('Logout failed on server:', error);
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
          customerType?: 'MENTOR' | 'MENTEE'
        };
        if (decoded) {
          state.user = {
            email: decoded.sub || decoded.email,
            customerType: decoded.customerType,
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
          state.error = action.payload || 'Erro ao fazer login';
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
          state.error = action.payload || 'Erro ao criar conta';
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
        .addCase(validateToken.rejected, (state) => {
          state.loading = false;
          state.isAuthenticated = false;
          state.token = null;
          state.user = null;
          state.error = null; // Don't show error for token validation
          tokenUtils.remove();
        });

    // Logout
    builder
        .addCase(logoutUser.pending, (state) => {
          state.loading = true;
        })
        .addCase(logoutUser.fulfilled, (state) => {
          state.loading = false;
          state.isAuthenticated = false;
          state.token = null;
          state.user = null;
          state.error = null;
          tokenUtils.remove();
        })
        .addCase(logoutUser.rejected, (state) => {
        // Even if logout fails on server, clear local state
          state.loading = false;
          state.isAuthenticated = false;
          state.token = null;
          state.user = null;
          state.error = null;
          tokenUtils.remove();
        });
  },
});

export const { clearError, setToken, clearAuth, initializeAuth } = authSlice.actions;

export default authSlice.reducer;
