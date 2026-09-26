import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Floating pill (64 + 8 gap) plus room for the murottal mini player above it.
const OVERLAY = 150;

/** Bottom padding a tab screen needs so its last content can scroll clear of the floating tab bar. */
export function useTabBarSpace(): number {
  return useSafeAreaInsets().bottom + OVERLAY;
}
