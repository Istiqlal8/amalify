import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ClayButton } from '@/components/ui/ClayButton';
import { TextField } from '@/components/ui/TextField';
import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, space } from '@/constants/theme';
import { formatRupiah, parseRupiah } from '@/domain/cash';
import { useStyles } from '@/hooks/useStyles';
import type { MemberToday } from '@/services/groupService';

type Props = {
  amount: number | null;
  members: MemberToday[];
  paid: Set<string>;
  onSetAmount: (amount: number | null) => void;
  onPay: (member: MemberToday) => void;
};

/** Monthly dues: switch on with an amount, then tick off who has paid this month. */
export function DuesCard({ amount, members, paid, onSetAmount, onPay }: Props) {
  const styles = useStyles(makeStyles);
  const [draft, setDraft] = useState('');

  if (amount === null) {
    return (
      <View style={styles.card}>
        <TextField label="Iuran bulanan (Rp)" value={draft} onChangeText={setDraft} keyboardType="number-pad" maxLength={11} placeholder="20000" />
        <ClayButton label="Aktifkan iuran" tone="soft" disabled={parseRupiah(draft) === 0} onPress={() => onSetAmount(parseRupiah(draft))} />
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Txt variant="heading">Iuran bulan ini</Txt>
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
      <ClayButton label="Matikan iuran" tone="soft" onPress={() => onSetAmount(null)} />
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: { ...clayOf(c), padding: space.md, gap: space.sm },
    row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 48 },
    flex: { flex: 1 },
  });
