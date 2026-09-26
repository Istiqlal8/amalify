import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { type Palette, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';

import { SoftBackdrop } from './SoftBackdrop';

/** Scrolling body of a screen whose header comes from its stack. */
export function SubScreen({ children }: { children: ReactNode }) {
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.root}>
      <SoftBackdrop />
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
      </SafeAreaView>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.card },
    safe: { flex: 1 },
    content: { padding: space.md, gap: space.md, paddingBottom: space.xl },
  });
