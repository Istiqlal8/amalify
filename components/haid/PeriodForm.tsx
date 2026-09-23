import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { ClayButton } from '@/components/ui/ClayButton';
import { DateButton } from '@/components/ui/DateButton';
import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';
import { addDays } from '@/domain/cycle';
import { addPeriod } from '@/domain/haid';
import { useLogs } from '@/providers/LogsProvider';

/** Records a period that was never marked, so predictions have history to work from. */
export function PeriodForm() {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { haid, today, addHaid } = useLogs();
  const [start, setStart] = useState(addDays(today, -30));
  const [end, setEnd] = useState(addDays(today, -25));

  function save() {
    if (addPeriod(haid, start, end, today, 0) === haid) {
      Alert.alert('Tanggal bertabrakan', 'Pilih rentang yang tidak menimpa catatan haid lain dan tidak melewati hari ini.');
      return;
    }
    addHaid(start, end);
  }

  return (
    <View style={[clayOf(colors), styles.card]}>
      <Txt variant="heading" accessibilityRole="header">Tambah haid lama</Txt>
      <View style={styles.row}>
        <Txt style={styles.flex}>Mulai</Txt>
        <DateButton label="Mulai" value={start} max={today} onChange={setStart} />
      </View>
      <View style={styles.row}>
        <Txt style={styles.flex}>Selesai</Txt>
        <DateButton label="Selesai" value={end} min={start} max={today} onChange={setEnd} />
      </View>
      <ClayButton label="Simpan" tone="soft" onPress={save} />
    </View>
  );
}

const makeStyles = (_: Palette) =>
  StyleSheet.create({
    card: { padding: space.md, gap: space.md },
    row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
    flex: { flex: 1 },
  });
