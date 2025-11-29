// src/store/index.ts
import {configureStore, createListenerMiddleware, isAnyOf} from '@reduxjs/toolkit';
import {ticketmasterApi} from '../api/ticketmasterApi';
import favoritesReducer, {
  removeFavorite,
  toggleFavorite,
  replaceFavorites,
} from './slices/favoritesSlice';
import filtersReducer from './slices/filtersSlice';
import themeReducer, {setThemePreference} from './slices/themeSlice';
import {
  getStoredFavorites,
  persistFavorites,
  getStoredThemePreference,
  persistThemePreference,
} from '../storage/mmkv';

const favoritesListener = createListenerMiddleware();
const themeListener = createListenerMiddleware();

const preloadedFavorites = getStoredFavorites();
const preloadedThemePreference = getStoredThemePreference();

export const store = configureStore({
  reducer: {
    favorites: favoritesReducer,
    filters: filtersReducer,
    theme: themeReducer,
    [ticketmasterApi.reducerPath]: ticketmasterApi.reducer,
  },
  preloadedState: {
    favorites: {
      entities: preloadedFavorites,
    },
    theme: {
      mode: preloadedThemePreference,
    },
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(
      ticketmasterApi.middleware,
      favoritesListener.middleware,
      themeListener.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

favoritesListener.startListening({
  matcher: isAnyOf(toggleFavorite, removeFavorite, replaceFavorites),
  effect: (_, listenerApi) => {
    const state = listenerApi.getState() as RootState;
    persistFavorites(state.favorites.entities);
  },
});

themeListener.startListening({
  actionCreator: setThemePreference,
  effect: (_, listenerApi) => {
    const state = listenerApi.getState() as RootState;
    persistThemePreference(state.theme.mode);
  },
});

export default store;
