import { Stack } from 'expo-router';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fonts, type Palette, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';

/** A pushed screen: themed header with a back arrow, scrolling body. */
export function StackScreen({ title, children }: { title: string; children: ReactNode }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <Stack.Screen
        options={{
          title,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.primaryDeep,
          headerTitleStyle: { fontFamily: fonts.display },
          headerShadowVisible: false,
        }}
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
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
