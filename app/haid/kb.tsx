import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { Chips } from '@/components/haid/Chips';
import { HaidScroll } from '@/components/haid/HaidScroll';
import { ClayButton } from '@/components/ui/ClayButton';
import { DateButton } from '@/components/ui/DateButton';
import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';
import { careOf, KB_TYPES, kbExpiry, kbInfo, withCare, type KbMethod, type KbType } from '@/domain/care';
import { daysBetween, formatDay } from '@/domain/cycle';
import { useLogs } from '@/providers/LogsProvider';
import { useReminders } from '@/providers/ReminderProvider';

function yearOf(day: string): string {
  return day.slice(0, 4);
}

export default function KbScreen() {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { haid, today, editHaid } = useLogs();
  const { requestPermission } = useReminders();
  const kb = careOf(haid).kb;
  const [type, setType] = useState<KbType>('suntik-3');
  const [start, setStart] = useState(today);
  const setKb = (next: KbMethod | undefined) => editHaid((h, now) => withCare(h, { ...careOf(h), kb: next }, now));

  function save() {
    requestPermission();
    setKb({ type, start });
  }

  function confirmRemove() {
    Alert.alert('Hapus catatan KB?', undefined, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => setKb(undefined) },
    ]);
  }

  if (kb) {
    const expiry = kbExpiry(kb);
    const left = daysBetween(today, expiry);
    return (
      <HaidScroll>
        <View style={[clayOf(colors), styles.card]}>
          <Txt variant="heading">{kbInfo(kb.type).label}</Txt>
          <Txt>{`Dipasang ${formatDay(kb.start)} ${yearOf(kb.start)}`}</Txt>
          <Txt variant="bold" style={{ color: left < 0 ? colors.destructive : colors.primaryDeep }}>
            {left >= 0 ? `Berlaku sampai ${formatDay(expiry)} ${yearOf(expiry)} (${left} hari lagi)` : `Lewat ${-left} hari`}
          </Txt>
          <ClayButton label="Hapus" tone="soft" onPress={confirmRemove} />
        </View>
      </HaidScroll>
    );
  }

  return (
    <HaidScroll>
      <View style={[clayOf(colors), styles.card]}>
        <Txt variant="heading" accessibilityRole="header">Metode</Txt>
        <Chips options={KB_TYPES} isOn={(id) => id === type} onToggle={(id) => setType(id as KbType)} />
        <View style={styles.row}>
          <Txt style={styles.flex}>Dipasang</Txt>
          <DateButton label="Dipasang" value={start} max={today} onChange={setStart} />
        </View>
        <ClayButton label="Simpan" onPress={save} />
      </View>
    </HaidScroll>
  );
}

const makeStyles = (_: Palette) =>
  StyleSheet.create({
    card: { padding: space.md, gap: space.md },
    row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
    flex: { flex: 1 },
  });
