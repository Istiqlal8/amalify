import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ClayButton } from '@/components/ui/ClayButton';
import { PillTabs } from '@/components/ui/PillTabs';
import { TextField } from '@/components/ui/TextField';
import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, space } from '@/constants/theme';
import { type DuesPeriod, formatPeriodStart, formatRupiah } from '@/domain/cash';
import { useStyles } from '@/hooks/useStyles';

type Props = {
  memberName: string;
  /** Dues for one period. */
  amount: number;
  period: DuesPeriod;
  /** The member's unpaid periods, earliest first; the payment covers them from the top. */
  starts: string[];
  onSave: (starts: string[]) => void;
  onCancel: () => void;
};

const PRESETS = [1, 3, 6, 12].map((n) => ({ id: String(n), label: `${n}x` }));

/** Periods a payment skips over are already paid, so first and last say more than a count. */
function rangeLabel(picked: string[], period: DuesPeriod): string {
  const first = formatPeriodStart(picked[0], period);
  return picked.length === 1 ? first : `${first} s/d ${formatPeriodStart(picked[picked.length - 1], period)}`;
}

/** Pay several periods in one go, starting at the member's first unpaid one. */
export function DuesPayForm({ memberName, amount, period, starts, onSave, onCancel }: Props) {
  const styles = useStyles(makeStyles);
  const [draft, setDraft] = useState('1');
  const count = Math.min(Number(draft.replace(/\D/g, '')) || 0, starts.length);
  const picked = starts.slice(0, count);
  const unit = period === 'week' ? 'pekan' : 'bulan';
  return (
    <View style={styles.card}>
      <Txt variant="heading" numberOfLines={1}>
        Bayar iuran {memberName}
      </Txt>
      <PillTabs options={PRESETS} value={draft} onChange={setDraft} />
      <TextField label={`Jumlah ${unit}`} value={draft} onChangeText={setDraft} keyboardType="number-pad" maxLength={2} placeholder="1" />
      <Txt variant="caption">{count === 0 ? `Isi jumlah ${unit}` : `${rangeLabel(picked, period)} · ${formatRupiah(amount * count)}`}</Txt>
      <ClayButton label="Simpan" disabled={count === 0} onPress={() => onSave(picked)} />
      <ClayButton label="Batal" tone="soft" onPress={onCancel} />
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: { ...clayOf(c), padding: space.md, gap: space.sm },
  });
