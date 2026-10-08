import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { palettes, type Palette, type ThemeName } from '@/constants/theme';
import { DEFAULT_FLOWER, isFlowerId, type FlowerId } from '@/domain/flowers';
import { clearDayFlower, flowerForDate, sanitizeDayFlowers, setDayFlower, type DayFlowers } from '@/domain/dayFlowers';
import { useProfile } from '@/providers/ProfileProvider';

const THEME_KEY = 'amalify.theme.v1';
const FLOWER_KEY = 'amalify.flower.v1';
const DAY_FLOWERS_KEY = 'amalify.dayFlowers.v1';

type ThemeState = {
  name: ThemeName;
  colors: Palette;
  /** Bunga default untuk hari baru / hari tanpa pilihan sendiri. */
  flower: FlowerId;
  /** Pilihan bunga per hari (dateKey -> FlowerId); hari tanpa entri ikut `flower`. */
  dayFlowers: DayFlowers;
  /** Bunga yang dipakai tanggal itu: override hari itu kalau ada, kalau tidak default. */
  flowerFor: (date: string) => FlowerId;
  setTheme: (name: ThemeName) => void;
  setFlower: (flower: FlowerId) => void;
  /** Pilih bunga khusus satu hari tanpa mengubah default maupun hari lain. */
  setFlowerFor: (date: string, flower: FlowerId) => void;
  /** Hapus pilihan hari itu supaya ikut default lagi. */
  clearFlowerFor: (date: string) => void;
};

/** The look of the app, kept on this device: colour theme, default flower and per-day flower picks. */
const ThemeContext = createContext<ThemeState | null>(null);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [name, setName] = useState<ThemeName>('pink');
  const [flower, setFlowerState] = useState<FlowerId>(DEFAULT_FLOWER);
  const [dayFlowers, setDayFlowers] = useState<DayFlowers>({});

  useEffect(() => {
    AsyncStorage.multiGet([THEME_KEY, FLOWER_KEY, DAY_FLOWERS_KEY]).then(([[, theme], [, fl], [, df]]) => {
      if (theme && theme in palettes) setName(theme as ThemeName);
      if (fl && isFlowerId(fl)) setFlowerState(fl);
      if (df) {
        try {
          setDayFlowers(sanitizeDayFlowers(JSON.parse(df)));
        } catch {
          // Corrupt cache: keep defaults.
        }
      }
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

  const flowerFor = useCallback((date: string) => flowerForDate(dayFlowers, date, flower), [dayFlowers, flower]);

  const setFlowerFor = useCallback((date: string, next: FlowerId) => {
    setDayFlowers((prev) => {
      const updated = setDayFlower(prev, date, next);
      if (updated !== prev) AsyncStorage.setItem(DAY_FLOWERS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearFlowerFor = useCallback((date: string) => {
    setDayFlowers((prev) => {
      const updated = clearDayFlower(prev, date);
      if (updated !== prev) AsyncStorage.setItem(DAY_FLOWERS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Laki-laki always get the dark "Malam" palette; their saved colour choice is ignored, not overwritten.
  const { isMale } = useProfile();
  const value = useMemo(
    () => ({ name, colors: isMale ? palettes.malam : palettes[name], flower, dayFlowers, flowerFor, setTheme, setFlower, setFlowerFor, clearFlowerFor }),
    [name, isMale, flower, dayFlowers, flowerFor, setTheme, setFlower, setFlowerFor, clearFlowerFor],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeState {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside AppThemeProvider');
  return ctx;
}
