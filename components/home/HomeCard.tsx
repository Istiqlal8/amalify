import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { clayOf, type Palette, radius, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';

// Checked once: it depends on the OS and the build, not on anything that changes at runtime.
const LIQUID_GLASS = isLiquidGlassAvailable();

/**
 * The layer each Beranda section sits on: iOS 26 liquid glass where the system has it, elsewhere the
 * shared see-through clay pane.
 */
export function HomeCard({ children }: { children: ReactNode }) {
  const styles = useStyles(makeStyles);
  if (LIQUID_GLASS) {
    return (
      <GlassView glassEffectStyle="regular" style={[styles.base, styles.liquid]}>
        {children}
      </GlassView>
    );
  }
  return <View style={[styles.base, styles.pane]}>{children}</View>;
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    base: { padding: space.md, gap: space.md },
    liquid: { borderRadius: radius.lg },
    pane: clayOf(c),
  });
