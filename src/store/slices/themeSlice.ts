import {createSlice, type PayloadAction} from '@reduxjs/toolkit';
import type {ThemePreference} from '../../types/theme';

export interface ThemeState {
  mode: ThemePreference;
}

const initialState: ThemeState = {
  mode: 'system',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemePreference: (state, action: PayloadAction<ThemePreference>) => {
      state.mode = action.payload;
    },
  },
});

export const {setThemePreference} = themeSlice.actions;
export default themeSlice.reducer;
