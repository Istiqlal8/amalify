import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { type Palette, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTabBarSpace } from '@/hooks/useTabBarSpace';

import { SoftBackdrop } from './SoftBackdrop';
import { Txt } from './Txt';

export function Screen({ title, children }: { title: string; children: ReactNode }) {
  const styles = useStyles(makeStyles);
  const tabBarSpace = useTabBarSpace();
  return (
    <View style={styles.root}>
      <SoftBackdrop />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: tabBarSpace }]}>
          <Txt variant="title" accessibilityRole="header">
            {title}
          </Txt>
          {children}
        </ScrollView>
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
