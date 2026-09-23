import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { palettes, type Palette, type ThemeName } from '@/constants/theme';

const KEY = 'amalify.theme.v1';

type ThemeState = { name: ThemeName; colors: Palette; setTheme: (name: ThemeName) => void };

const ThemeContext = createContext<ThemeState | null>(null);

/** The chosen colour theme, kept on this device. */
export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [name, setName] = useState<ThemeName>('pink');

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((raw) => {
      if (raw && raw in palettes) setName(raw as ThemeName);
    });
  }, []);

  const setTheme = useCallback((next: ThemeName) => {
    setName(next);
    AsyncStorage.setItem(KEY, next);
  }, []);

  const value = useMemo(() => ({ name, colors: palettes[name], setTheme }), [name, setTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeState {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside AppThemeProvider');
  return ctx;
}
