import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import issuesReducer from './slices/issuesSlice';
import filterReducer from './slices/filterSlice';
import adminReducer from './slices/adminSlice';
import uiReducer from './slices/uiSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    issues: issuesReducer,
    filters: filterReducer,
    admin: adminReducer,
    ui: uiReducer,
  },
});

export default store;
