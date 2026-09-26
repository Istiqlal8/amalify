import { GroupGate } from '@/components/group/GroupGate';
import { MemberGarden } from '@/components/group/MemberGarden';
import { StackScreen } from '@/components/ui/StackScreen';
import { useMembersToday } from '@/hooks/useGroups';
import { useLogs } from '@/providers/LogsProvider';
import type { Group } from '@/services/groupService';

export default function MembersScreen() {
  return (
    <StackScreen title="Anggota">
      <GroupGate>{(group) => <Members group={group} />}</GroupGate>
    </StackScreen>
  );
}

function Members({ group }: { group: Group }) {
  const { today } = useLogs();
  const members = useMembersToday(group.id, today);
  return <MemberGarden group={group} members={members} />;
}
