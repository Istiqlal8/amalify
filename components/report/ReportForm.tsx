import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ClayButton } from '@/components/ui/ClayButton';
import { DateButton } from '@/components/ui/DateButton';
import { TextField } from '@/components/ui/TextField';
import { TimeButton } from '@/components/ui/TimeButton';
import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, space } from '@/constants/theme';
import type { ReportDraft, ReportEntry } from '@/domain/groupReport';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';

type Props = { initial: ReportDraft; today: string; onSave: (draft: ReportDraft) => void; onCancel: () => void };

/** When and where the group met, then one input per report field. */
export function ReportForm({ initial, today, onSave, onCancel }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const [day, setDay] = useState(initial.day);
  const [time, setTime] = useState(initial.time);
  const [location, setLocation] = useState(initial.location);
  const [entries, setEntries] = useState<ReportEntry[]>(initial.entries);
  const setValue = (i: number, value: string) => setEntries((es) => es.map((e, j) => (j === i ? { ...e, value } : e)));

  return (
    <View style={[clayOf(colors), styles.card]}>
      <Txt variant="heading">Laporan pertemuan</Txt>
      <View style={styles.row}>
        <View style={styles.flex}>
          <DateButton label="Tanggal" value={day} max={today} onChange={setDay} />
        </View>
        <TimeButton label="Jam" value={time} onChange={setTime} />
      </View>
      <TextField label="Lokasi" value={location} onChangeText={setLocation} maxLength={120} placeholder="Masjid Al-Ikhlas" />
      {entries.map((e, i) => (
        <TextField
          key={e.label}
          label={e.kind === 'number' && e.unit ? `${e.label} (${e.unit})` : e.label}
          value={e.value}
          onChangeText={(v) => setValue(i, e.kind === 'number' ? v.replace(/[^0-9.,]/g, '') : v)}
          keyboardType={e.kind === 'number' ? 'decimal-pad' : 'default'}
          multiline={e.kind === 'long'}
          numberOfLines={e.kind === 'long' ? 4 : 1}
          textAlignVertical={e.kind === 'long' ? 'top' : 'center'}
          maxLength={e.kind === 'long' ? 2000 : 200}
        />
      ))}
      <ClayButton label="Simpan" onPress={() => onSave({ day, time, location: location.trim(), entries })} />
      <ClayButton label="Batal" tone="soft" onPress={onCancel} />
    </View>
  );
}

const makeStyles = (_: Palette) =>
  StyleSheet.create({
    card: { padding: space.md, gap: space.md },
    row: { flexDirection: 'row', gap: space.md, alignItems: 'flex-end' },
    flex: { flex: 1 },
  });
