import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ClayButton } from '@/components/ui/ClayButton';
import { PillTabs } from '@/components/ui/PillTabs';
import { TextField } from '@/components/ui/TextField';
import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, space } from '@/constants/theme';
import { type DuesPeriod, formatRupiah, parseRupiah } from '@/domain/cash';
import { useStyles } from '@/hooks/useStyles';
import type { MemberToday } from '@/services/groupService';

type Props = {
  amount: number | null;
  period: DuesPeriod;
  members: MemberToday[];
  paid: Set<string>;
  onSet: (amount: number | null, period: DuesPeriod) => void;
  onPay: (member: MemberToday) => void;
};

const PERIODS: { id: DuesPeriod; label: string }[] = [
  { id: 'week', label: 'Pekanan' },
  { id: 'month', label: 'Bulanan' },
];

/** Weekly or monthly dues: switch on with an amount, then tick off who has paid this period. */
export function DuesCard({ amount, period, members, paid, onSet, onPay }: Props) {
  const styles = useStyles(makeStyles);
  const [editing, setEditing] = useState(false);

  if (amount === null || editing) {
    return (
      <DuesForm
        initial={amount}
        period={period}
        onSave={(a, p) => {
          setEditing(false);
          onSet(a, p);
        }}
        onCancel={amount === null ? undefined : () => setEditing(false)}
      />
    );
  }

  return (
    <View style={styles.card}>
      <Txt variant="heading">{period === 'week' ? 'Iuran pekan ini' : 'Iuran bulan ini'}</Txt>
      <Txt variant="caption">
        {formatRupiah(amount)} per orang · {paid.size}/{members.length} lunas
      </Txt>
      {members.map((m) => (
        <View key={m.userId} style={styles.row}>
          <Txt variant="bold" numberOfLines={1} style={styles.flex}>
            {m.name}
          </Txt>
          {paid.has(m.userId) ? <Txt variant="bold">Lunas</Txt> : <ClayButton label="Catat bayar" tone="soft" onPress={() => onPay(m)} />}
        </View>
      ))}
      <ClayButton label="Ubah iuran" tone="soft" onPress={() => setEditing(true)} />
      <ClayButton label="Matikan iuran" tone="soft" onPress={() => onSet(null, period)} />
    </View>
  );
}

type FormProps = {
  initial: number | null;
  period: DuesPeriod;
  onSave: (amount: number, period: DuesPeriod) => void;
  onCancel?: () => void;
};

function DuesForm({ initial, period, onSave, onCancel }: FormProps) {
  const styles = useStyles(makeStyles);
  const [draft, setDraft] = useState(initial ? String(initial) : '');
  const [picked, setPicked] = useState<DuesPeriod>(period);
  const value = parseRupiah(draft);
  return (
    <View style={styles.card}>
      <PillTabs options={PERIODS} value={picked} onChange={setPicked} />
      <TextField label="Iuran per orang (Rp)" value={draft} onChangeText={setDraft} keyboardType="number-pad" maxLength={11} placeholder="20000" />
      <ClayButton label={onCancel ? 'Simpan' : 'Aktifkan iuran'} tone="soft" disabled={value === 0} onPress={() => onSave(value, picked)} />
      {onCancel && <ClayButton label="Batal" tone="soft" onPress={onCancel} />}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: { ...clayOf(c), padding: space.md, gap: space.sm },
    row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 48 },
    flex: { flex: 1 },
  });
