import { Stack } from 'expo-router';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { type Palette, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';
import { stackHeader } from '@/components/ui/stackHeader';

import { SoftBackdrop } from './SoftBackdrop';

type Props = { title: string; children: ReactNode; /** Pinned above the scrolling body. */ header?: ReactNode };

/** A pushed screen: themed header with a back arrow, scrolling body. */
export function StackScreen({ title, children, header }: Props) {
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
        {header && <View style={styles.header}>{header}</View>}
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
    header: { paddingHorizontal: space.md, paddingTop: space.md },
    content: { padding: space.md, gap: space.md, paddingBottom: space.xl },
  });
