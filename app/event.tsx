import { useState } from 'react';
import { Alert } from 'react-native';

import { EventCard } from '@/components/event/EventCard';
import { EventForm } from '@/components/event/EventForm';
import { GroupGate } from '@/components/group/GroupGate';
import { ClayButton } from '@/components/ui/ClayButton';
import { FormDialog } from '@/components/ui/FormDialog';
import { StackScreen } from '@/components/ui/StackScreen';
import { Txt } from '@/components/ui/Txt';
import { sortEvents, type EventDraft, type GroupEvent } from '@/domain/groupEvent';
import { useGroupData } from '@/hooks/useGroupData';
import { useMembersToday } from '@/hooks/useGroups';
import { useMyRole } from '@/hooks/useMyRole';
import { useMyUserId } from '@/hooks/useMyUserId';
import { useLogs } from '@/providers/LogsProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { addEvent, listEvents, removeEvent, setEventProgress, updateEvent } from '@/services/eventService';
import type { Group } from '@/services/groupService';

export default function EventScreen() {
  return (
    <StackScreen title="Event">
      <GroupGate>{(group) => <GroupEvents group={group} />}</GroupGate>
    </StackScreen>
  );
}

function GroupEvents({ group }: { group: Group }) {
  const { colors } = useTheme();
  const { today } = useLogs();
  const me = useMyUserId();
  const members = useMembersToday(group.id, today);
  const { data, error, run } = useGroupData(group.id, listEvents, 'group_events');
  /** 'new' for the add form, an event id while editing it, or null. */
  const [editing, setEditing] = useState<string | null>(null);
  const { canManageRecords } = useMyRole(members, me);
  const nameOf = (id: string | null) => members.find((m) => m.userId === id)?.name ?? null;
  const edited = data.find((e) => e.id === editing);

  function save(draft: EventDraft) {
    const id = editing;
    setEditing(null);
    run((db) => (id === 'new' ? addEvent(db, group.id, draft) : updateEvent(db, id!, draft)));
  }

  function confirmRemove(event: GroupEvent) {
    Alert.alert(`Hapus "${event.title}"?`, undefined, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => run((db) => removeEvent(db, event.id)) },
    ]);
  }

  return (
    <>
      <ClayButton label="Tambah program" onPress={() => setEditing('new')} />
      {error && <Txt style={{ color: colors.destructive }}>{error}</Txt>}
      {data.length === 0 && <Txt variant="caption">Belum ada program.</Txt>}
      {sortEvents(data, new Date()).map((e) => (
        <EventCard
          key={e.id}
          event={e}
          picName={nameOf(e.pic)}
          canManage={e.createdBy === me || canManageRecords}
          onProgress={(value) => run((db) => setEventProgress(db, e.id, value))}
          onEdit={() => setEditing(e.id)}
          onRemove={() => confirmRemove(e)}
        />
      ))}
      {editing && (
        <FormDialog onClose={() => setEditing(null)}>
          <EventForm key={editing} today={today} members={members} initial={edited} onSave={save} onCancel={() => setEditing(null)} />
        </FormDialog>
      )}
    </>
  );
}
