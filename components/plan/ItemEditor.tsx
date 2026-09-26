import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ReminderField } from '@/components/ReminderField';
import { ClayButton } from '@/components/ui/ClayButton';
import { TextField } from '@/components/ui/TextField';
import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, radius, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';
import { SECTIONS } from '@/domain/amalan';
import type { ItemDraft } from '@/domain/plan';
import { useReminders } from '@/providers/ReminderProvider';

type Props = { initial: ItemDraft; onSave: (draft: ItemDraft) => void; onCancel: () => void };

const KINDS: { id: ItemDraft['kind']; title: string }[] = [
  { id: 'check', title: 'Ceklis' },
  { id: 'count', title: 'Hitungan' },
];

export function ItemEditor({ initial, onSave, onCancel }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const [draft, setDraft] = useState(initial);
  const [target, setTarget] = useState(String(initial.target));
  const patch = (p: Partial<ItemDraft>) => setDraft((d) => ({ ...d, ...p }));
  const { requestPermission } = useReminders();
  const [denied, setDenied] = useState(false);

  async function setReminder(time: string | null) {
    const allowed = time === null || (await requestPermission());
    setDenied(!allowed);
    if (allowed) patch({ reminder: time ?? undefined });
  }

  const targetNumber = Number(target);
  const counted = draft.kind === 'count';
  const targetValid = !counted || (Number.isInteger(targetNumber) && targetNumber >= 1);
  const valid = draft.label.trim().length > 0 && targetValid;

  return (
    <View style={[clayOf(colors), styles.card]}>
      <TextField label="Nama amalan" value={draft.label} onChangeText={(label) => patch({ label })} maxLength={40} autoFocus />
      <Choice label="Bagian" options={SECTIONS} value={draft.section} onChange={(section) => patch({ section })} />
      <Choice label="Jenis" options={KINDS} value={draft.kind} onChange={(kind) => patch({ kind })} />
      {counted && (
        <View style={styles.pair}>
          <View style={styles.flex}>
            <TextField label="Target" value={target} onChangeText={setTarget} keyboardType="number-pad" maxLength={4} />
          </View>
          <View style={styles.flex}>
            <TextField label="Satuan" value={draft.unit} onChangeText={(unit) => patch({ unit })} maxLength={12} placeholder="halaman" />
          </View>
        </View>
      )}
      {!targetValid && <Txt style={{ color: colors.destructive }}>Target harus angka bulat, minimal 1.</Txt>}
      <ReminderField label="Pengingat" value={draft.reminder ?? null} defaultTime="05:00" onChange={setReminder} />
      {denied && <Txt style={{ color: colors.destructive }}>Izin notifikasi ditolak. Aktifkan di Pengaturan HP untuk Amalify.</Txt>}
      <View style={styles.pair}>
        <View style={styles.flex}>
          <ClayButton label="Batal" tone="soft" onPress={onCancel} />
        </View>
        <View style={styles.flex}>
          <ClayButton label="Simpan" disabled={!valid} onPress={() => onSave({ ...draft, target: counted ? targetNumber : 1 })} />
        </View>
      </View>
    </View>
  );
}

type ChoiceProps<T extends string> = {
  label: string;
  options: { id: T; title: string }[];
  value: T;
  onChange: (value: T) => void;
};

function Choice<T extends string>({ label, options, value, onChange }: ChoiceProps<T>) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  return (
    <View style={styles.choice} accessibilityRole="radiogroup" accessibilityLabel={label}>
      <Txt variant="bold">{label}</Txt>
      <View style={styles.chips}>
        {options.map((o) => {
          const active = o.id === value;
          return (
            <Pressable
              key={o.id}
              accessibilityRole="radio"
              aria-checked={active}
              onPress={() => onChange(o.id)}
              style={[styles.chip, active && styles.chipActive]}>
              <Txt variant="bold" style={active ? { color: colors.onPrimary } : undefined}>
                {o.title}
              </Txt>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: { padding: space.md, gap: space.md },
    pair: { flexDirection: 'row', gap: space.sm },
    flex: { flex: 1 },
    choice: { gap: space.xs },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
    chip: {
      minHeight: 44,
      justifyContent: 'center',
      paddingHorizontal: space.md,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card,
    },
    chipActive: { backgroundColor: c.primaryDeep, borderColor: c.primary },
  });
