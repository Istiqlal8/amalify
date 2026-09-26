import { useState } from 'react';
import { Switch, StyleSheet, View } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, space } from '@/constants/theme';
import { toggleHaidLock, useHaidLock } from '@/hooks/useHaidLock';
import { useStyles } from '@/hooks/useStyles';
import { useLogs } from '@/providers/LogsProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { hideToday } from '@/services/groupService';
import { supabase } from '@/services/supabase';
import { isProgressHidden, setProgressHidden } from '@/storage/privacyPrefs';

/** Haid privacy: lock this menu, and keep the daily percentage (which dips on haid days) off the group. */
export function PrivacyCard() {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { today } = useLogs();
  const lock = useHaidLock();
  const [hidden, setHidden] = useState(isProgressHidden);
  const [error, setError] = useState<string | null>(null);

  async function toggleLock() {
    setError(null);
    await toggleHaidLock().catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)));
  }

  async function toggleHidden(value: boolean) {
    setHidden(value);
    await setProgressHidden(value);
    if (value && supabase) await hideToday(supabase, today).catch(() => undefined);
  }

  const track = { false: colors.border, true: colors.primary };
  return (
    <View style={[clayOf(colors), styles.card]}>
      <Txt variant="heading">Privasi</Txt>
      <View style={styles.row}>
        <Txt style={styles.flex}>Kunci menu Haid</Txt>
        <Switch accessibilityLabel="Kunci menu Haid" value={lock.enabled} onValueChange={toggleLock} trackColor={track} thumbColor={colors.card} />
      </View>
      <View style={styles.row}>
        <Txt style={styles.flex}>Sembunyikan progres harian dari grup</Txt>
        <Switch
          accessibilityLabel="Sembunyikan progres harian dari grup"
          value={hidden}
          onValueChange={toggleHidden}
          trackColor={track}
          thumbColor={colors.card}
        />
      </View>
      {error && <Txt style={{ color: colors.destructive }}>{error}</Txt>}
    </View>
  );
}

const makeStyles = (_: Palette) =>
  StyleSheet.create({
    card: { padding: space.md, gap: space.sm },
    row: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 48 },
    flex: { flex: 1 },
  });
