import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ClayButton } from '@/components/ui/ClayButton';
import { PillTabs } from '@/components/ui/PillTabs';
import { TextField } from '@/components/ui/TextField';
import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, space } from '@/constants/theme';
import { parseRupiah, formatRupiah } from '@/domain/cash';
import { categoryLabel, EXPENSE_CATEGORIES, type BudgetStatus, type CustomCategory } from '@/domain/personalFinance';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';

type Props = {
  budgets: BudgetStatus[];
  cats: CustomCategory[];
  onSave: (category: string, limit: number | null) => void;
  onRemoveCategory: (id: string) => void;
};

export function BudgetCard({ budgets, cats, onSave, onRemoveCategory }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const [editing, setEditing] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const byCat = new Map(budgets.map((b) => [b.category, b]));
  const expenseCats = [
    ...EXPENSE_CATEGORIES.map((id) => ({ id, label: categoryLabel(id), custom: false })),
    ...cats.filter((c) => c.kind === 'keluar').map((c) => ({ id: c.id, label: c.label, custom: true })),
  ];

  function save(cat: string) {
    onSave(cat, parseRupiah(amount) > 0 ? parseRupiah(amount) : null);
    setEditing(null);
    setAmount('');
  }

  return (
    <View style={styles.card}>
      <Txt variant="bold">Budget bulanan</Txt>
      {budgets.length === 0 && <Txt variant="caption">Belum ada budget. Pilih kategori di bawah.</Txt>}
      {budgets.map((s) => (
        <View key={s.category} style={styles.row}>
          <View style={styles.flex}>
            <Txt variant="bold">{categoryLabel(s.category, cats)}</Txt>
            <Txt variant="caption" style={s.over ? { color: colors.destructive } : undefined}>
              {formatRupiah(s.spent)} / {formatRupiah(s.limit)}
            </Txt>
          </View>
          <ClayButton
            label="Ubah"
            tone="soft"
            onPress={() => {
              setAmount(String(s.limit));
              setEditing(s.category);
            }}
          />
          <ClayButton label="Hapus" tone="soft" onPress={() => onSave(s.category, null)} />
        </View>
      ))}
      {editing ? (
        <View style={styles.gap}>
          <TextField label={`Batas ${categoryLabel(editing, cats)} (Rp)`} value={amount} onChangeText={setAmount} keyboardType="number-pad" maxLength={13} placeholder="500000" />
          <ClayButton label="Simpan" disabled={parseRupiah(amount) <= 0} onPress={() => save(editing)} />
          <ClayButton label="Batal" tone="soft" onPress={() => setEditing(null)} />
        </View>
      ) : (
        <View style={styles.gap}>
          <Txt variant="bold">Tambah budget</Txt>
          <PillTabs
            options={expenseCats.filter((c) => !byCat.has(c.id)).map((c) => ({ id: c.id, label: c.label }))}
            value=""
            onChange={(id) => {
              setAmount('');
              setEditing(id);
            }}
          />
          {expenseCats.filter((c) => !byCat.has(c.id)).length > 0 && (
            <Txt variant="caption">Ketuk kategori untuk pasang batas.</Txt>
          )}
          {cats.length > 0 && (
            <View style={styles.gap}>
              <Txt variant="bold">Kategori bebas</Txt>
              {cats.map((c) => (
                <View key={c.id} style={styles.row}>
                  <Txt variant="bold" style={styles.flex}>
                    {c.label} · {c.kind === 'masuk' ? 'Masuk' : 'Keluar'}
                  </Txt>
                  <ClayButton label="Hapus" tone="soft" onPress={() => onRemoveCategory(c.id)} />
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: { ...clayOf(c), padding: space.md, gap: space.sm },
    row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
    flex: { flex: 1 },
    gap: { gap: space.sm },
  });
