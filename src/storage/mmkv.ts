// src/storage/mmkv.ts

import type {EventSummary} from '../types/events';

type MMKVLike = {
  getString: (key: string) => string | undefined;
  set: (key: string, value: string) => void;
};

// Try to load MMKV, but fall back to in-memory storage if it isn't available
let storage: MMKVLike;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mmkvModule = require('react-native-mmkv');

  const MMKVConstructor =
    mmkvModule?.MMKV ?? mmkvModule?.default ?? null;

  if (MMKVConstructor) {
    storage = new MMKVConstructor({
      id: 'event_explorer_favorites',
    });
  } else {
    console.warn(
      '[MMKV] No MMKV constructor available, falling back to in-memory storage.',
    );
    const memory: Record<string, string> = {};
    storage = {
      getString: (key: string) => memory[key],
      set: (key: string, value: string) => {
        memory[key] = value;
      },
    };
  }
} catch (error) {
  console.warn(
    '[MMKV] Failed to initialize MMKV, falling back to in-memory storage.',
    error,
  );
  const memory: Record<string, string> = {};
  storage = {
    getString: (key: string) => memory[key],
    set: (key: string, value: string) => {
      memory[key] = value;
    },
  };
}

const FAVORITES_KEY = 'favorites_v1';

export type FavoritesEntities = Record<string, EventSummary>;

export const getStoredFavorites = (): FavoritesEntities => {
  try {
    const raw = storage.getString(FAVORITES_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as unknown;

    if (!parsed || typeof parsed !== 'object') {
      return {};
    }

    return parsed as FavoritesEntities;
  } catch (error) {
    console.warn(
      '[MMKV] Failed to read favorites, falling back to empty.',
      error,
    );
    return {};
  }
};

export const persistFavorites = (entities: FavoritesEntities): void => {
  try {
    const serialized = JSON.stringify(entities);
    storage.set(FAVORITES_KEY, serialized);
  } catch (error) {
    console.warn('[MMKV] Failed to write favorites.', error);
  }
};
