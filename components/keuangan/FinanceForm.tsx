import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ClayButton } from '@/components/ui/ClayButton';
import { DateButton } from '@/components/ui/DateButton';
import { PillTabs } from '@/components/ui/PillTabs';
import { TextField } from '@/components/ui/TextField';
import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, space } from '@/constants/theme';
import { parseRupiah } from '@/domain/cash';
import {
  categoryLabel,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  validateCategoryLabel,
  validateDraft,
  type CustomCategory,
  type FinanceDraft,
  type FinanceKind,
} from '@/domain/personalFinance';
import { useStyles } from '@/hooks/useStyles';

type Props = {
  today: string;
  /** A saved entry being edited, or a draft read off a receipt. */
  initial?: FinanceDraft;
  cats: CustomCategory[];
  onAddCategory: (kind: FinanceKind, label: string) => string | null;
  onSave: (draft: FinanceDraft) => void;
  onCancel: () => void;
};

const KINDS: { id: FinanceKind; label: string }[] = [
  { id: 'keluar', label: 'Keluar' },
  { id: 'masuk', label: 'Masuk' },
];

const NEW_ID = '__new__';

export function FinanceForm({ today, initial, cats, onAddCategory, onSave, onCancel }: Props) {
  const styles = useStyles(makeStyles);
  const [kind, setKind] = useState<FinanceKind>(initial?.kind ?? 'keluar');
  const [amount, setAmount] = useState(initial?.amount ? String(initial.amount) : '');
  const [category, setCategory] = useState<string>(initial?.category ?? 'makan');
  const [note, setNote] = useState(initial?.note ?? '');
  const [day, setDay] = useState(initial?.day ?? today);
  const [newName, setNewName] = useState('');
  const defaults = kind === 'masuk' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const options = [...defaults.map((id) => ({ id, label: categoryLabel(id) })), ...cats.filter((c) => c.kind === kind).map((c) => ({ id: c.id, label: c.label }))];
  if (!options.some((o) => o.id === category)) options.push({ id: category, label: categoryLabel(category, cats) });
  const draft: FinanceDraft = { kind, amount: parseRupiah(amount), category, note: note.trim(), day };
  const error = validateDraft(draft);
  const nameError = category === NEW_ID ? validateCategoryLabel(newName, cats) : null;

  function pickKind(next: FinanceKind) {
    setKind(next);
    const allowed = [...(next === 'masuk' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES), ...cats.filter((c) => c.kind === next).map((c) => c.id)];
    if (!allowed.includes(category)) setCategory(next === 'masuk' ? 'gaji' : 'makan');
  }

  function save() {
    if (category === NEW_ID) {
      const id = onAddCategory(kind, newName);
      if (!id) return;
      onSave({ ...draft, category: id });
      return;
    }
    onSave(draft);
  }

  return (
    <View style={styles.card}>
      <PillTabs options={KINDS} value={kind} onChange={pickKind} />
      <TextField label="Nominal (Rp)" value={amount} onChangeText={setAmount} keyboardType="number-pad" maxLength={13} placeholder="50000" />
      <View style={styles.gap}>
        <Txt variant="bold">Kategori</Txt>
        <PillTabs options={[...options, { id: NEW_ID, label: '+ Baru' }]} value={category} onChange={setCategory} />
      </View>
      {category === NEW_ID && (
        <TextField label="Nama kategori baru" value={newName} onChangeText={setNewName} maxLength={20} placeholder="cth: Parkir" />
      )}
      <TextField label="Keterangan" value={note} onChangeText={setNote} maxLength={80} placeholder="Makan siang" />
      <DateButton label="Tanggal" value={day} max={today} onChange={setDay} />
      <ClayButton label="Simpan" disabled={error !== null || nameError !== null} onPress={save} />
      <ClayButton label="Batal" tone="soft" onPress={onCancel} />
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: { ...clayOf(c), padding: space.md, gap: space.sm, alignItems: 'stretch' },
    gap: { gap: space.xs },
  });
