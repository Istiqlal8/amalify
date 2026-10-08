import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

import { lockPortrait, unlockOrientation } from './orientation';

/**
 * Lets a screen rotate into either landscape while it is focused, then hands the app back to
 * portrait when it is left. The garden is the only place where landscape helps; every other
 * screen assumes portrait, so we do not want the unlock to leak across navigation. Safe on builds
 * without the native module (Expo Go): the calls simply do nothing.
 */
export function useLandscape() {
  useFocusEffect(
    useCallback(() => {
      unlockOrientation();
      return () => lockPortrait();
    }, []),
  );
}
