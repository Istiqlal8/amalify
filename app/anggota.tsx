import { GroupGate } from '@/components/group/GroupGate';
import { MemberGarden } from '@/components/group/MemberGarden';
import { MemberRoleDialog } from '@/components/group/MemberRoleDialog';
import { ClayButton } from '@/components/ui/ClayButton';
import { StackScreen } from '@/components/ui/StackScreen';
import { Txt } from '@/components/ui/Txt';
import { useMemberActions } from '@/hooks/useMemberActions';
import { useMembersToday } from '@/hooks/useGroups';
import { useMyRole } from '@/hooks/useMyRole';
import { useMyUserId } from '@/hooks/useMyUserId';
import { useLogs } from '@/providers/LogsProvider';
import { useTheme } from '@/providers/ThemeProvider';
import type { Group } from '@/services/groupService';

export default function MembersScreen() {
  return (
    <StackScreen title="Anggota">
      <GroupGate>{(group) => <Members group={group} />}</GroupGate>
    </StackScreen>
  );
}

function Members({ group }: { group: Group }) {
  const { colors } = useTheme();
  const { today } = useLogs();
  const me = useMyUserId();
  const members = useMembersToday(group.id, today);
  const { error, managed, manage, closeManage, setRole, remove, leave } = useMemberActions(group.id, group.name, me);
  const { isAdmin } = useMyRole(members, me);
  return (
    <>
      <MemberGarden group={group} members={members} onPressMember={isAdmin ? manage : undefined} />
      {managed && <MemberRoleDialog member={managed} onSetRole={setRole} onRemove={remove} onClose={closeManage} />}
      {error && <Txt style={{ color: colors.destructive }}>{error}</Txt>}
      <ClayButton label="Keluar grup" tone="soft" onPress={leave} />
    </>
  );
}
