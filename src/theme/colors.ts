import {type ColorSchemeName, useColorScheme} from 'react-native';
import {useAppSelector} from '../store/hooks';
import type {ThemePreference} from '../types/theme';

export interface ThemeColors {
  background: string;
  surface: string;
  card: string;
  text: string;
  muted: string;
  border: string;
  primary: string;
  danger: string;
}

const lightTheme: ThemeColors = {
  background: '#F5F7FB',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  text: '#0F172A',
  muted: '#475569',
  border: '#E2E8F0',
  primary: '#2563EB',
  danger: '#DC2626',
};

const darkTheme: ThemeColors = {
  background: '#020817',
  surface: '#0F172A',
  card: '#1E293B',
  text: '#F1F5F9',
  muted: '#94A3B8',
  border: '#1D283A',
  primary: '#38BDF8',
  danger: '#F87171',
};

const resolveThemeMode = (
  preference: ThemePreference,
  systemScheme: ColorSchemeName,
): 'light' | 'dark' => {
  if (preference === 'system') {
    return systemScheme === 'dark' ? 'dark' : 'light';
  }
  return preference;
};

export const useResolvedThemeMode = (): 'light' | 'dark' => {
  const preference = useAppSelector(state => state.theme.mode);
  const systemScheme = useColorScheme();
  return resolveThemeMode(preference, systemScheme);
};

export const useThemeColors = () => {
  const resolvedMode = useResolvedThemeMode();
  return resolvedMode === 'dark' ? darkTheme : lightTheme;
};

export {resolveThemeMode};
