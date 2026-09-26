import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { GroupGate } from '@/components/group/GroupGate';
import { CashForm } from '@/components/kas/CashForm';
import { CashList } from '@/components/kas/CashList';
import { DuesCard } from '@/components/kas/DuesCard';
import { ClayButton } from '@/components/ui/ClayButton';
import { StackScreen } from '@/components/ui/StackScreen';
import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, space } from '@/constants/theme';
import { balance, formatRupiah, monthOf, paidFor } from '@/domain/cash';
import { useGroupData } from '@/hooks/useGroupData';
import { useMembersToday } from '@/hooks/useGroups';
import { useMyUserId } from '@/hooks/useMyUserId';
import { useStyles } from '@/hooks/useStyles';
import { useLogs } from '@/providers/LogsProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { addCash, listCash, removeCash, setDues, type CashDraft } from '@/services/cashService';
import type { Group, MemberToday } from '@/services/groupService';

export default function KasScreen() {
  return (
    <StackScreen title="Kas grup">
      <GroupGate>{(group, refreshGroups) => <GroupCash group={group} refreshGroups={refreshGroups} />}</GroupGate>
    </StackScreen>
  );
}

function GroupCash({ group, refreshGroups }: { group: Group; refreshGroups: () => Promise<void> }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { today } = useLogs();
  const me = useMyUserId();
  const members = useMembersToday(group.id, today);
  const { data, error, run } = useGroupData(group.id, listCash, 'cash_entries');
  const [adding, setAdding] = useState(false);
  const month = monthOf(today);

  function save(draft: CashDraft) {
    setAdding(false);
    run((db) => addCash(db, group.id, draft));
  }

  function pay(member: MemberToday) {
    const amount = group.dues_amount ?? 0;
    run((db) => addCash(db, group.id, { amount, note: `Iuran ${member.name}`, day: today, duesFor: member.userId, duesMonth: month }));
  }

  return (
    <>
      <View style={styles.saldo}>
        <Txt variant="caption">Saldo</Txt>
        <Txt variant="title">{formatRupiah(balance(data))}</Txt>
      </View>
      <DuesCard
        amount={group.dues_amount}
        members={members}
        paid={paidFor(data, month)}
        onSetAmount={(amount) => run((db) => setDues(db, group.id, amount)).then(refreshGroups)}
        onPay={pay}
      />
      {adding ? (
        <CashForm today={today} onSave={save} onCancel={() => setAdding(false)} />
      ) : (
        <ClayButton label="Catat kas" onPress={() => setAdding(true)} />
      )}
      {error && <Txt style={{ color: colors.destructive }}>{error}</Txt>}
      <CashList entries={data} me={me} onRemove={(id) => run((db) => removeCash(db, id))} />
    </>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    saldo: { ...clayOf(c), padding: space.md, gap: space.xs },
  });
