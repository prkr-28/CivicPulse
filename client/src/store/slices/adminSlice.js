import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const fetchAdminStats = createAsyncThunk(
  'admin/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const axiosInstance = (await import('../../api/axiosInstance')).default;
      const response = await axiosInstance.get('/admin/stats');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to load admin statistics'
      );
    }
  }
);

const initialState = {
  stats: {
    issues: {
      total: 0,
      open: 0,
      'in-progress': 0,
      resolved: 0,
      rejected: 0,
    },
    resolutionRate: 0,
  },
  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminStats: (state) => {
      state.stats = initialState.stats;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAdminStats } = adminSlice.actions;

export const selectAdminStats = (state) => state.admin.stats;
export const selectAdminStatsLoading = (state) => state.admin.loading;
export const selectAdminStatsError = (state) => state.admin.error;

export default adminSlice.reducer;
