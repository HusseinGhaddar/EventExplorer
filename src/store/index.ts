import {configureStore, createListenerMiddleware, isAnyOf} from '@reduxjs/toolkit';
import {ticketmasterApi} from '../api/ticketmasterApi';
import favoritesReducer, {
  removeFavorite,
  toggleFavorite,
  replaceFavorites,
} from './slices/favoritesSlice';
import filtersReducer from './slices/filtersSlice';
import {getStoredFavorites, persistFavorites} from '../storage/mmkv';

const favoritesListener = createListenerMiddleware();

const preloadedFavorites = getStoredFavorites();

export const store = configureStore({
  reducer: {
    favorites: favoritesReducer,
    filters: filtersReducer,
    [ticketmasterApi.reducerPath]: ticketmasterApi.reducer,
  },
  preloadedState: {
    favorites: {
      entities: preloadedFavorites,
    },
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(ticketmasterApi.middleware, favoritesListener.middleware),
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
