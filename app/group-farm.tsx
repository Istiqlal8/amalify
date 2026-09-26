import { router, Stack, useLocalSearchParams } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { GroupFarmScene } from '@/components/farm/GroupFarmScene';
import { ClayButton } from '@/components/ui/ClayButton';
import { SoftBackdrop } from '@/components/ui/SoftBackdrop';
import { stackHeader } from '@/components/ui/stackHeader';
import { Txt } from '@/components/ui/Txt';
import { space } from '@/constants/theme';
import { useGroups, useMembersToday } from '@/hooks/useGroups';
import { useMyUserId } from '@/hooks/useMyUserId';
import { useAuth } from '@/providers/AuthProvider';
import { useLogs } from '@/providers/LogsProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { supabase } from '@/services/supabase';

/** Group farm ("main bareng"): every member's bed for today, and everyone on the farm walking together. */
export default function GroupFarmScreen() {
  const { colors } = useTheme();
  const { user, groupsReady } = useAuth();
  const { list } = useGroups(groupsReady);
  const { group: groupId } = useLocalSearchParams<{ group?: string }>();
  const group = list.find((g) => g.id === groupId) ?? list[0] ?? null;
  const { today } = useLogs();
  const members = useMembersToday(group?.id ?? null, today);
  const me = useMyUserId();
  const myName = members.find((m) => m.userId === me)?.name ?? user?.user.name ?? 'Teman';
  const header = <Stack.Screen options={{ title: group?.name ?? 'Kebun grup', ...stackHeader(colors) }} />;

  const reason = !supabase ? 'Grup belum dikonfigurasi.' : !user ? 'Masuk di tab Akun dulu, lalu main bareng di kebun grup.' : !group ? 'Gabung grup dulu di tab Grup.' : null;
  if (reason || !group || !me) return <Gate header={header} message={reason ?? 'Memuat kebun…'} />;
  return (
    <>
      {header}
      <GroupFarmScene groupId={group.id} members={members} userId={me} name={myName} />
    </>
  );
}

function Gate({ header, message }: { header: ReactNode; message: string }) {
  return (
    <View style={styles.gate}>
      <SoftBackdrop />
      {header}
      <Txt style={styles.message}>{message}</Txt>
      <ClayButton label="Kembali" tone="soft" onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  gate: { flex: 1, padding: space.lg, gap: space.md, justifyContent: 'center' },
  message: { textAlign: 'center' },
});
