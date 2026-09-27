import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ClayButton } from '@/components/ui/ClayButton';
import { DateButton } from '@/components/ui/DateButton';
import { PillTabs } from '@/components/ui/PillTabs';
import { TextField } from '@/components/ui/TextField';
import { clayOf, type Palette, space } from '@/constants/theme';
import { type CashEntry, parseRupiah } from '@/domain/cash';
import { useStyles } from '@/hooks/useStyles';
import type { CashDraft } from '@/services/cashService';

type Flow = 'masuk' | 'keluar';
/** `initial` fills the form when editing; a dues payment stays money in. */
type Props = { today: string; initial?: CashEntry; onSave: (draft: CashDraft) => void; onCancel: () => void };

const FLOWS: { id: Flow; label: string }[] = [
  { id: 'masuk', label: 'Masuk' },
  { id: 'keluar', label: 'Keluar' },
];

export function CashForm({ today, initial, onSave, onCancel }: Props) {
  const styles = useStyles(makeStyles);
  const [flow, setFlow] = useState<Flow>(initial && initial.amount < 0 ? 'keluar' : 'masuk');
  const [amount, setAmount] = useState(initial ? String(Math.abs(initial.amount)) : '');
  const [note, setNote] = useState(initial?.note ?? '');
  const [day, setDay] = useState(initial?.day ?? today);
  const isDues = initial?.duesMonth != null;
  const value = parseRupiah(amount);

  function save() {
    onSave({ amount: flow === 'masuk' ? value : -value, note: note.trim(), day, duesFor: initial?.duesFor ?? null, duesMonth: initial?.duesMonth ?? null });
  }

  return (
    <View style={styles.card}>
      {!isDues && <PillTabs options={FLOWS} value={flow} onChange={setFlow} />}
      <TextField label="Nominal (Rp)" value={amount} onChangeText={setAmount} keyboardType="number-pad" maxLength={13} placeholder="50000" />
      <TextField label="Keterangan" value={note} onChangeText={setNote} maxLength={80} placeholder="Snack kajian" />
      <DateButton label="Tanggal" value={day} max={today} onChange={setDay} />
      <ClayButton label="Simpan" disabled={value === 0 || note.trim() === ''} onPress={save} />
      <ClayButton label="Batal" tone="soft" onPress={onCancel} />
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: { ...clayOf(c), padding: space.md, gap: space.sm, alignItems: 'stretch' },
  });
