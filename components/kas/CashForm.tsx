import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ClayButton } from '@/components/ui/ClayButton';
import { DateButton } from '@/components/ui/DateButton';
import { PillTabs } from '@/components/ui/PillTabs';
import { TextField } from '@/components/ui/TextField';
import { clayOf, type Palette, space } from '@/constants/theme';
import { parseRupiah } from '@/domain/cash';
import { useStyles } from '@/hooks/useStyles';
import type { CashDraft } from '@/services/cashService';

type Flow = 'masuk' | 'keluar';
type Props = { today: string; onSave: (draft: CashDraft) => void; onCancel: () => void };

const FLOWS: { id: Flow; label: string }[] = [
  { id: 'masuk', label: 'Masuk' },
  { id: 'keluar', label: 'Keluar' },
];

export function CashForm({ today, onSave, onCancel }: Props) {
  const styles = useStyles(makeStyles);
  const [flow, setFlow] = useState<Flow>('masuk');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [day, setDay] = useState(today);
  const value = parseRupiah(amount);

  function save() {
    onSave({ amount: flow === 'masuk' ? value : -value, note: note.trim(), day, duesFor: null, duesMonth: null });
  }

  return (
    <View style={styles.card}>
      <PillTabs options={FLOWS} value={flow} onChange={setFlow} />
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
