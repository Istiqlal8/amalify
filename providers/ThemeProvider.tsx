import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { palettes, type Palette, type ThemeName } from '@/constants/theme';
import { DEFAULT_FLOWER, isFlowerId, type FlowerId } from '@/domain/flowers';

const THEME_KEY = 'amalify.theme.v1';
const FLOWER_KEY = 'amalify.flower.v1';

type ThemeState = {
  name: ThemeName;
  colors: Palette;
  flower: FlowerId;
  setTheme: (name: ThemeName) => void;
  setFlower: (flower: FlowerId) => void;
};

const ThemeContext = createContext<ThemeState | null>(null);

/** The look of the app, kept on this device: colour theme and the tree's flower. */
export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [name, setName] = useState<ThemeName>('pink');
  const [flower, setFlowerState] = useState<FlowerId>(DEFAULT_FLOWER);

  useEffect(() => {
    AsyncStorage.multiGet([THEME_KEY, FLOWER_KEY]).then(([[, theme], [, fl]]) => {
      if (theme && theme in palettes) setName(theme as ThemeName);
      if (fl && isFlowerId(fl)) setFlowerState(fl);
    });
  }, []);

  const setTheme = useCallback((next: ThemeName) => {
    setName(next);
    AsyncStorage.setItem(THEME_KEY, next);
  }, []);

  const setFlower = useCallback((next: FlowerId) => {
    setFlowerState(next);
    AsyncStorage.setItem(FLOWER_KEY, next);
  }, []);

  const value = useMemo(
    () => ({ name, colors: palettes[name], flower, setTheme, setFlower }),
    [name, flower, setTheme, setFlower],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeState {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside AppThemeProvider');
  return ctx;
}
