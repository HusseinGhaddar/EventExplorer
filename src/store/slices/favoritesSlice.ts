import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {EventSummary} from '../../types/events';

export interface FavoritesState {
  entities: Record<string, EventSummary>;
}

const initialState: FavoritesState = {
  entities: {},
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    toggleFavorite(state, action: PayloadAction<EventSummary>) {
      const event = action.payload;
      if (state.entities[event.id]) {
        delete state.entities[event.id];
        return;
      }

      state.entities[event.id] = event;
    },
    removeFavorite(state, action: PayloadAction<string>) {
      delete state.entities[action.payload];
    },
    replaceFavorites(state, action: PayloadAction<Record<string, EventSummary>>) {
      state.entities = action.payload;
    },
  },
});

export const {toggleFavorite, removeFavorite, replaceFavorites} = favoritesSlice.actions;

export default favoritesSlice.reducer;
