import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  globalLoading: false,
  notification: null,
  notificationIdCounter: 0,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setGlobalLoading: (state, action) => {
      state.globalLoading = action.payload;
    },
    showNotification: (state, action) => {
      const { type, message, duration } = action.payload;
      state.notificationIdCounter += 1;
      state.notification = {
        id: state.notificationIdCounter,
        type: type || 'info',
        message,
        duration: duration || 5000,
      };
    },
    clearNotification: (state) => {
      state.notification = null;
    },
  },
});

export const {
  setGlobalLoading,
  showNotification,
  clearNotification,
} = uiSlice.actions;

export const selectGlobalLoading = (state) => state.ui.globalLoading;
export const selectNotification = (state) => state.ui.notification;

export default uiSlice.reducer;
