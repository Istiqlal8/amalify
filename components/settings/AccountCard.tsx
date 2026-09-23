import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ClayButton } from '@/components/ui/ClayButton';
import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, space } from '@/constants/theme';
import type { SyncStatus } from '@/hooks/useDriveSync';
import { useStyles } from '@/hooks/useStyles';
import { useAuth } from '@/providers/AuthProvider';
import { useLogs } from '@/providers/LogsProvider';

export const SYNC_LABEL: Record<SyncStatus, string> = {
  offline: 'Tersimpan di perangkat',
  syncing: 'Menyinkronkan…',
  synced: 'Tersimpan di Google Drive',
  error: 'Gagal sinkron, dicoba lagi saat ada perubahan',
};

export function AccountCard() {
  const styles = useStyles(makeStyles);
  const { user, signIn, signOut } = useAuth();
  const { sync } = useLogs();
  const [error, setError] = useState<string | null>(null);

  async function run(action: () => Promise<void>) {
    setError(null);
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <View style={styles.card}>
      {user ? (
        <>
          <Txt variant="heading">{user.user.name ?? user.user.email}</Txt>
          <Txt variant="caption">{user.user.email}</Txt>
        </>
      ) : (
        <Txt>Catatan amalan disimpan di Google Drive milikmu sendiri.</Txt>
      )}
      <Txt variant="bold">{SYNC_LABEL[sync]}</Txt>
      {user ? (
        <ClayButton label="Keluar" tone="soft" onPress={() => run(signOut)} />
      ) : (
        <ClayButton label="Masuk dengan Google" onPress={() => run(signIn)} />
      )}
      {error && <Txt style={styles.error}>{error}</Txt>}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: { ...clayOf(c), padding: space.md, gap: space.md },
    error: { color: c.destructive },
  });
