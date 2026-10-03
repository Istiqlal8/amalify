import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ClayButton } from '@/components/ui/ClayButton';
import { FormDialog } from '@/components/ui/FormDialog';
import { PickerSheet } from '@/components/ui/PickerSheet';
import { TextField } from '@/components/ui/TextField';
import { Txt } from '@/components/ui/Txt';
import { type Palette, radius, space } from '@/constants/theme';
import { CADENCES } from '@/domain/cadence';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';

import { EMPTY_DRAFT, KIND_OPTIONS, SECTION_OPTIONS, type FieldDraft } from './templateDraft';

type Pickers = 'section' | 'kind' | 'cadence' | null;

type Props = {
  /** Null when adding; a row when editing it. */
  draft: FieldDraft | null;
  onSave: (draft: FieldDraft) => void;
  onClose: () => void;
};

/** One row of the group list: what it is, how often, and — for a counted amalan — its target. */
export function FieldEditor({ draft, onSave, onClose }: Props) {
  const styles = useStyles(makeStyles);
  const [form, setForm] = useState<FieldDraft>(draft ?? { ...EMPTY_DRAFT, section: 'sholat' });
  const [picker, setPicker] = useState<Pickers>(null);
  const set = <K extends keyof FieldDraft>(key: K, value: FieldDraft[K]) => setForm((f) => ({ ...f, [key]: value }));

  const options = {
    section: SECTION_OPTIONS,
    kind: KIND_OPTIONS,
    cadence: CADENCES.map((c) => ({ id: c.id, label: c.label })),
  } as const;
  const value = { section: form.section, kind: form.kind, cadence: form.cadence };
  const label = <T extends string>(list: readonly { id: T; label: string }[], id: T) => list.find((o) => o.id === id)?.label ?? '';

  return (
    <FormDialog onClose={onClose}>
      <Txt variant="heading">{draft ? 'Ubah amalan' : 'Amalan baru'}</Txt>
      <TextField label="Nama amalan" value={form.label} onChangeText={(v) => set('label', v)} maxLength={40} autoFocus />
      <Choice label="Bagian" value={label(SECTION_OPTIONS, form.section)} onPress={() => setPicker('section')} />
      <Choice label="Jenis" value={label(KIND_OPTIONS, form.kind)} onPress={() => setPicker('kind')} />
      {form.kind === 'count' && (
        <View style={styles.pair}>
          <View style={styles.flex}>
            <TextField label="Target" value={form.target} onChangeText={(v) => set('target', v)} keyboardType="number-pad" maxLength={5} />
          </View>
          <View style={styles.flex}>
            <TextField label="Satuan" value={form.unit} onChangeText={(v) => set('unit', v)} maxLength={12} placeholder="halaman" />
          </View>
        </View>
      )}
      <Choice label="Jangka waktu" value={label(CADENCES, form.cadence)} onPress={() => setPicker('cadence')} />
      <ClayButton
        label="Simpan"
        disabled={form.label.trim() === '' || (form.kind === 'count' && Number(form.target) < 1)}
        onPress={() => onSave({ ...form, label: form.label.trim() })}
      />
      {picker && (
        <PickerSheet
          title={picker === 'section' ? 'Bagian' : picker === 'kind' ? 'Jenis' : 'Jangka waktu'}
          options={options[picker]}
          value={value[picker]}
          onPick={(id) => {
            set(picker, id as never);
            setPicker(null);
          }}
          onClose={() => setPicker(null)}
        />
      )}
    </FormDialog>
  );
}

/** A labelled row that opens a picker; the value is read-only here. */
function Choice({ label, value, onPress }: { label: string; value: string; onPress: () => void }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  return (
    <View style={styles.wrap}>
      <Txt variant="bold">{label}</Txt>
      <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={styles.choice}>
        <Txt style={styles.flex}>{value}</Txt>
        <Txt variant="caption" style={{ color: colors.primaryDeep }}>Ubah</Txt>
      </Pressable>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    pair: { flexDirection: 'row', gap: space.md },
    flex: { flex: 1 },
    wrap: { gap: space.xs },
    choice: {
      minHeight: 48,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.md,
      paddingHorizontal: space.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card,
    },
  });
