import { StyleSheet, View } from 'react-native';

import { ClayButton } from '@/components/ui/ClayButton';
import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, space } from '@/constants/theme';
import { type CashEntry, type DuesPeriod, formatPeriodStart, formatRupiah, paidFor, paidThrough } from '@/domain/cash';
import { useStyles } from '@/hooks/useStyles';
import type { MemberToday } from '@/services/groupService';

type Props = {
  amount: number;
  period: DuesPeriod;
  members: MemberToday[];
  entries: CashEntry[];
  periodStart: string;
  canManage: boolean;
  onPay: (member: MemberToday) => void;
  onEdit: () => void;
  onOff: () => void;
};

/** Who has paid this period, and how far ahead each member is paid up to. */
export function DuesMemberList({ amount, period, members, entries, periodStart, canManage, onPay, onEdit, onOff }: Props) {
  const styles = useStyles(makeStyles);
  const paid = paidFor(entries, periodStart);
  return (
    <View style={styles.card}>
      <Txt variant="heading">{period === 'week' ? 'Iuran pekan ini' : 'Iuran bulan ini'}</Txt>
      <Txt variant="caption">
        {formatRupiah(amount)} per orang · {paid.size}/{members.length} lunas
      </Txt>
      {members.map((m) => (
        <MemberRow key={m.userId} member={m} through={paidThrough(entries, m.userId, periodStart, period)} period={period} onPay={onPay} />
      ))}
      {canManage && <ClayButton label="Ubah iuran" tone="soft" onPress={onEdit} />}
      {canManage && <ClayButton label="Matikan iuran" tone="soft" onPress={onOff} />}
    </View>
  );
}

type RowProps = {
  member: MemberToday;
  /** Last period the member is paid up to, or null when this period is still unpaid. */
  through: string | null;
  period: DuesPeriod;
  onPay: (member: MemberToday) => void;
};

function MemberRow({ member, through, period, onPay }: RowProps) {
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.row}>
      <View style={styles.flex}>
        <Txt variant="bold" numberOfLines={1}>
          {member.name}
        </Txt>
        {through && <Txt variant="caption">Lunas s/d {formatPeriodStart(through, period)}</Txt>}
      </View>
      <ClayButton label={through ? 'Tambah' : 'Catat bayar'} tone="soft" onPress={() => onPay(member)} />
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: { ...clayOf(c), padding: space.md, gap: space.sm },
    row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 48 },
    flex: { flex: 1 },
  });
