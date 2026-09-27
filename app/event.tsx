import { useState } from 'react';
import { Alert } from 'react-native';

import { EventCard } from '@/components/event/EventCard';
import { EventForm } from '@/components/event/EventForm';
import { GroupGate } from '@/components/group/GroupGate';
import { ClayButton } from '@/components/ui/ClayButton';
import { StackScreen } from '@/components/ui/StackScreen';
import { Txt } from '@/components/ui/Txt';
import { sortEvents, type EventDraft, type GroupEvent } from '@/domain/groupEvent';
import { useGroupData } from '@/hooks/useGroupData';
import { useMembersToday } from '@/hooks/useGroups';
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
  const isAdmin = members.some((m) => m.userId === me && m.role === 'admin');
  const nameOf = (id: string | null) => members.find((m) => m.userId === id)?.name ?? null;

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
      {editing === 'new' ? (
        <EventForm today={today} members={members} onSave={save} onCancel={() => setEditing(null)} />
      ) : (
        <ClayButton label="Tambah program" onPress={() => setEditing('new')} />
      )}
      {error && <Txt style={{ color: colors.destructive }}>{error}</Txt>}
      {data.length === 0 && editing !== 'new' && <Txt variant="caption">Belum ada program.</Txt>}
      {sortEvents(data, new Date()).map((e) =>
        editing === e.id ? (
          <EventForm key={e.id} today={today} members={members} initial={e} onSave={save} onCancel={() => setEditing(null)} />
        ) : (
          <EventCard
            key={e.id}
            event={e}
            picName={nameOf(e.pic)}
            canManage={e.createdBy === me || isAdmin}
            onProgress={(value) => run((db) => setEventProgress(db, e.id, value))}
            onEdit={() => setEditing(e.id)}
            onRemove={() => confirmRemove(e)}
          />
        ),
      )}
    </>
  );
}
