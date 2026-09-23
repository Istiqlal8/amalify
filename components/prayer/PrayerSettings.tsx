import { Link } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Switch, View } from 'react-native';

import { ClayButton } from '@/components/ui/ClayButton';
import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';
import { usePrayer } from '@/providers/PrayerProvider';
import { useReminders } from '@/providers/ReminderProvider';
import { openExactAlarmSettings } from '@/services/exactAlarm';

export function PrayerSettings() {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { city, adzan, setAdzan } = usePrayer();
  const { requestPermission } = useReminders();
  const [denied, setDenied] = useState(false);

  async function toggle(on: boolean) {
    const allowed = !on || (await requestPermission());
    setDenied(!allowed);
    if (allowed) setAdzan(on);
  }

  return (
    <View style={[clayOf(colors), styles.card]}>
      <Link href="/city" asChild>
        <Pressable accessibilityRole="button" style={styles.row}>
          <Txt variant="bold" style={styles.flex}>Kota</Txt>
          <Txt style={{ color: colors.primaryDeep }}>{city?.name ?? 'Pilih'}</Txt>
        </Pressable>
      </Link>
      <View style={styles.row}>
        <Txt variant="bold" style={styles.flex}>Pengingat adzan</Txt>
        <Switch
          accessibilityLabel="Pengingat adzan"
          disabled={!city}
          value={adzan}
          onValueChange={toggle}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.card}
        />
      </View>
      {denied && <Txt style={{ color: colors.destructive }}>Izin notifikasi ditolak. Aktifkan di Pengaturan HP untuk Amalify.</Txt>}
      {adzan && Platform.OS === 'android' && (
        <>
          <Txt variant="caption">Tanpa izin “Alarm & pengingat”, Android bisa menunda notifikasi hingga 1 jam.</Txt>
          <ClayButton label="Izinkan alarm tepat waktu" tone="soft" onPress={openExactAlarmSettings} />
        </>
      )}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: { padding: space.md, gap: space.md },
    row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 48 },
    flex: { flex: 1 },
  });
