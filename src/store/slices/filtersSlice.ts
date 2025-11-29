import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export type EventCategory = 'all' | 'music' | 'sports' | 'arts & theatre' | 'film' | 'miscellaneous';

export interface FiltersState {
  keyword: string;
  city: string;
  category: EventCategory;
}

const initialState: FiltersState = {
  keyword: '',
  city: '',
  category: 'all',
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    updateFilters(state, action: PayloadAction<Partial<FiltersState>>) {
      return {...state, ...action.payload};
    },
    resetFilters() {
      return initialState;
    },
  },
});

export const {updateFilters, resetFilters} = filtersSlice.actions;

export default filtersSlice.reducer;
