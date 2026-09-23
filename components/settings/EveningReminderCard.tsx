import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ReminderField } from '@/components/ReminderField';
import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useReminders } from '@/providers/ReminderProvider';

export function EveningReminderCard() {
  const styles = useStyles(makeStyles);
  const { evening, setEvening } = useReminders();
  const [denied, setDenied] = useState(false);

  async function change(time: string | null) {
    const next = time === null ? { ...evening, enabled: false } : { enabled: true, time };
    setDenied(!(await setEvening(next)));
  }

  return (
    <View style={styles.card}>
      <ReminderField
        label="Pengingat malam"
        value={evening.enabled ? evening.time : null}
        defaultTime={evening.time}
        onChange={change}
      />
      <Txt variant="caption">Tidak muncul kalau tanaman hari itu sudah berbunga.</Txt>
      {denied && <Txt style={styles.error}>Izin notifikasi ditolak. Aktifkan di Pengaturan HP untuk Amalify.</Txt>}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: { ...clayOf(c), padding: space.md, gap: space.md },
    error: { color: c.destructive },
  });
