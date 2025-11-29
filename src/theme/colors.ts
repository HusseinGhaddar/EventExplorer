import {useColorScheme} from 'react-native';

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

export const useThemeColors = () => {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkTheme : lightTheme;
};
