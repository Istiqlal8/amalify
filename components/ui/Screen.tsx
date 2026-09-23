import type { ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { type Palette, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';

import { Txt } from './Txt';

export function Screen({ title, children }: { title: string; children: ReactNode }) {
  const styles = useStyles(makeStyles);
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Txt variant="title" accessibilityRole="header">
          {title}
        </Txt>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.background },
    content: { padding: space.md, gap: space.md, paddingBottom: space.xl },
  });
