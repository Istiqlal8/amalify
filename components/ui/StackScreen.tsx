import { Stack } from 'expo-router';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { type Palette, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';
import { stackHeader } from '@/components/ui/stackHeader';

import { SoftBackdrop } from './SoftBackdrop';

/** A pushed screen: themed header with a back arrow, scrolling body. */
export function StackScreen({ title, children }: { title: string; children: ReactNode }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  return (
    <View style={styles.root}>
      <SoftBackdrop />
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <Stack.Screen
          options={{
            title,
            ...stackHeader(colors),
          }}
        />
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
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
