import { useMemo } from 'react';

import { chromeOf, type FarmChrome } from '@/constants/farm';
import { useTheme } from '@/providers/ThemeProvider';

/** The garden chrome, derived from the active app palette and rebuilt only when the theme changes. */
export function useFarmChrome(): FarmChrome {
  const { colors } = useTheme();
  return useMemo(() => chromeOf(colors), [colors]);
}
