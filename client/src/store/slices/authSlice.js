import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const decodeToken = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const decoded = JSON.parse(atob(parts[1]));
    return {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

export const restoreAuthFromStorage = createAsyncThunk(
  'auth/restoreFromStorage',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }

    const user = decodeToken(token);
    if (!user) {
      localStorage.removeItem('token');
      return rejectWithValue('Invalid token');
    }

    return { user, token };
  }
);

export const loginAsync = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const axiosInstance = (await import('../../api/axiosInstance')).default;

      const response = await axiosInstance.post('/auth/login', credentials);
      const { token, user } = response.data;

      localStorage.setItem('token', token);

      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        token,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Login failed. Please try again.'
      );
    }
  }
);

export const registerAsync = createAsyncThunk(
  'auth/register',
  async (credentials, { rejectWithValue }) => {
    try {
      const axiosInstance = (await import('../../api/axiosInstance')).default;

      const response = await axiosInstance.post('/auth/register', credentials);
      const { token, user } = response.data;

      localStorage.setItem('token', token);

      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        token,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Registration failed. Please try again.'
      );
    }
  }
);

const initialState = {
  user: null,
  token: null,
  loading: true,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(restoreAuthFromStorage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(restoreAuthFromStorage.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
        }
      })
      .addCase(restoreAuthFromStorage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(registerAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(registerAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setLoading, logout } = authSlice.actions;

export const selectUser = (state) => state.auth.user;

export const selectToken = (state) => state.auth.token;

export const selectIsAuthenticated = (state) => !!state.auth.user;

export const selectIsAdmin = (state) => state.auth.user?.role === 'admin';

export const selectAuthLoading = (state) => state.auth.loading;

export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
