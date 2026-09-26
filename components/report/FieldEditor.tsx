import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ClayButton } from '@/components/ui/ClayButton';
import { PillTabs } from '@/components/ui/PillTabs';
import { TextField } from '@/components/ui/TextField';
import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, radius, space } from '@/constants/theme';
import { KINDS, MAX_FIELDS, newField, type FieldKind, type ReportField } from '@/domain/groupReport';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';

type Props = { initial: ReportField[]; onSave: (fields: ReportField[]) => void; onCancel: () => void };

const kindLabel = (k: FieldKind) => KINDS.find((x) => x.id === k)!.label;

/** The creator's editor for which fields a weekly report asks. */
export function FieldEditor({ initial, onSave, onCancel }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const [fields, setFields] = useState(initial);
  const [label, setLabel] = useState('');
  const [kind, setKind] = useState<FieldKind>('text');
  const [unit, setUnit] = useState('');
  const taken = fields.some((f) => f.label.toLowerCase() === label.trim().toLowerCase());

  function add() {
    setFields((fs) => [...fs, newField(label, kind, unit, Date.now())]);
    setLabel('');
    setUnit('');
  }

  const move = (i: number, by: number) =>
    setFields((fs) => {
      const next = [...fs];
      [next[i], next[i + by]] = [next[i + by], next[i]];
      return next;
    });

  return (
    <View style={[clayOf(colors), styles.card]}>
      <Txt variant="heading">Format laporan</Txt>
      <Txt variant="caption">Tanggal, jam dan lokasi selalu ada. Atur isian lainnya di sini.</Txt>
      {fields.map((f, i) => (
        <View key={f.id} style={[styles.field, { borderColor: colors.border }]}>
          <View style={styles.flex}>
            <Txt variant="bold">{f.label}</Txt>
            <Txt variant="caption">{f.unit ? `${kindLabel(f.kind)} · ${f.unit}` : kindLabel(f.kind)}</Txt>
          </View>
          <Step label="↑" hint="Naikkan" disabled={i === 0} onPress={() => move(i, -1)} />
          <Step label="↓" hint="Turunkan" disabled={i === fields.length - 1} onPress={() => move(i, 1)} />
          <Step label="✕" hint={`Hapus ${f.label}`} onPress={() => setFields((fs) => fs.filter((x) => x.id !== f.id))} />
        </View>
      ))}
      {fields.length < MAX_FIELDS && (
        <View style={styles.add}>
          <TextField label="Isian baru" value={label} onChangeText={setLabel} maxLength={40} placeholder="Hafalan" />
          <PillTabs options={KINDS} value={kind} onChange={setKind} />
          {kind === 'number' && <TextField label="Satuan" value={unit} onChangeText={setUnit} maxLength={20} placeholder="ayat" />}
          <ClayButton label="Tambah isian" tone="soft" disabled={!label.trim() || taken} onPress={add} />
        </View>
      )}
      <ClayButton label="Simpan format" onPress={() => onSave(fields)} />
      <ClayButton label="Batal" tone="soft" onPress={onCancel} />
    </View>
  );
}

function Step({ label, hint, disabled = false, onPress }: { label: string; hint: string; disabled?: boolean; onPress: () => void }) {
  const styles = useStyles(makeStyles);
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={hint} disabled={disabled} onPress={onPress} style={[styles.step, disabled && styles.off]}>
      <Txt variant="bold">{label}</Txt>
    </Pressable>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: { padding: space.md, gap: space.md },
    field: { flexDirection: 'row', alignItems: 'center', gap: space.xs, padding: space.sm, borderRadius: radius.md, borderWidth: 1 },
    flex: { flex: 1 },
    add: { gap: space.sm, paddingTop: space.sm, borderTopWidth: 1, borderTopColor: c.border },
    step: { width: 40, height: 40, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: c.muted },
    off: { opacity: 0.35 },
  });
