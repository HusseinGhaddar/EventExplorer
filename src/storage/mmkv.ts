import {MMKV} from 'react-native-mmkv';
import type {EventSummary} from '../types/events';

const FAVORITES_KEY = 'favorites';

export const storage = new MMKV();

export const getStoredFavorites = (): Record<string, EventSummary> => {
  const favoritesString = storage.getString(FAVORITES_KEY);

  if (!favoritesString) {
    return {};
  }

  try {
    return JSON.parse(favoritesString) as Record<string, EventSummary>;
  } catch (error) {
    console.warn('Failed to parse favorites from MMKV', error);
    return {};
  }
};

export const persistFavorites = (favorites: Record<string, EventSummary>) => {
  storage.set(FAVORITES_KEY, JSON.stringify(favorites));
};
