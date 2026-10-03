import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { DuesMemberList } from '@/components/kas/DuesMemberList';
import { DuesPayForm } from '@/components/kas/DuesPayForm';
import { ClayButton } from '@/components/ui/ClayButton';
import { FormDialog } from '@/components/ui/FormDialog';
import { PillTabs } from '@/components/ui/PillTabs';
import { TextField } from '@/components/ui/TextField';
import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, space } from '@/constants/theme';
import { type CashEntry, type DuesPeriod, parseRupiah, unpaidPeriodStarts } from '@/domain/cash';
import { useStyles } from '@/hooks/useStyles';
import type { MemberToday } from '@/services/groupService';

type Props = {
  amount: number | null;
  period: DuesPeriod;
  members: MemberToday[];
  entries: CashEntry[];
  /** Start of the period containing today. */
  periodStart: string;
  /** Only an admin or a bendahara may switch the dues on, change it or turn it off. */
  canManage: boolean;
  onSet: (amount: number | null, period: DuesPeriod) => void;
  onPay: (member: MemberToday, starts: string[]) => void;
};

const PERIODS: { id: DuesPeriod; label: string }[] = [
  { id: 'week', label: 'Pekanan' },
  { id: 'month', label: 'Bulanan' },
];

/** Far enough ahead for a year of monthly dues; longer runs are almost always a typo. */
const MAX_AHEAD = 24;

/** Weekly or monthly dues: switch on with an amount, then record who has paid and how far ahead. */
export function DuesCard({ amount, period, members, entries, periodStart, canManage, onSet, onPay }: Props) {
  const [editing, setEditing] = useState(false);
  const [paying, setPaying] = useState<MemberToday | null>(null);

  function saveAmount(a: number, p: DuesPeriod) {
    setEditing(false);
    onSet(a, p);
  }

  if (amount === null && !canManage) return <Txt variant="caption">Belum ada iuran.</Txt>;
  // Nothing to put a dialog over until the dues exist, so the first form is the card itself.
  if (amount === null) return <DuesForm initial={amount} period={period} onSave={saveAmount} />;

  return (
    <>
      <DuesMemberList
        amount={amount}
        period={period}
        members={members}
        entries={entries}
        periodStart={periodStart}
        canManage={canManage}
        onPay={setPaying}
        onEdit={() => setEditing(true)}
        onOff={() => onSet(null, period)}
      />
      {editing && (
        <FormDialog onClose={() => setEditing(false)}>
          <DuesForm initial={amount} period={period} onSave={saveAmount} onCancel={() => setEditing(false)} />
        </FormDialog>
      )}
      {paying && <PayDialog member={paying} amount={amount} period={period} entries={entries} periodStart={periodStart} onPay={onPay} onClose={() => setPaying(null)} />}
    </>
  );
}

type PayProps = Pick<Props, 'entries' | 'period' | 'periodStart' | 'onPay'> & {
  member: MemberToday;
  amount: number;
  onClose: () => void;
};

function PayDialog({ member, amount, period, entries, periodStart, onPay, onClose }: PayProps) {
  const starts = unpaidPeriodStarts(entries, member.userId, periodStart, period, MAX_AHEAD);
  function save(picked: string[]) {
    onClose();
    onPay(member, picked);
  }
  return (
    <FormDialog onClose={onClose}>
      <DuesPayForm memberName={member.name} amount={amount} period={period} starts={starts} onSave={save} onCancel={onClose} />
    </FormDialog>
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
  });
