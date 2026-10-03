import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { ClayButton } from '@/components/ui/ClayButton';
import { DateButton } from '@/components/ui/DateButton';
import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';
import { addDays } from '@/domain/cycle';
import { addPeriod, editPeriod, saveOpenPeriod, type Period } from '@/domain/haid';
import { useLogs } from '@/providers/LogsProvider';

type Props = { period?: Period; onDone?: () => void };

/**
 * Records a period that was never marked, so predictions have history to work from;
 * with `period`, changes its dates. A running period (no end) can be moved, closed
 * on a chosen end date, or kept running.
 */
export function PeriodForm({ period, onDone }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { haid, today, addHaid, moveHaid, saveOpenPeriod: persistOpen } = useLogs();
  const isOpen = period !== undefined && period.end === undefined;
  const [start, setStart] = useState(period?.start ?? addDays(today, -30));
  const [end, setEnd] = useState(period?.end ?? today);
  const [running, setRunning] = useState(isOpen);

  function save() {
    if (isOpen) {
      const nextEnd = running ? undefined : end;
      if (period && start === period.start && nextEnd === period.end) {
        onDone?.();
        return;
      }
      const next = saveOpenPeriod(haid, start, nextEnd, today, 0);
      if (next === haid) {
        Alert.alert('Tanggal bertabrakan', 'Pilih rentang yang tidak menimpa catatan haid lain dan tidak melewati hari ini.');
        return;
      }
      persistOpen(start, nextEnd ?? null);
      onDone?.();
      return;
    }
    const next = period ? editPeriod(haid, period.start, start, end, today, 0) : addPeriod(haid, start, end, today, 0);
    if (next === haid) {
      Alert.alert('Tanggal bertabrakan', 'Pilih rentang yang tidak menimpa catatan haid lain dan tidak melewati hari ini.');
      return;
    }
    if (period) moveHaid(period.start, start, end);
    else addHaid(start, end);
    onDone?.();
  }

  return (
    <View style={[clayOf(colors), styles.card]}>
      <Txt variant="heading" accessibilityRole="header">{isOpen ? 'Ubah haid berjalan' : period ? 'Ubah haid' : 'Tambah haid lama'}</Txt>
      <View style={styles.row}>
        <Txt style={styles.flex}>Mulai</Txt>
        <DateButton label="Mulai" value={start} max={today} onChange={setStart} />
      </View>
      {isOpen ? (
        <>
          <View style={styles.row}>
            <Txt style={styles.flex}>Selesai</Txt>
            {running ? (
              <Txt variant="caption">Masih berjalan</Txt>
            ) : (
              <DateButton label="Selesai" value={end} min={start} max={today} onChange={setEnd} />
            )}
          </View>
          <ClayButton label={running ? 'Sudah selesai (isi tanggal)' : 'Masih berjalan'} tone="soft" onPress={() => setRunning((r) => !r)} />
        </>
      ) : (
        <View style={styles.row}>
          <Txt style={styles.flex}>Selesai</Txt>
          <DateButton label="Selesai" value={end} min={start} max={today} onChange={setEnd} />
        </View>
      )}
      <ClayButton label="Simpan" tone="soft" onPress={save} />
      {onDone && <ClayButton label="Batal" tone="soft" onPress={onDone} />}
    </View>
  );
}

const makeStyles = (_: Palette) =>
  StyleSheet.create({
    card: { padding: space.md, gap: space.md },
    row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
    flex: { flex: 1 },
  });
