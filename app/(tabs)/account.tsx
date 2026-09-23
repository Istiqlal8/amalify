import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { PrayerSettings } from '@/components/prayer/PrayerSettings';
import { ThemePicker } from '@/components/ThemePicker';
import { ReminderField } from '@/components/ReminderField';
import { ClayButton } from '@/components/ui/ClayButton';
import { Screen } from '@/components/ui/Screen';
import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';
import type { SyncStatus } from '@/hooks/useDriveSync';
import { useAuth } from '@/providers/AuthProvider';
import { useLogs } from '@/providers/LogsProvider';
import { useReminders } from '@/providers/ReminderProvider';

const SYNC_LABEL: Record<SyncStatus, string> = {
  offline: 'Tersimpan di perangkat',
  syncing: 'Menyinkronkan…',
  synced: 'Tersimpan di Google Drive',
  error: 'Gagal sinkron, dicoba lagi saat ada perubahan',
};

export default function AccountScreen() {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { user, signIn, signOut } = useAuth();
  const { sync } = useLogs();
  const { evening, setEvening } = useReminders();
  const [error, setError] = useState<string | null>(null);
  const [denied, setDenied] = useState(false);

  async function changeEvening(time: string | null) {
    const next = time === null ? { ...evening, enabled: false } : { enabled: true, time };
    setDenied(!(await setEvening(next)));
  }

  async function run(action: () => Promise<void>) {
    setError(null);
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <Screen title="Akun">
      <View style={[clayOf(colors), styles.card]}>
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
        {error && <Txt style={{ color: colors.destructive }}>{error}</Txt>}
      </View>
      <ThemePicker />
      <PrayerSettings />
      <View style={[clayOf(colors), styles.card]}>
        <ReminderField
          label="Pengingat malam"
          value={evening.enabled ? evening.time : null}
          defaultTime={evening.time}
          onChange={changeEvening}
        />
        <Txt variant="caption">Tidak muncul kalau tanaman hari itu sudah berbunga.</Txt>
        {denied && <Txt style={{ color: colors.destructive }}>Izin notifikasi ditolak. Aktifkan di Pengaturan HP untuk Amalify.</Txt>}
      </View>
    </Screen>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: { padding: space.md, gap: space.md },
  });
