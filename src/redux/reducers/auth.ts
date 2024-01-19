import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { TokenResource } from '@typess/auth/login.ts';
import { post } from '@services/request/api.ts';

export const doLogin = createAsyncThunk<TokenResource, void, { rejectValue: string }>(
    'auth/login',
    async (_, thunkAPI) => {
      try {
      // TODO: add url
        const response: TokenResource = await post<TokenResource>('', {
          email: 'test@test.test',
          password: '123456',
        });
        console.log(response);
        return response;
      } catch (error) {
        return thunkAPI.rejectWithValue('Failed to fetch issues.');
      }
    },
);

const initialState = { loading: false, token: '', error: '' };

export const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
        .addCase(doLogin.pending, (state) => {
          state.loading = true;
        // show error
        })
        .addCase(doLogin.fulfilled, (state, { payload }) => {
          state.loading = false;
          state.token = payload?.idToken;
        })
        .addCase(doLogin.rejected, (state, action) => {
          state.loading = false;
          state.error = action.error.message || 'Something went wrong';
        });
  },
});
export default loginSlice.reducer;
