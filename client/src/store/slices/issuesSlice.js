import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchAllIssues = createAsyncThunk(
  'issues/fetchAll',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const axiosInstance = (await import('../../api/axiosInstance')).default;
      const response = await axiosInstance.get('/issues', { params: filters });
      return response.data.issues;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to load issues'
      );
    }
  }
);

export const fetchMyIssues = createAsyncThunk(
  'issues/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      const axiosInstance = (await import('../../api/axiosInstance')).default;
      const response = await axiosInstance.get('/issues/my');
      return response.data.issues;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to load your issues'
      );
    }
  }
);

export const fetchAdminIssues = createAsyncThunk(
  'issues/fetchAdmin',
  async (_, { rejectWithValue }) => {
    try {
      const axiosInstance = (await import('../../api/axiosInstance')).default;
      const response = await axiosInstance.get('/admin/issues');
      return response.data.issues;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to load admin issues'
      );
    }
  }
);

export const createIssue = createAsyncThunk(
  'issues/create',
  async (formData, { rejectWithValue }) => {
    try {
      const axiosInstance = (await import('../../api/axiosInstance')).default;
      const response = await axiosInstance.post('/issues', formData);
      return response.data.issue;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to create issue'
      );
    }
  }
);

export const deleteIssue = createAsyncThunk(
  'issues/delete',
  async (issueId, { rejectWithValue }) => {
    try {
      const axiosInstance = (await import('../../api/axiosInstance')).default;
      await axiosInstance.delete(`/issues/${issueId}`);
      return issueId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to delete issue'
      );
    }
  }
);

export const updateIssueStatus = createAsyncThunk(
  'issues/updateStatus',
  async ({ issueId, newStatus }, { rejectWithValue }) => {
    try {
      const axiosInstance = (await import('../../api/axiosInstance')).default;
      const response = await axiosInstance.patch(
        `/admin/issues/${issueId}/status`,
        { status: newStatus }
      );
      return response.data.issue;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to update issue status'
      );
    }
  }
);

export const fetchNearbyIssues = createAsyncThunk(
  'issues/fetchNearby',
  async ({ lat, lng, radius }, { rejectWithValue }) => {
    try {
      const axiosInstance = (await import('../../api/axiosInstance')).default;
      const response = await axiosInstance.get('/issues/nearby', {
        params: { lat, lng, radius }
      });
      return response.data.issues;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to load nearby issues'
      );
    }
  }
);

export const upvoteIssueThunk = createAsyncThunk(
  'issues/upvote',
  async (issueId, { rejectWithValue }) => {
    try {
      const axiosInstance = (await import('../../api/axiosInstance')).default;
      const response = await axiosInstance.patch(`/issues/${issueId}/upvote`);
      return response.data.issue;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to upvote issue'
      );
    }
  }
);

const initialState = {
  allIssues: [],
  myIssues: [],
  adminIssues: [],
  nearbyIssues: [],
  selectedIssue: null,
  loading: false,
  nearbyLoading: false,
  error: null,
};

const issuesSlice = createSlice({
  name: 'issues',
  initialState,
  reducers: {
    updateIssueInCache: (state, action) => {
      const { issueId, updatedData } = action.payload;
      const allIdx = state.allIssues.findIndex((i) => i._id === issueId);
      if (allIdx !== -1) {
        state.allIssues[allIdx] = {
          ...state.allIssues[allIdx],
          ...updatedData,
        };
      }
      const myIdx = state.myIssues.findIndex((i) => i._id === issueId);
      if (myIdx !== -1) {
        state.myIssues[myIdx] = {
          ...state.myIssues[myIdx],
          ...updatedData,
        };
      }
      const adminIdx = state.adminIssues.findIndex((i) => i._id === issueId);
      if (adminIdx !== -1) {
        state.adminIssues[adminIdx] = {
          ...state.adminIssues[adminIdx],
          ...updatedData,
        };
      }
    },
    clearAllIssues: (state) => {
      state.allIssues = [];
      state.myIssues = [];
      state.adminIssues = [];
      state.selectedIssue = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllIssues.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllIssues.fulfilled, (state, action) => {
        state.loading = false;
        state.allIssues = action.payload;
      })
      .addCase(fetchAllIssues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(fetchMyIssues.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyIssues.fulfilled, (state, action) => {
        state.loading = false;
        state.myIssues = action.payload;
      })
      .addCase(fetchMyIssues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(fetchAdminIssues.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminIssues.fulfilled, (state, action) => {
        state.loading = false;
        state.adminIssues = action.payload;
      })
      .addCase(fetchAdminIssues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(createIssue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createIssue.fulfilled, (state, action) => {
        state.loading = false;
        state.myIssues.unshift(action.payload);
      })
      .addCase(createIssue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(deleteIssue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteIssue.fulfilled, (state, action) => {
        state.loading = false;
        const issueId = action.payload;
        state.allIssues = state.allIssues.filter((i) => i._id !== issueId);
        state.myIssues = state.myIssues.filter((i) => i._id !== issueId);
        state.adminIssues = state.adminIssues.filter((i) => i._id !== issueId);
      })
      .addCase(deleteIssue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(updateIssueStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateIssueStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updatedIssue = action.payload;
        const updateIssueInArray = (arr) => {
          const idx = arr.findIndex((i) => i._id === updatedIssue._id);
          if (idx !== -1) {
            arr[idx] = updatedIssue;
          }
        };
        updateIssueInArray(state.allIssues);
        updateIssueInArray(state.myIssues);
        updateIssueInArray(state.adminIssues);
      })
      .addCase(updateIssueStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(fetchNearbyIssues.pending, (state) => {
        state.nearbyLoading = true;
        state.error = null;
      })
      .addCase(fetchNearbyIssues.fulfilled, (state, action) => {
        state.nearbyLoading = false;
        state.nearbyIssues = action.payload;
      })
      .addCase(fetchNearbyIssues.rejected, (state, action) => {
        state.nearbyLoading = false;
        state.error = action.payload;
      });

    builder
      .addCase(upvoteIssueThunk.pending, (state) => {
        state.error = null;
      })
      .addCase(upvoteIssueThunk.fulfilled, (state, action) => {
        const updatedIssue = action.payload;
        const updateIssueInArray = (arr) => {
          const idx = arr.findIndex((i) => i._id === updatedIssue._id);
          if (idx !== -1) {
            arr[idx] = updatedIssue;
          }
        };
        updateIssueInArray(state.allIssues);
        updateIssueInArray(state.myIssues);
        updateIssueInArray(state.nearbyIssues);
        updateIssueInArray(state.adminIssues);
      })
      .addCase(upvoteIssueThunk.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { updateIssueInCache, clearAllIssues } = issuesSlice.actions;

export const selectAllIssues = (state) => state.issues.allIssues;
export const selectMyIssues = (state) => state.issues.myIssues;
export const selectAdminIssues = (state) => state.issues.adminIssues;
export const selectNearbyIssues = (state) => state.issues.nearbyIssues;
export const selectSelectedIssue = (state) => state.issues.selectedIssue;
export const selectIssuesLoading = (state) => state.issues.loading;
export const selectNearbyLoading = (state) => state.issues.nearbyLoading;
export const selectIssuesError = (state) => state.issues.error;

export default issuesSlice.reducer;
