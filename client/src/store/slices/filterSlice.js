import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedCategory: '',
  selectedStatus: '',
};

const filterSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    setStatus: (state, action) => {
      state.selectedStatus = action.payload;
    },
    resetFilters: (state) => {
      state.selectedCategory = '';
      state.selectedStatus = '';
    },
  },
});

export const { setCategory, setStatus, resetFilters } = filterSlice.actions;

export const selectSelectedCategory = (state) => state.filters.selectedCategory;
export const selectSelectedStatus = (state) => state.filters.selectedStatus;
export const selectFilters = (state) => ({
  category: state.filters.selectedCategory,
  status: state.filters.selectedStatus,
});

export default filterSlice.reducer;
